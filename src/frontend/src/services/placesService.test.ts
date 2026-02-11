/**
 * Unit tests for Places API service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchPlaces } from './placesService';
import type { PlaceSearchRequest, PlaceSearchResponse } from '@/types/places';
import { ApiError } from './api';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('placesService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchPlaces', () => {
    const mockRequest: PlaceSearchRequest = {
      viewportBounds: {
        north: 40.8,
        south: 40.7,
        east: -73.9,
        west: -74.0,
      },
      categories: ['food_dining', 'coffee_shops'],
      minimumRating: 4.0,
      limit: 30,
    };

    const mockResponse: PlaceSearchResponse = {
      places: [
        {
          placeId: 'place1',
          name: 'Test Restaurant',
          type: 'restaurant',
          rating: 4.5,
          userRatingsTotal: 100,
          formattedAddress: '123 Main St, New York, NY 10001',
          formattedPhoneNumber: '+1 212-555-0100',
          openingHours: {
            openNow: true,
            weekdayText: ['Monday: 9:00 AM – 5:00 PM'],
          },
          location: {
            lat: 40.75,
            lng: -73.95,
          },
        },
      ],
      totalCount: 1,
    };

    it('should return PlaceSearchResponse on successful search', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      // Act
      const result = await searchPlaces(mockRequest);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    it('should send correct request body to API', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      // Act
      await searchPlaces(mockRequest);

      // Assert
       
      const callArgs = mockFetch.mock.calls[0] as [string, RequestInit];
      const fetchOptions = callArgs[1];
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/places/search'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(fetchOptions.body).toBe(JSON.stringify(mockRequest));
       
    });

    it('should throw ApiError with 400 status on bad request', async () => {
      // Arrange
      const errorResponse = {
        message: 'Invalid viewport bounds',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve(errorResponse),
      });

      // Act & Assert
      try {
        await searchPlaces(mockRequest);
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
          statusCode: 400,
          message: 'Invalid viewport bounds',
        });
      }
    });

    it('should throw ApiError with 500 status on server error', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ message: 'Server error occurred' }),
      });

      // Act & Assert
      try {
        await searchPlaces(mockRequest);
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
          statusCode: 500,
          message: 'Server error occurred',
        });
      }
    });

    it('should throw ApiError with status 0 on network error', async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      // Act & Assert
      await expect(searchPlaces(mockRequest)).rejects.toThrow(ApiError);
      await expect(searchPlaces(mockRequest)).rejects.toMatchObject({
        statusCode: 0,
        message: 'Network error: Unable to connect to server',
      });
    });

    it('should handle empty response body gracefully', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => {
          throw new Error('Invalid JSON');
        },
      });

      // Act & Assert
      await expect(searchPlaces(mockRequest)).rejects.toThrow(ApiError);
    });
  });
});
