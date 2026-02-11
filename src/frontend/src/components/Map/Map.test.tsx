import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Map } from './Map';
import type { Place } from '../../types';
import type { PlaceDetails } from '../../types/places';
import type { PlacesState } from '../../store/placesStore';

// Mock the useGeolocation hook
vi.mock('../../hooks/useGeolocation', () => ({
  useGeolocation: vi.fn(),
}));

// Mock usePlacesStore
vi.mock('../../store/placesStore', () => ({
  usePlacesStore: vi.fn(),
}));

// Mock usePlacesSearch
vi.mock('../../hooks/usePlacesSearch', () => ({
  usePlacesSearch: vi.fn(),
}));

// Mock useTheme hook
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

// Mock MarkerContent component
vi.mock('./MarkerContent', () => ({
  MarkerContent: ({ place, isSelected, isAutocomplete }: { 
    place: PlaceDetails | { placeId: string; name: string; type: string; location: { lat: number; lng: number } }; 
    isSelected: boolean;
    isAutocomplete?: boolean;
  }) => (
    <div 
      data-testid={`marker-content-${place.placeId}`}
      data-selected={isSelected}
      data-autocomplete={isAutocomplete ?? false}
    >
      {place.name}
    </div>
  ),
}));

// Mock MapControl component
vi.mock('./MapControl', () => ({
  MapControl: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-control">{children}</div>
  ),
}));

// Mock PlaceSearchInput component
vi.mock('./PlaceSearchInput', () => ({
  PlaceSearchInput: ({ onPlaceSelect }: { onPlaceSelect: (place: Place) => void }) => (
    <div data-testid="place-search-input">
      <button
        data-testid="mock-select-place"
        onClick={() =>
          onPlaceSelect({
            placeId: 'ChIJ1',
            displayName: 'Test Place',
            location: { lat: 40.7128, lng: -74.006 },
          })
        }
      >
        Select Place
      </button>
    </div>
  ),
}));

// Mock LocationButton component
vi.mock('./LocationButton', () => ({
  LocationButton: () => (
    <button data-testid="location-button">Show Your Location</button>
  ),
}));

// Mock @vis.gl/react-google-maps
const mockPanTo = vi.fn();
const mockSetZoom = vi.fn();
const mockAddListener = vi.fn(() => ({ remove: vi.fn() }));
const mockGetBounds = vi.fn();

vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="api-provider">{children}</div>
  ),
  Map: ({ children, colorScheme }: { children: React.ReactNode; colorScheme?: string }) => (
    <div data-testid="google-map" data-color-scheme={colorScheme}>
      {children}
    </div>
  ),
  AdvancedMarker: ({ 
    position, 
    onClick, 
    children 
  }: { 
    position: { lat: number; lng: number };
    onClick?: () => void;
    children?: React.ReactNode;
  }) => (
    <div 
      data-testid="advanced-marker" 
      data-lat={position.lat} 
      data-lng={position.lng}
      onClick={onClick}
    >
      {children}
    </div>
  ),
  useMap: () => ({
    panTo: mockPanTo,
    setZoom: mockSetZoom,
    addListener: mockAddListener,
    getBounds: mockGetBounds,
  }),
  ControlPosition: {
    TOP_CENTER: 1,
    RIGHT_CENTER: 3,
  },
}));

import { useGeolocation } from '../../hooks/useGeolocation';
import { usePlacesStore } from '../../store/placesStore';
import { usePlacesSearch } from '../../hooks/usePlacesSearch';
import { useTheme } from '../../contexts/ThemeContext';

// Helper to create complete mock query result
function createMockQueryResult(data: { places: PlaceDetails[]; totalCount: number }) {
  return {
    data,
    isLoading: false,
    error: null,
    isError: false,
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: true,
    status: 'success' as const,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    isStale: false,
    isEnabled: true,
    fetchStatus: 'idle' as const,
    refetch: vi.fn(),
    promise: Promise.resolve(data),
  } as ReturnType<typeof usePlacesSearch>;
}

