/**
 * PlacesList component tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlacesList } from './PlacesList';
import type { PlaceDetails, Location } from '@/types/places';

// Mock Zustand store
const mockSelectPlace = vi.fn();
const mockHidePlace = vi.fn();

type StoreSelector = (state: {
  selectedPlaceId: string | null;
  hiddenPlaceIds: Set<string>;
  selectPlace: typeof mockSelectPlace;
  hidePlace: typeof mockHidePlace;
}) => unknown;

vi.mock('@/store/placesStore', () => ({
  usePlacesStore: vi.fn((selector: StoreSelector) => {
    const state = {
      selectedPlaceId: null,
      hiddenPlaceIds: new Set<string>(),
      selectPlace: mockSelectPlace,
      hidePlace: mockHidePlace,
    };
    return selector(state);
  }),
}));

describe('PlacesList', () => {
  const mockPlaces: PlaceDetails[] = [
    {
      placeId: 'place-1',
      name: 'Restaurant One',
      type: 'restaurant',
      rating: 4.5,
      userRatingsTotal: 100,
      formattedAddress: '123 Main St',
      formattedPhoneNumber: '+1 (555) 123-4567',
      openingHours: {
        openNow: true,
        weekdayText: ['Monday: 9:00 AM – 5:00 PM'],
      },
      location: { lat: 40.7128, lng: -74.006 },
    },
    {
      placeId: 'place-2',
      name: 'Cafe Two',
      type: 'cafe',
      rating: 4.2,
      userRatingsTotal: 50,
      formattedAddress: '456 Oak Ave',
      formattedPhoneNumber: null,
      openingHours: null,
      location: { lat: 40.7589, lng: -73.9851 },
    },
  ];

  const mockMapCenter: Location = {
    lat: 40.7128,
    lng: -74.006,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state with skeletons', () => {
    render(
      <PlacesList
        places={[]}
        isLoading={true}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    expect(screen.getByText('Loading places...')).toBeInTheDocument();
    const skeletons = document.querySelectorAll('.place-card-skeleton');
    expect(skeletons.length).toBe(5);
  });

  it('renders error state with message', () => {
    const error = new Error('Failed to fetch places');

    render(
      <PlacesList
        places={[]}
        isLoading={false}
        error={error}
        mapCenter={mockMapCenter}
      />
    );

    expect(screen.getByText('Unable to load places')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch places')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
  });

  it('renders empty state when no places', () => {
    render(
      <PlacesList
        places={[]}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    expect(screen.getByText('No places found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your filters or searching in a different area.')
    ).toBeInTheDocument();
  });

  it('renders list of places', () => {
    render(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    expect(screen.getByText('2 places found')).toBeInTheDocument();
    expect(screen.getByText('Restaurant One')).toBeInTheDocument();
    expect(screen.getByText('Cafe Two')).toBeInTheDocument();
  });

  it('shows singular form when one place', () => {
    render(
      <PlacesList
        places={[mockPlaces[0]]}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    expect(screen.getByText('1 place found')).toBeInTheDocument();
  });

  it('handles place selection', async () => {
    const user = userEvent.setup();

    render(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    const placeName = screen.getByText('Restaurant One');
    await user.click(placeName);

    expect(mockSelectPlace).toHaveBeenCalledWith('place-1');
  });

  it('expands only one card at a time', async () => {
    const user = userEvent.setup();

    render(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    const firstCard = screen.getByText('Restaurant One').closest('article');
    const secondCard = screen.getByText('Cafe Two').closest('article');

    if (firstCard && secondCard) {
      // Expand first card by clicking place name
      const firstName = screen.getByText('Restaurant One');
      await user.click(firstName);
      await waitFor(() => {
        expect(firstCard).toHaveClass('place-card-expanded');
      });

      // Expand second card - first should collapse
      const secondName = screen.getByText('Cafe Two');
      await user.click(secondName);
      await waitFor(() => {
        expect(secondCard).toHaveClass('place-card-expanded');
        expect(firstCard).not.toHaveClass('place-card-expanded');
      });
    }
  });

  it('handles hiding a place', async () => {
    const user = userEvent.setup();

    render(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    // Remove button is now in the header, available without expanding
    const removeButtons = screen.getAllByRole('button', {
      name: 'Remove from list',
    });
    
    // Click the remove button for the first place
    await user.click(removeButtons[0]);

    expect(mockHidePlace).toHaveBeenCalledWith('place-1');
  });

  it('filters out hidden places', async () => {
    const { usePlacesStore } = await import('@/store/placesStore');
    (usePlacesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: StoreSelector) => {
      const state = {
        selectedPlaceId: null,
        hiddenPlaceIds: new Set(['place-1']),
        selectPlace: mockSelectPlace,
        hidePlace: mockHidePlace,
      };
      return selector(state);
    });

    render(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    expect(screen.queryByText('Restaurant One')).not.toBeInTheDocument();
    expect(screen.getByText('Cafe Two')).toBeInTheDocument();
    expect(screen.getByText('1 place found')).toBeInTheDocument();
  });

  it('shows empty state when all places are hidden', async () => {
    const { usePlacesStore } = await import('@/store/placesStore');
    (usePlacesStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: StoreSelector) => {
      const state = {
        selectedPlaceId: null,
        hiddenPlaceIds: new Set(['place-1', 'place-2']),
        selectPlace: mockSelectPlace,
        hidePlace: mockHidePlace,
      };
      return selector(state);
    });

    render(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    expect(screen.getByText('No places found')).toBeInTheDocument();
  });

  it.skip('renders without map center', () => {
    render(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={null}
      />
    );

    expect(screen.getByText('Restaurant One')).toBeInTheDocument();
    expect(screen.getByText('Cafe Two')).toBeInTheDocument();
  });
});
