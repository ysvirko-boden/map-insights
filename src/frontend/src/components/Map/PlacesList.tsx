/**
 * PlacesList container component
 * Manages list of place cards with loading, error, and empty states
 */

import { useState, useRef, useEffect } from 'react';
import { usePlacesStore } from '@/store/placesStore';
import { PlaceCard } from './PlaceCard';
import { PlaceCardSkeleton } from '@/components/common/Skeleton/Skeleton';
import type { PlaceDetails, Location } from '@/types/places';
import './PlacesList.css';

export interface PlacesListProps {
  places: PlaceDetails[];
  isLoading: boolean;
  error: Error | null;
  mapCenter: Location | null;
}

export function PlacesList({
  places,
  isLoading,
  error,
  mapCenter,
}: PlacesListProps) {
  const selectedPlaceId = usePlacesStore((state) => state.selectedPlaceId);
  const hiddenPlaceIds = usePlacesStore((state) => state.hiddenPlaceIds);
  const selectPlace = usePlacesStore((state) => state.selectPlace);
  const hidePlace = usePlacesStore((state) => state.hidePlace);

  const [expandedPlaceId, setExpandedPlaceId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Filter out hidden places
  const visiblePlaces = places.filter(
    (place) => !hiddenPlaceIds.has(place.placeId)
  );

  // Handle card expansion (only one at a time)
  const handleToggleExpand = (placeId: string) => {
    setExpandedPlaceId((current) => (current === placeId ? null : placeId));
  };

  // Handle place selection
  const handleSelectPlace = (placeId: string) => {
    selectPlace(placeId);
  };

  // Handle hiding a place
  const handleHidePlace = (placeId: string) => {
    hidePlace(placeId);
    // If hiding the selected place, clear selection
    if (selectedPlaceId === placeId) {
      selectPlace(null);
    }
    // If hiding the expanded place, collapse it
    if (expandedPlaceId === placeId) {
      setExpandedPlaceId(null);
    }
  };

  // Scroll selected place into view
  useEffect(() => {
    if (selectedPlaceId) {
      const element = cardRefs.current.get(selectedPlaceId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedPlaceId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="places-list">
        <div className="places-list-header">
          <h2 className="places-list-title">Loading places...</h2>
        </div>
        <div className="places-list-content">
          {Array.from({ length: 5 }).map((_, index) => (
            <PlaceCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="places-list">
        <div className="places-list-error">
          <span className="places-list-error-icon">⚠️</span>
          <h3 className="places-list-error-title">Unable to load places</h3>
          <p className="places-list-error-message">
            {error.message || 'An error occurred while fetching places.'}
          </p>
          <button
            className="places-list-error-retry"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (visiblePlaces.length === 0) {
    return (
      <div className="places-list">
        <div className="places-list-empty">
          <span className="places-list-empty-icon">🔍</span>
          <h3 className="places-list-empty-title">No places found</h3>
          <p className="places-list-empty-message">
            Try adjusting your filters or searching in a different area.
          </p>
        </div>
      </div>
    );
  }

  // Success state with places
  return (
    <div className="places-list">
      <div className="places-list-header">
        <h2 className="places-list-title">
          {visiblePlaces.length} {visiblePlaces.length === 1 ? 'place' : 'places'} found
        </h2>
      </div>
      <div className="places-list-content" role="list">
        {visiblePlaces.map((place) => (
          <div
            key={place.placeId}
            ref={(el) => {
              if (el) {
                cardRefs.current.set(place.placeId, el);
              } else {
                cardRefs.current.delete(place.placeId);
              }
            }}
            role="listitem"
          >
            <PlaceCard
              place={place}
              isSelected={selectedPlaceId === place.placeId}
              isExpanded={expandedPlaceId === place.placeId}
              mapCenter={mapCenter}
              onSelect={handleSelectPlace}
              onToggleExpand={handleToggleExpand}
              onHide={handleHidePlace}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