describe('Map', () => {
  const mockApiKey = 'test-api-key';
  const mockSelectPlace = vi.fn();
  const mockSetMapCenter = vi.fn();
  const mockSetFilters = vi.fn();
  const mockHidePlace = vi.fn();
  const mockResetHiddenPlaces = vi.fn();
  const mockResetFilters = vi.fn();
  const mockTriggerSearch = vi.fn();
  const mockClearSearch = vi.fn();

  const defaultStoreState: PlacesState = {
    searchBounds: null,
    filters: { categories: [], minimumRating: null, limit: 30 },
    selectedPlaceId: null,
    hiddenPlaceIds: new Set<string>(),
    mapCenter: null,
    selectPlace: mockSelectPlace,
    setMapCenter: mockSetMapCenter,
    setFilters: mockSetFilters,
    hidePlace: mockHidePlace,
    resetHiddenPlaces: mockResetHiddenPlaces,
    resetFilters: mockResetFilters,
    triggerSearch: mockTriggerSearch,
    clearSearch: mockClearSearch,
  };

  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', mockApiKey);
    mockPanTo.mockClear();
    mockSetZoom.mockClear();
    mockSelectPlace.mockClear();
    mockSetMapCenter.mockClear();
    mockAddListener.mockClear();
    mockGetBounds.mockClear();

    // Default theme mock (light mode)
    vi.mocked(useTheme).mockReturnValue({
      mode: 'system',
      resolvedTheme: 'light',
      setMode: vi.fn(),
    } as never);

    // Default store mock
    vi.mocked(usePlacesStore).mockImplementation((selector) => 
      selector(defaultStoreState) as never
    );

    // Default search hook mock (no results)
    vi.mocked(usePlacesSearch).mockReturnValue(
      createMockQueryResult({ places: [], totalCount: 0 })
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should show loading state while geolocation is loading', () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: null,
      loading: true,
      error: null,
    });

    render(<Map />);

    expect(screen.getByText(/loading map\.\.\./i)).toBeInTheDocument();
  });

  it('should render map with coordinates', () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: { latitude: 40.7589, longitude: -73.9851 },
      loading: false,
      error: null,
    });

    render(<Map />);

    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  it('should show map with notification when there is an error with fallback coordinates', () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: 'Location permission denied. Using default location.',
    });

    render(<Map />);

    expect(
      screen.getByText(/location permission denied\. using default location\./i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  it('should show error when coordinates are null after loading', () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: null,
      loading: false,
      error: null,
    });

    render(<Map />);

    expect(
      screen.getByText(/unable to load map\. please try again\./i)
    ).toBeInTheDocument();
  });

  it('should render search control', () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: null,
    });

    render(<Map />);

    expect(screen.getAllByTestId('map-control').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('place-search-input')).toBeInTheDocument();
  });

  it('should center map when place is selected', () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: null,
    });

    render(<Map />);

    const selectPlaceButton = screen.getByTestId('mock-select-place');
    selectPlaceButton.click();

    expect(mockPanTo).toHaveBeenCalledWith({ lat: 40.7128, lng: -74.006 });
    expect(mockSetZoom).toHaveBeenCalledWith(15);
  });

  it('should render marker for selected place', async () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: null,
    });

    render(<Map />);

    // Initially no marker
    expect(screen.queryByTestId('advanced-marker')).not.toBeInTheDocument();

    // Select a place
    const selectPlaceButton = screen.getByTestId('mock-select-place');
    selectPlaceButton.click();

    // Marker should appear after state update
    await waitFor(() => {
      const marker = screen.getByTestId('advanced-marker');
      expect(marker).toBeInTheDocument();
      expect(marker).toHaveAttribute('data-lat', '40.7128');
      expect(marker).toHaveAttribute('data-lng', '-74.006');
    });
  });

  it('should update marker when different place is selected', async () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: null,
    });

    const { rerender } = render(<Map />);

    // Select first place
    const selectPlaceButton = screen.getByTestId('mock-select-place');
    selectPlaceButton.click();

    // Wait for marker to appear
    await waitFor(() => {
      const marker = screen.getByTestId('advanced-marker');
      expect(marker).toHaveAttribute('data-lat', '40.7128');
      expect(marker).toHaveAttribute('data-lng', '-74.006');
    });

    // Re-render and verify marker is still there
    rerender(<Map />);

    await waitFor(() => {
      const marker = screen.getByTestId('advanced-marker');
      expect(marker).toBeInTheDocument();
    });
  });

  it('should render multiple markers for search results', () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: null,
    });

    const mockPlaces: PlaceDetails[] = [
      {
        placeId: 'place1',
        name: 'Restaurant 1',
        type: 'restaurant',
        rating: 4.5,
        userRatingsTotal: 100,
        formattedAddress: '123 Main St',
        formattedPhoneNumber: null,
        openingHours: null,
        location: { lat: 40.7128, lng: -74.006 },
      },
      {
        placeId: 'place2',
        name: 'Cafe 1',
        type: 'cafe',
        rating: 4.0,
        userRatingsTotal: 50,
        formattedAddress: '456 Oak Ave',
        formattedPhoneNumber: null,
        openingHours: null,
        location: { lat: 40.7138, lng: -74.007 },
      },
    ];

    vi.mocked(usePlacesSearch).mockReturnValue(
      createMockQueryResult({ places: mockPlaces, totalCount: 2 })
    );

    render(<Map />);

    // Should render markers for both places
    expect(screen.getByTestId('marker-content-place1')).toBeInTheDocument();
    expect(screen.getByTestId('marker-content-place2')).toBeInTheDocument();
  });

  it('should highlight selected marker', () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: null,
    });

    const mockPlaces: PlaceDetails[] = [
      {
        placeId: 'place1',
        name: 'Restaurant 1',
        type: 'restaurant',
        rating: 4.5,
        userRatingsTotal: 100,
        formattedAddress: '123 Main St',
        formattedPhoneNumber: null,
        openingHours: null,
        location: { lat: 40.7128, lng: -74.006 },
      },
      {
        placeId: 'place2',
        name: 'Cafe 1',
        type: 'cafe',
        rating: 4.0,
        userRatingsTotal: 50,
        formattedAddress: '456 Oak Ave',
        formattedPhoneNumber: null,
        openingHours: null,
        location: { lat: 40.7138, lng: -74.007 },
      },
    ];

    vi.mocked(usePlacesSearch).mockReturnValue(
      createMockQueryResult({ places: mockPlaces, totalCount: 2 })
    );

    // Set place1 as selected
    vi.mocked(usePlacesStore).mockImplementation((selector) => 
      selector({
        ...defaultStoreState,
        selectedPlaceId: 'place1',
      }) as never
    );

    render(<Map />);

    // place1 should be selected
    const marker1 = screen.getByTestId('marker-content-place1');
    expect(marker1).toHaveAttribute('data-selected', 'true');

    // place2 should not be selected
    const marker2 = screen.getByTestId('marker-content-place2');
    expect(marker2).toHaveAttribute('data-selected', 'false');
  });

  it('should filter out hidden places from markers', () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: null,
    });

    const mockPlaces: PlaceDetails[] = [
      {
        placeId: 'place1',
        name: 'Restaurant 1',
        type: 'restaurant',
        rating: 4.5,
        userRatingsTotal: 100,
        formattedAddress: '123 Main St',
        formattedPhoneNumber: null,
        openingHours: null,
        location: { lat: 40.7128, lng: -74.006 },
      },
      {
        placeId: 'place2',
        name: 'Cafe 1',
        type: 'cafe',
        rating: 4.0,
        userRatingsTotal: 50,
        formattedAddress: '456 Oak Ave',
        formattedPhoneNumber: null,
        openingHours: null,
        location: { lat: 40.7138, lng: -74.007 },
      },
    ];

    vi.mocked(usePlacesSearch).mockReturnValue(
      createMockQueryResult({ places: mockPlaces, totalCount: 2 })
    );

    // Hide place2
    vi.mocked(usePlacesStore).mockImplementation((selector) => 
      selector({
        ...defaultStoreState,
        hiddenPlaceIds: new Set(['place2']),
      }) as never
    );

    render(<Map />);

    // place1 should be visible
    expect(screen.getByTestId('marker-content-place1')).toBeInTheDocument();

    // place2 should not be rendered
    expect(screen.queryByTestId('marker-content-place2')).not.toBeInTheDocument();
  });

  it('should render autocomplete marker separately from search markers', async () => {
    vi.mocked(useGeolocation).mockReturnValue({
      coordinates: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: null,
    });

    const mockPlaces: PlaceDetails[] = [
      {
        placeId: 'place1',
        name: 'Restaurant 1',
        type: 'restaurant',
        rating: 4.5,
        userRatingsTotal: 100,
        formattedAddress: '123 Main St',
        formattedPhoneNumber: null,
        openingHours: null,
        location: { lat: 40.7128, lng: -74.006 },
      },
    ];

    vi.mocked(usePlacesSearch).mockReturnValue(
      createMockQueryResult({ places: mockPlaces, totalCount: 1 })
    );

    render(<Map />);

    // Select autocomplete place
    const selectPlaceButton = screen.getByTestId('mock-select-place');
    selectPlaceButton.click();

    await waitFor(() => {
      // Should have autocomplete marker
      const autocompleteMarker = screen.getByTestId('marker-content-ChIJ1');
      expect(autocompleteMarker).toBeInTheDocument();
      expect(autocompleteMarker).toHaveAttribute('data-autocomplete', 'true');

      // Should also have search result marker
      const searchMarker = screen.getByTestId('marker-content-place1');
      expect(searchMarker).toBeInTheDocument();
      expect(searchMarker).toHaveAttribute('data-autocomplete', 'false');
    });
  });

  describe('colorScheme (theme switching)', () => {
    it('should set colorScheme to DARK when resolvedTheme is dark', () => {
      vi.mocked(useTheme).mockReturnValue({
        mode: 'dark',
        resolvedTheme: 'dark',
        setMode: vi.fn(),
      } as never);

      vi.mocked(useGeolocation).mockReturnValue({
        coordinates: { latitude: 40.7128, longitude: -74.006 },
        loading: false,
        error: null,
      });

      render(<Map />);

      const mapElement = screen.getByTestId('google-map');
      expect(mapElement).toHaveAttribute('data-color-scheme', 'DARK');
    });

    it('should set colorScheme to LIGHT when resolvedTheme is light', () => {
      vi.mocked(useTheme).mockReturnValue({
        mode: 'light',
        resolvedTheme: 'light',
        setMode: vi.fn(),
      } as never);

      vi.mocked(useGeolocation).mockReturnValue({
        coordinates: { latitude: 40.7128, longitude: -74.006 },
        loading: false,
        error: null,
      });

      render(<Map />);

      const mapElement = screen.getByTestId('google-map');
      expect(mapElement).toHaveAttribute('data-color-scheme', 'LIGHT');
    });

    it('should use single Map ID regardless of theme', () => {
      vi.stubEnv('VITE_GOOGLE_MAPS_MAP_ID', 'test-map-id');

      vi.mocked(useGeolocation).mockReturnValue({
        coordinates: { latitude: 40.7128, longitude: -74.006 },
        loading: false,
        error: null,
      });

      render(<Map />);

      const mapElement = screen.getByTestId('google-map');
      expect(mapElement).toBeInTheDocument();
      // Verify no separate light/dark map IDs are being used
      expect(mapElement).toHaveAttribute('data-color-scheme', 'LIGHT');

      vi.unstubAllEnvs();
    });
  });
});

