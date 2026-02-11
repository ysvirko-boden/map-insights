/**
 * Unit tests for Places utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  getCategoryLabel,
  getCategoryIcon,
  calculateDistance,
  formatDistance,
} from './places';
import type { PlaceCategory } from '@/types/places';

describe('places utilities', () => {
  describe('getCategoryLabel', () => {
    it('should return correct label for food_dining', () => {
      // Act & Assert
      expect(getCategoryLabel('food_dining')).toBe('Food & Dining');
    });

    it('should return correct label for shopping', () => {
      // Act & Assert
      expect(getCategoryLabel('shopping')).toBe('Shopping');
    });

    it('should return correct label for attractions', () => {
      // Act & Assert
      expect(getCategoryLabel('attractions')).toBe('Attractions & Culture');
    });

    it('should return correct label for transportation', () => {
      // Act & Assert
      expect(getCategoryLabel('transportation')).toBe('Transportation');
    });

    it('should return labels for all place categories', () => {
      // Arrange
      const categories: PlaceCategory[] = [
        'food_dining',
        'coffee_shops',
        'groceries',
        'attractions',
        'shopping',
        'nature_parks',
        'healthcare',
        'services',
        'transportation',
        'nightlife',
      ];

      // Act & Assert
      categories.forEach((category) => {
        const label = getCategoryLabel(category);
        expect(label).toBeTruthy();
        expect(typeof label).toBe('string');
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getCategoryIcon', () => {
    it('should return correct icon for food_dining', () => {
      // Act & Assert
      expect(getCategoryIcon('food_dining')).toBe('restaurant');
    });

    it('should return correct icon for coffee_shops', () => {
      // Act & Assert
      expect(getCategoryIcon('coffee_shops')).toBe('local_cafe');
    });

    it('should return correct icon for shopping', () => {
      // Act & Assert
      expect(getCategoryIcon('shopping')).toBe('shopping_bag');
    });

    it('should return icons for all place categories', () => {
      // Arrange
      const categories: PlaceCategory[] = [
        'food_dining',
        'coffee_shops',
        'groceries',
        'attractions',
        'shopping',
        'nature_parks',
        'healthcare',
        'services',
        'transportation',
        'nightlife',
      ];

      // Act & Assert
      categories.forEach((category) => {
        const icon = getCategoryIcon(category);
        expect(icon).toBeTruthy();
        expect(typeof icon).toBe('string');
      });
    });
  });

  describe('calculateDistance', () => {
    it('should return 0 for same location', () => {
      // Arrange
      const lat = 40.7128;
      const lng = -74.006;

      // Act
      const distance = calculateDistance(lat, lng, lat, lng);

      // Assert
      expect(distance).toBe(0);
    });

    it('should calculate correct distance between New York and Los Angeles', () => {
      // Arrange - New York and Los Angeles coordinates
      const nyLat = 40.7128;
      const nyLng = -74.006;
      const laLat = 34.0522;
      const laLng = -118.2437;

      // Act
      const distance = calculateDistance(nyLat, nyLng, laLat, laLng);

      // Assert - approximately 3944 km (3,944,000 meters)
      expect(distance).toBeGreaterThan(3900000);
      expect(distance).toBeLessThan(4000000);
    });

    it('should calculate correct distance between nearby points', () => {
      // Arrange - Two points approximately 1 km apart in Manhattan
      const lat1 = 40.7589;
      const lng1 = -73.9851;
      const lat2 = 40.7489;
      const lng2 = -73.9851;

      // Act
      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Assert - approximately 1.1 km
      expect(distance).toBeGreaterThan(1000);
      expect(distance).toBeLessThan(1200);
    });

    it('should handle negative coordinates', () => {
      // Arrange
      const lat1 = -33.8688;
      const lng1 = 151.2093; // Sydney
      const lat2 = -37.8136;
      const lng2 = 144.9631; // Melbourne

      // Act
      const distance = calculateDistance(lat1, lng1, lat2, lng2);

      // Assert - approximately 714 km
      expect(distance).toBeGreaterThan(700000);
      expect(distance).toBeLessThan(750000);
    });

    it('should be symmetric', () => {
      // Arrange
      const lat1 = 40.7128;
      const lng1 = -74.006;
      const lat2 = 34.0522;
      const lng2 = -118.2437;

      // Act
      const distance1 = calculateDistance(lat1, lng1, lat2, lng2);
      const distance2 = calculateDistance(lat2, lng2, lat1, lng1);

      // Assert
      expect(distance1).toBeCloseTo(distance2, 0);
    });
  });

  describe('formatDistance', () => {
    it('should format distance less than 1000m in meters', () => {
      // Act & Assert
      expect(formatDistance(0)).toBe('0 m');
      expect(formatDistance(50)).toBe('50 m');
      expect(formatDistance(350)).toBe('350 m');
      expect(formatDistance(999)).toBe('999 m');
    });

    it('should format distance 1000m and above in kilometers', () => {
      // Act & Assert
      expect(formatDistance(1000)).toBe('1.0 km');
      expect(formatDistance(1500)).toBe('1.5 km');
      expect(formatDistance(2350)).toBe('2.4 km');
      expect(formatDistance(10000)).toBe('10.0 km');
    });

    it('should round meters to nearest integer', () => {
      // Act & Assert
      expect(formatDistance(123.4)).toBe('123 m');
      expect(formatDistance(456.7)).toBe('457 m');
    });

    it('should format kilometers to one decimal place', () => {
      // Act & Assert
      expect(formatDistance(1234)).toBe('1.2 km');
      expect(formatDistance(5678)).toBe('5.7 km');
      expect(formatDistance(12345)).toBe('12.3 km');
    });

    it('should handle very large distances', () => {
      // Act & Assert
      expect(formatDistance(1000000)).toBe('1000.0 km');
      expect(formatDistance(3944000)).toBe('3944.0 km');
    });
  });
});
