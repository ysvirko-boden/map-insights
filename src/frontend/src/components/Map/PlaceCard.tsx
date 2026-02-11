/**
 * PlaceCard component
 * Displays place details with collapsed and expanded states
 */

import { calculateDistance, formatDistance } from '@/utils/places';
import { getPlaceIcon } from '@/utils/placeIcons';
import { CopyButton } from '@/components/common/CopyButton';
import type { PlaceDetails, Location } from '@/types/places';
import './PlaceCard.css';

export interface PlaceCardProps {
  place: PlaceDetails;
  isSelected: boolean;
  isExpanded: boolean;
  mapCenter: Location | null;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onHide: (id: string) => void;
}

export function PlaceCard({
  place,
  isSelected,
  isExpanded,
  mapCenter,
  onSelect,
  onToggleExpand,
  onHide,
}: PlaceCardProps) {
  // Calculate distance from map center
  const distance = mapCenter
    ? calculateDistance(
        mapCenter.lat,
        mapCenter.lng,
        place.location.lat,
        place.location.lng
      )
    : null;

  // Render star rating
  const renderStars = (rating: number | null) => {
    if (rating === null) return null;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="place-card-rating">
        <span className="place-card-stars" aria-label={`Rating: ${rating} out of 5`}>
          {'★'.repeat(fullStars)}
          {hasHalfStar && '⯨'}
          {'☆'.repeat(emptyStars)}
        </span>
        <span className="place-card-rating-value">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Handle card click (expand/collapse)
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Only toggle if clicking on the header area
    if (!target.closest('.place-card-header')) {
      return;
    }
    
    onToggleExpand(place.placeId);
    onSelect(place.placeId);
  };

  // Handle hide button click
  const handleHideClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHide(place.placeId);
  };

  return (
    <article
      className={`place-card ${isSelected ? 'place-card-selected' : ''} ${
        isExpanded ? 'place-card-expanded' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="place-card-header">
        <div className="place-card-icon" aria-hidden="true">
          {getPlaceIcon(place.type)}
        </div>
        <div className="place-card-main">
          <h3 className="place-card-name" title={place.name}>
            {place.name}
          </h3>
          <div className="place-card-meta">
            {renderStars(place.rating)}
            {place.userRatingsTotal !== null && (
              <span className="place-card-reviews">
                ({place.userRatingsTotal} reviews)
              </span>
            )}
          </div>
          {distance !== null && (
            <div className="place-card-distance">{formatDistance(distance)}</div>
          )}
        </div>
        <button
          className="place-card-remove-button"
          onClick={handleHideClick}
          title="Remove from list"
          aria-label="Remove from list"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
        <button
          className="place-card-expand-button"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          aria-expanded={isExpanded}
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && (
        <div className="place-card-details">
          {place.formattedAddress && (
            <div className="place-card-detail-row">
              <span className="place-card-detail-label">Address:</span>
              <span className="place-card-detail-value">
                {place.formattedAddress}
              </span>
              <CopyButton textToCopy={place.formattedAddress} ariaLabel="Copy address" />
            </div>
          )}

          {place.formattedPhoneNumber && (
            <div className="place-card-detail-row">
              <span className="place-card-detail-label">Phone:</span>
              <a
                href={`tel:${place.formattedPhoneNumber}`}
                className="place-card-phone-link"
                onClick={(e) => e.stopPropagation()}
              >
                {place.formattedPhoneNumber}
              </a>
              <CopyButton textToCopy={place.formattedPhoneNumber} ariaLabel="Copy phone number" />
            </div>
          )}

          {place.type && (
            <div className="place-card-detail-row">
              <span className="place-card-detail-label">Type:</span>
              <span className="place-card-detail-value">{place.type}</span>
              <CopyButton textToCopy={place.type} ariaLabel="Copy type" />
            </div>
          )}

          <div className="place-card-detail-row">
            <span className="place-card-detail-label">Coordinates:</span>
            <span className="place-card-detail-value">
              {place.location.lat}, {place.location.lng}
            </span>
            <CopyButton
              textToCopy={`${place.location.lat}, ${place.location.lng}`}
              ariaLabel="Copy coordinates"
            />
          </div>

          <div className="place-card-detail-row">
            <span className="place-card-detail-label">Link:</span>
            <a
              href={`https://www.google.com/maps/place/?q=place_id:${place.placeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="place-card-maps-link"
              onClick={(e) => e.stopPropagation()}
            >
              Open in Google Maps
            </a>
            <CopyButton
              textToCopy={`https://www.google.com/maps/place/?q=place_id:${place.placeId}`}
              ariaLabel="Copy Google Maps link"
            />
          </div>

          {place.openingHours && (
            <div className="place-card-hours-section">
              <div className="place-card-detail-row">
                <span className="place-card-detail-label">Hours:</span>
                {place.openingHours.openNow !== null && (
                  <span
                    className={`place-card-status ${
                      place.openingHours.openNow ? 'status-open' : 'status-closed'
                    }`}
                  >
                    {place.openingHours.openNow ? 'Open now' : 'Closed'}
                  </span>
                )}
              </div>
              {place.openingHours.weekdayText && (
                <ul className="place-card-hours-list">
                  {place.openingHours.weekdayText.map((text, index) => (
                    <li key={index}>{text}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

        </div>
      )}
    </article>
  );
}
