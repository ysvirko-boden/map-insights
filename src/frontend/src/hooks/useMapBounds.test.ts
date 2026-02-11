import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMapBounds } from './useMapBounds';
import { useMap } from '@vis.gl/react-google-maps';

// Mock the @vis.gl/react-google-maps module
vi.mock('@vis.gl/react-google-maps', () => ({
  useMap: vi.fn(),
}));

// Define a mock type for our map
type MockMap = {
  getBounds: () => MockBounds | null;
};

type MockBounds = {
  getNorthEast: () => MockLatLng;
  getSouthWest: () => MockLatLng;
};

type MockLatLng = {
  lat: () => number;
  lng: () => number;
};

describe('useMapBounds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return getMapBounds function', () => {
    // Arrange
    vi.mocked(useMap).mockReturnValue(null);

    // Act
    const { result } = renderHook(() => useMapBounds());

    // Assert
    expect(result.current.getMapBounds).toBeDefined();
    expect(typeof result.current.getMapBounds).toBe('function');
  });

  it('should return null when map is not available', () => {
    // Arrange
    vi.mocked(useMap).mockReturnValue(null);

    // Act
    const { result } = renderHook(() => useMapBounds());
    const bounds = result.current.getMapBounds();

    // Assert
    expect(bounds).toBeNull();
  });

  it('should return null when map bounds are not available', () => {
    // Arrange
    const mockMap: MockMap = {
      getBounds: vi.fn().mockReturnValue(null),
    };
    vi.mocked(useMap).mockReturnValue(mockMap as never);

    // Act
    const { result } = renderHook(() => useMapBounds());
    const bounds = result.current.getMapBounds();

    // Assert
    expect(bounds).toBeNull();
  });

  it('should return bounds when map and bounds are available', () => {
    // Arrange
    const mockNE: MockLatLng = {
      lat: () => 40.7589,
      lng: () => -73.9851,
    };
    const mockSW: MockLatLng = {
      lat: () => 40.7489,
      lng: () => -73.9951,
    };
    const mockBounds: MockBounds = {
      getNorthEast: () => mockNE,
      getSouthWest: () => mockSW,
    };
    const mockMap: MockMap = {
      getBounds: vi.fn().mockReturnValue(mockBounds),
    };
    vi.mocked(useMap).mockReturnValue(mockMap as never);

    // Act
    const { result } = renderHook(() => useMapBounds());
    const bounds = result.current.getMapBounds();

    // Assert
    expect(bounds).toEqual({
      north: 40.7589,
      south: 40.7489,
      east: -73.9851,
      west: -73.9951,
    });
  });

  it('should convert Google Maps bounds to ViewportBounds correctly', () => {
    // Arrange
    const mockNE: MockLatLng = {
      lat: () => 51.5074,
      lng: () => -0.1278,
    };
    const mockSW: MockLatLng = {
      lat: () => 51.5000,
      lng: () => -0.1400,
    };
    const mockBounds: MockBounds = {
      getNorthEast: () => mockNE,
      getSouthWest: () => mockSW,
    };
    const mockMap: MockMap = {
      getBounds: vi.fn().mockReturnValue(mockBounds),
    };
    vi.mocked(useMap).mockReturnValue(mockMap as never);

    // Act
    const { result } = renderHook(() => useMapBounds());
    const bounds = result.current.getMapBounds();

    // Assert
    expect(bounds).toEqual({
      north: 51.5074,
      south: 51.5000,
      east: -0.1278,
      west: -0.1400,
    });
  });

  it('should call map.getBounds() when getMapBounds is called', () => {
    // Arrange
    const mockNE: MockLatLng = {
      lat: () => 40.7589,
      lng: () => -73.9851,
    };
    const mockSW: MockLatLng = {
      lat: () => 40.7489,
      lng: () => -73.9951,
    };
    const mockBounds: MockBounds = {
      getNorthEast: () => mockNE,
      getSouthWest: () => mockSW,
    };
    const mockGetBounds = vi.fn().mockReturnValue(mockBounds);
    const mockMap: MockMap = {
      getBounds: mockGetBounds,
    };
    vi.mocked(useMap).mockReturnValue(mockMap as never);

    // Act
    const { result } = renderHook(() => useMapBounds());
    result.current.getMapBounds();

    // Assert
    expect(mockGetBounds).toHaveBeenCalledOnce();
  });

  it('should return stable function reference', () => {
    // Arrange
    const mockMap: MockMap = {
      getBounds: vi.fn().mockReturnValue(null),
    };
    vi.mocked(useMap).mockReturnValue(mockMap as never);

    // Act
    const { result, rerender } = renderHook(() => useMapBounds());
    const firstGetBounds = result.current.getMapBounds;
    
    rerender();
    const secondGetBounds = result.current.getMapBounds;

    // Assert
    expect(firstGetBounds).toBe(secondGetBounds);
  });

  it('should handle map instance change', () => {
    // Arrange
    const mockMap1: MockMap = {
      getBounds: vi.fn().mockReturnValue(null),
    };
    vi.mocked(useMap).mockReturnValue(mockMap1 as never);

    // Act
    const { result, rerender } = renderHook(() => useMapBounds());
    result.current.getMapBounds();

    // Change map instance
    const mockNE: MockLatLng = {
      lat: () => 40.7589,
      lng: () => -73.9851,
    };
    const mockSW: MockLatLng = {
      lat: () => 40.7489,
      lng: () => -73.9951,
    };
    const mockBounds: MockBounds = {
      getNorthEast: () => mockNE,
      getSouthWest: () => mockSW,
    };
    const mockMap2: MockMap = {
      getBounds: vi.fn().mockReturnValue(mockBounds),
    };
    vi.mocked(useMap).mockReturnValue(mockMap2 as never);

    rerender();
    const bounds = result.current.getMapBounds();

    // Assert
    expect(bounds).toEqual({
      north: 40.7589,
      south: 40.7489,
      east: -73.9851,
      west: -73.9951,
    });
  });
});
