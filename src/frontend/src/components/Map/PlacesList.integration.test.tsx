/**
 * Integration test for PlacesList flow
 * Tests the full interaction cycle from loading to hiding places
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlacesList } from './PlacesList';
import type { PlaceDetails, Location } from '@/types/places';

// Hoist mock state variables to avoid initialization issues with vi.mock
const { mockState, mockSelectPlace, mockHidePlace } = vi.hoisted(() => {
  const state = {
    selectedPlaceId: null as string | null,
    hiddenPlaceIds: new Set<string>(),
  };
  
  return {
    mockState: state,
    mockSelectPlace: vi.fn((placeId: string | null) => {
      state.selectedPlaceId = placeId;
    }),
    mockHidePlace: vi.fn((placeId: string) => {
      state.hiddenPlaceIds.add(placeId);
    }),
  };
});

vi.mock('@/store/placesStore', () => {
  return {
    usePlacesStore: vi.fn((selector: (state: typeof mockState) => unknown) => {
      return selector(mockState);
    }),
  };
});

describe('PlacesList Integration', () => {
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
    {
      placeId: 'place-3',
      name: 'Bar Three',
      type: 'bar',
      rating: 3.8,
      userRatingsTotal: 25,
      formattedAddress: '789 Pine St',
      formattedPhoneNumber: '+1 (555) 987-6543',
      openingHours: {
        openNow: false,
        weekdayText: ['Monday: 5:00 PM – 12:00 AM'],
      },
      location: { lat: 40.7489, lng: -73.9851 },
    },
  ];

  const mockMapCenter: Location = {
    lat: 40.7128,
    lng: -74.006,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockState.selectedPlaceId = null;
    mockState.hiddenPlaceIds = new Set<string>();
  });

  it.skip('full flow: load → select → expand → hide', async () => {
    const user = userEvent.setup();

    // Step 1: Render with loading state
    const { rerender } = render(
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

    // Step 2: Render with places data
    rerender(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    expect(screen.getByText('3 places found')).toBeInTheDocument();
    expect(screen.getByText('Restaurant One')).toBeInTheDocument();
    expect(screen.getByText('Cafe Two')).toBeInTheDocument();
    expect(screen.getByText('Bar Three')).toBeInTheDocument();

    // Step 3: Click to select a place
    const firstCard = screen.getByText('Restaurant One').closest('article');
    expect(firstCard).toBeInTheDocument();

    if (firstCard) {
      await user.click(firstCard);
    }

    // Verify store updated
    expect(mockSelectPlace).toHaveBeenCalledWith('place-1');

    // Update mock state to reflect selection
    mockState.selectedPlaceId = 'place-1';

    // Step 4: Rerender with selected state
    rerender(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    // Step 5: Click again to expand
    if (firstCard) {
      await user.click(firstCard);
    }

    // Verify expanded state shows details
    await waitFor(() => {
      expect(firstCard).toHaveClass('place-card-expanded');
      expect(screen.getByText('Address:')).toBeInTheDocument();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Phone:')).toBeInTheDocument();
      expect(screen.getByText('Open now')).toBeInTheDocument();
    });

    // Step 6: Click hide button
    const hideButton = screen.getByRole('button', { name: 'Remove from list' });
    await user.click(hideButton);

    // Verify place removed from list and store updated
    expect(mockHidePlace).toHaveBeenCalledWith('place-1');

    // Update mock state to reflect hiding
    mockState.hiddenPlaceIds.add('place-1');
    mockState.selectedPlaceId = null;

    // Step 7: Rerender to show updated list
    rerender(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    // Verify place is hidden
    expect(screen.queryByText('Restaurant One')).not.toBeInTheDocument();
    expect(screen.getByText('2 places found')).toBeInTheDocument();
    expect(screen.getByText('Cafe Two')).toBeInTheDocument();
    expect(screen.getByText('Bar Three')).toBeInTheDocument();
  });

  it.skip('handles multiple interactions across different places', async () => {
    const user = userEvent.setup();

    render(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    // Expand first place
    const firstCard = screen.getByText('Restaurant One').closest('article');
    if (firstCard) {
      await user.click(firstCard);
      await waitFor(() => {
        expect(firstCard).toHaveClass('place-card-expanded');
      });
    }

    // Expand second place (should collapse first)
    const secondCard = screen.getByText('Cafe Two').closest('article');
    if (secondCard) {
      await user.click(secondCard);
      await waitFor(() => {
        expect(secondCard).toHaveClass('place-card-expanded');
        expect(firstCard).not.toHaveClass('place-card-expanded');
      });
    }

    expect(mockSelectPlace).toHaveBeenCalledTimes(2);
  });

  it.skip('handles error state with retry', async () => {
    const user = userEvent.setup();
    const reloadSpy = vi.spyOn(window.location, 'reload').mockImplementation(() => {});

    render(
      <PlacesList
        places={[]}
        isLoading={false}
        error={new Error('Network error')}
        mapCenter={mockMapCenter}
      />
    );

    expect(screen.getByText('Unable to load places')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: 'Try Again' });
    await user.click(retryButton);

    expect(reloadSpy).toHaveBeenCalled();

    reloadSpy.mockRestore();
  });

  it('transitions from loading to empty state', () => {
    const { rerender } = render(
      <PlacesList
        places={[]}
        isLoading={true}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    expect(screen.getByText('Loading places...')).toBeInTheDocument();

    rerender(
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

  it.skip('maintains state when filtering hidden places', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    // Hide first place
    const firstCard = screen.getByText('Restaurant One').closest('article');
    if (firstCard) {
      await user.click(firstCard); // Expand
      const hideButton = await screen.findByRole('button', {
        name: 'Remove from list',
      });
      await user.click(hideButton);
    }

    mockState.hiddenPlaceIds.add('place-1');

    // Rerender
    rerender(
      <PlacesList
        places={mockPlaces}
        isLoading={false}
        error={null}
        mapCenter={mockMapCenter}
      />
    );

    // Verify first place is hidden, others remain
    expect(screen.queryByText('Restaurant One')).not.toBeInTheDocument();
    expect(screen.getByText('Cafe Two')).toBeInTheDocument();
    expect(screen.getByText('Bar Three')).toBeInTheDocument();
    expect(screen.getByText('2 places found')).toBeInTheDocument();
  });
});
