/**
 * Unit tests for Places Zustand store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePlacesStore } from './placesStore';
import type { PlaceCategory } from '@/types/places';

describe('placesStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { resetFilters, resetHiddenPlaces, selectPlace } =
      usePlacesStore.getState();
    resetFilters();
    resetHiddenPlaces();
    selectPlace(null);
  });

  describe('initial state', () => {
    it('should have default filters', () => {
      // Arrange & Act
      const { filters } = usePlacesStore.getState();

      // Assert
      expect(filters).toEqual({
        categories: [],
        minimumRating: null,
        limit: 30,
      });
    });

    it('should have no selected place', () => {
      // Arrange & Act
      const { selectedPlaceId } = usePlacesStore.getState();

      // Assert
      expect(selectedPlaceId).toBeNull();
    });

    it('should have empty hidden places set', () => {
      // Arrange & Act
      const { hiddenPlaceIds } = usePlacesStore.getState();

      // Assert
      expect(hiddenPlaceIds.size).toBe(0);
    });
  });

  describe('setFilters', () => {
    it('should update single filter property', () => {
      // Arrange
      const { setFilters } = usePlacesStore.getState();

      // Act
      setFilters({ limit: 50 });

      // Assert
      const { filters } = usePlacesStore.getState();
      expect(filters.limit).toBe(50);
      expect(filters.categories).toEqual([]);
      expect(filters.minimumRating).toBeNull();
    });

    it('should update multiple filter properties', () => {
      // Arrange
      const { setFilters } = usePlacesStore.getState();
      const newCategories: PlaceCategory[] = ['food_dining', 'coffee_shops'];

      // Act
      setFilters({
        categories: newCategories,
        minimumRating: 4.0,
        limit: 10,
      });

      // Assert
      const { filters } = usePlacesStore.getState();
      expect(filters).toEqual({
        categories: newCategories,
        minimumRating: 4.0,
        limit: 10,
      });
    });

    it('should preserve existing filters when updating partial', () => {
      // Arrange
      const { setFilters } = usePlacesStore.getState();
      const categories: PlaceCategory[] = ['attractions'];

      // Act
      setFilters({ categories });
      setFilters({ minimumRating: 3.5 });

      // Assert
      const { filters } = usePlacesStore.getState();
      expect(filters.categories).toEqual(categories);
      expect(filters.minimumRating).toBe(3.5);
      expect(filters.limit).toBe(30);
    });
  });

  describe('selectPlace', () => {
    it('should set selected place ID', () => {
      // Arrange
      const { selectPlace } = usePlacesStore.getState();

      // Act
      selectPlace('place123');

      // Assert
      const { selectedPlaceId } = usePlacesStore.getState();
      expect(selectedPlaceId).toBe('place123');
    });

    it('should clear selected place when null', () => {
      // Arrange
      const { selectPlace } = usePlacesStore.getState();
      selectPlace('place123');

      // Act
      selectPlace(null);

      // Assert
      const { selectedPlaceId } = usePlacesStore.getState();
      expect(selectedPlaceId).toBeNull();
    });

    it('should replace previously selected place', () => {
      // Arrange
      const { selectPlace } = usePlacesStore.getState();
      selectPlace('place1');

      // Act
      selectPlace('place2');

      // Assert
      const { selectedPlaceId } = usePlacesStore.getState();
      expect(selectedPlaceId).toBe('place2');
    });
  });

  describe('hidePlace', () => {
    it('should add place to hidden set', () => {
      // Arrange
      const { hidePlace } = usePlacesStore.getState();

      // Act
      hidePlace('place1');

      // Assert
      const { hiddenPlaceIds } = usePlacesStore.getState();
      expect(hiddenPlaceIds.has('place1')).toBe(true);
      expect(hiddenPlaceIds.size).toBe(1);
    });

    it('should add multiple places to hidden set', () => {
      // Arrange
      const { hidePlace } = usePlacesStore.getState();

      // Act
      hidePlace('place1');
      hidePlace('place2');
      hidePlace('place3');

      // Assert
      const { hiddenPlaceIds } = usePlacesStore.getState();
      expect(hiddenPlaceIds.has('place1')).toBe(true);
      expect(hiddenPlaceIds.has('place2')).toBe(true);
      expect(hiddenPlaceIds.has('place3')).toBe(true);
      expect(hiddenPlaceIds.size).toBe(3);
    });

    it('should not duplicate place IDs in hidden set', () => {
      // Arrange
      const { hidePlace } = usePlacesStore.getState();

      // Act
      hidePlace('place1');
      hidePlace('place1');
      hidePlace('place1');

      // Assert
      const { hiddenPlaceIds } = usePlacesStore.getState();
      expect(hiddenPlaceIds.size).toBe(1);
    });
  });

  describe('resetHiddenPlaces', () => {
    it('should clear all hidden places', () => {
      // Arrange
      const { hidePlace, resetHiddenPlaces } = usePlacesStore.getState();
      hidePlace('place1');
      hidePlace('place2');
      hidePlace('place3');

      // Act
      resetHiddenPlaces();

      // Assert
      const { hiddenPlaceIds } = usePlacesStore.getState();
      expect(hiddenPlaceIds.size).toBe(0);
    });
  });

  describe('resetFilters', () => {
    it('should restore default filter values', () => {
      // Arrange
      const { setFilters, resetFilters } = usePlacesStore.getState();
      const categories: PlaceCategory[] = ['food_dining', 'coffee_shops'];
      setFilters({
        categories,
        minimumRating: 4.5,
        limit: 10,
      });

      // Act
      resetFilters();

      // Assert
      const { filters } = usePlacesStore.getState();
      expect(filters).toEqual({
        categories: [],
        minimumRating: null,
        limit: 30,
      });
    });
  });

  describe('state consistency', () => {
    it('should maintain state consistency across multiple operations', () => {
      // Arrange
      const {
        setFilters,
        selectPlace,
        hidePlace,
        resetHiddenPlaces,
        resetFilters,
      } = usePlacesStore.getState();

      // Act
      setFilters({ categories: ['food_dining' as PlaceCategory], limit: 50 });
      selectPlace('place1');
      hidePlace('place2');
      hidePlace('place3');

      // Assert initial state
      let state = usePlacesStore.getState();
      expect(state.filters.limit).toBe(50);
      expect(state.selectedPlaceId).toBe('place1');
      expect(state.hiddenPlaceIds.size).toBe(2);

      // Act - reset hidden
      resetHiddenPlaces();
      state = usePlacesStore.getState();
      expect(state.hiddenPlaceIds.size).toBe(0);
      expect(state.filters.limit).toBe(50);
      expect(state.selectedPlaceId).toBe('place1');

      // Act - reset filters
      resetFilters();
      state = usePlacesStore.getState();
      expect(state.filters.limit).toBe(30);
      expect(state.selectedPlaceId).toBe('place1');
    });
  });
});
