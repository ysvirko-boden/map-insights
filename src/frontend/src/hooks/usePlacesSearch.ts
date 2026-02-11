/**
 * TanStack Query hook for Places search
 * Manages server state with caching and automatic refetching
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { searchPlaces } from '@/services/placesService';
import type {
  PlaceSearchFilters,
  PlaceSearchResponse,
  ViewportBounds,
} from '@/types/places';

/**
 * Hook for searching places with TanStack Query
 * Handles caching, loading states, and error handling
 *
 * @param viewportBounds - Map viewport bounds (null disables query)
 * @param filters - Search filters (categories, rating, limit)
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with data, loading, and error states
 */
export function usePlacesSearch(
  viewportBounds: ViewportBounds | null,
  filters: PlaceSearchFilters,
  enabled: boolean = true
): UseQueryResult<PlaceSearchResponse, Error> {
  return useQuery({
    queryKey: ['places', 'search', viewportBounds, filters],
    queryFn: async () => {
      if (!viewportBounds) {
        throw new Error('Viewport bounds are required for search');
      }

      return searchPlaces({
        viewportBounds,
        categories: filters.categories.length > 0 ? filters.categories : null,
        minimumRating: filters.minimumRating,
        limit: filters.limit,
      });
    },
    enabled: enabled && viewportBounds !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Retry once on failure
  });
}
