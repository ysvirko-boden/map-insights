/**
 * Type definitions for Places API
 * Matches backend DTOs for type-safe communication
 */

import type { PlaceCategory } from './placeCategories';

/**
 * Geographic bounds defining a rectangular viewport
 * Used to specify search area on map
 */
export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Re-export category types from placeCategories
 */
export type { PlaceCategory } from './placeCategories';
export { ALL_CATEGORIES } from './placeCategories';

/**
 * Filter criteria for place search
 * Used in Zustand store and API requests
 */
export interface PlaceSearchFilters {
  categories: PlaceCategory[];
  minimumRating: number | null;
  limit: 10 | 30 | 50;
}

/**
 * Opening hours information for a place
 */
export interface OpeningHours {
  openNow: boolean | null;
  weekdayText: string[] | null;
}

/**
 * Geographic coordinates
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Complete place details matching backend PlaceDetailsDto
 * Represents a place from search results
 */
export interface PlaceDetails {
  placeId: string;
  name: string;
  type: string;
  rating: number | null;
  userRatingsTotal: number | null;
  formattedAddress: string | null;
  formattedPhoneNumber: string | null;
  openingHours: OpeningHours | null;
  location: Location;
}

/**
 * Request payload for place search API
 * Sent to POST /api/places/search
 */
export interface PlaceSearchRequest {
  viewportBounds: ViewportBounds;
  categories: string[] | null;
  minimumRating: number | null;
  limit: number;
}

/**
 * Response from place search API
 * Contains array of places and total count
 */
export interface PlaceSearchResponse {
  places: PlaceDetails[];
  totalCount: number;
}
