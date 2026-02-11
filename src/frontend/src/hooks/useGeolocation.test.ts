import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';

describe('useGeolocation', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
  };

  beforeEach(() => {
    // @ts-expect-error - mocking navigator.geolocation
    global.navigator.geolocation = mockGeolocation;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.loading).toBe(true);
    expect(result.current.coordinates).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should return coordinates on successful geolocation', async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7589,
        longitude: -73.9851,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation(
      (success: PositionCallback) => {
        success(mockPosition as GeolocationPosition);
      }
    );

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coordinates).toEqual({
      latitude: 40.7589,
      longitude: -73.9851,
    });
    expect(result.current.error).toBeNull();
  });

  it('should return NYC fallback on permission denied', async () => {
    const mockError = {
      code: 1,
      message: 'User denied geolocation',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_: PositionCallback, errorCallback: PositionErrorCallback) => {
        errorCallback(mockError as GeolocationPositionError);
      }
    );

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coordinates).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    });
    expect(result.current.error).toBe(
      'Location permission denied. Using default location.'
    );
  });

  it('should return NYC fallback on position unavailable', async () => {
    const mockError = {
      code: 2,
      message: 'Position unavailable',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_: PositionCallback, errorCallback: PositionErrorCallback) => {
        errorCallback(mockError as GeolocationPositionError);
      }
    );

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coordinates).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    });
    expect(result.current.error).toBe(
      'Location information unavailable. Using default location.'
    );
  });

  it('should return NYC fallback on timeout', async () => {
    const mockError = {
      code: 3,
      message: 'Timeout',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };

    mockGeolocation.getCurrentPosition.mockImplementation(
      (_: PositionCallback, errorCallback: PositionErrorCallback) => {
        errorCallback(mockError as GeolocationPositionError);
      }
    );

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coordinates).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    });
    expect(result.current.error).toBe(
      'Location request timed out. Using default location.'
    );
  });

  it('should handle unsupported geolocation', async () => {
    // @ts-expect-error - testing undefined geolocation
    global.navigator.geolocation = undefined;

    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.coordinates).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    });
    expect(result.current.error).toBe('Geolocation is not supported by your browser');
  });
});
