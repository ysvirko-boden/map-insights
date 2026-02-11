/**
 * MarkerContent component for rendering custom map markers
 * Displays different styles for autocomplete, search, and selected markers
 */

import { getPlaceIcon } from '@/utils/placeIcons';
import type { PlaceDetails } from '@/types/places';
import './MarkerContent.css';

export interface MarkerContentProps {
  place: PlaceDetails;
  isSelected: boolean;
  isAutocomplete?: boolean;
}

/**
 * Custom marker content with conditional styling
 * Renders as a pin with emoji icon and colored background
 */
export function MarkerContent({
  place,
  isSelected,
  isAutocomplete = false,
}: MarkerContentProps) {
  const emoji = getPlaceIcon(place.type);

  const markerClass = [
    'marker-content',
    isSelected && 'marker-content--selected',
    isAutocomplete && 'marker-content--autocomplete',
    !isAutocomplete && !isSelected && 'marker-content--search',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={markerClass} title={place.name}>
      <span className="marker-icon">{emoji}</span>
    </div>
  );
}
