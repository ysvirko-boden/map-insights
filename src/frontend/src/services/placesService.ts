/**
 * Places API service
 * Handles communication with backend Places endpoints
 */

import type {
  PlaceSearchRequest,
  PlaceSearchResponse,
} from '@/types/places';
import { fetchJson } from './api';

/**
 * Search for places within viewport bounds with optional filters
 *
 * @param request - Search parameters including bounds, types, rating, limit
 * @returns Promise resolving to array of places and total count
 * @throws ApiError if request fails or server returns error
 */
export async function searchPlaces(
  request: PlaceSearchRequest
): Promise<PlaceSearchResponse> {
  return fetchJson<PlaceSearchResponse>(
    '/api/places/search',
    'POST',
    request
  );
}
