/**
 * Zustand store for Places client state
 * Manages filters, selection, hidden places, and search triggers
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  PlaceSearchFilters,
  PlaceCategory,
  ViewportBounds,
} from '@/types/places';

/**
 * Places store state interface
 * Includes filter settings, selected place, hidden places, and search state
 */
export interface PlacesState {
  // State
  filters: PlaceSearchFilters;
  selectedPlaceId: string | null;
  hiddenPlaceIds: Set<string>;
  searchBounds: ViewportBounds | null;
  mapCenter: { lat: number; lng: number } | null;

  // Actions
  setFilters: (filters: Partial<PlaceSearchFilters>) => void;
  selectPlace: (placeId: string | null) => void;
  hidePlace: (placeId: string) => void;
  resetHiddenPlaces: () => void;
  resetFilters: () => void;
  triggerSearch: (bounds: ViewportBounds) => void;
  clearSearch: () => void;
  setMapCenter: (center: { lat: number; lng: number } | null) => void;
}

/**
 * Default filter values
 */
const DEFAULT_FILTERS: PlaceSearchFilters = {
  categories: [] as PlaceCategory[],
  minimumRating: null,
  limit: 30,
};

/**
 * Places store with devtools middleware
 * Use usePlacesStore() hook to access in components
 */
export const usePlacesStore = create<PlacesState>()(
  devtools(
    (set) => ({
      // Initial state
      filters: DEFAULT_FILTERS,
      selectedPlaceId: null,
      hiddenPlaceIds: new Set<string>(),
      searchBounds: null,
      mapCenter: null,

      // Actions
      setFilters: (filters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...filters },
          }),
          false,
          'setFilters'
        ),

      selectPlace: (placeId) =>
        set({ selectedPlaceId: placeId }, false, 'selectPlace'),

      hidePlace: (placeId) =>
        set(
          (state) => {
            const newHiddenPlaceIds = new Set(state.hiddenPlaceIds);
            newHiddenPlaceIds.add(placeId);
            return { hiddenPlaceIds: newHiddenPlaceIds };
          },
          false,
          'hidePlace'
        ),

      resetHiddenPlaces: () =>
        set({ hiddenPlaceIds: new Set<string>() }, false, 'resetHiddenPlaces'),

      resetFilters: () =>
        set({ filters: DEFAULT_FILTERS }, false, 'resetFilters'),

      triggerSearch: (bounds) =>
        set({ searchBounds: bounds }, false, 'triggerSearch'),

      clearSearch: () =>
        set({ searchBounds: null }, false, 'clearSearch'),

      setMapCenter: (center) =>
        set({ mapCenter: center }, false, 'setMapCenter'),
    }),
    { name: 'places-store' }
  )
);
