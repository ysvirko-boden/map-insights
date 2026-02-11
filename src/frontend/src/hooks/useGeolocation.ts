import { useState, useEffect } from 'react';
import type { Coordinates, GeolocationState } from '../types/geolocation';

const NYC_FALLBACK: Coordinates = {
  latitude: 40.7128,
  longitude: -74.006,
};

export function useGeolocation(): GeolocationState {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setCoordinates(NYC_FALLBACK);
      setLoading(false);
      return;
    }

    // Success callback
    const handleSuccess = (position: GeolocationPosition) => {
      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setLoading(false);
      setError(null);
    };

    // Error callback
    const handleError = (err: GeolocationPositionError) => {
      let errorMessage = 'Unable to retrieve your location';

      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Using default location.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable. Using default location.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out. Using default location.';
          break;
      }

      setError(errorMessage);
      setCoordinates(NYC_FALLBACK);
      setLoading(false);
    };

    // Request geolocation
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }, []);

  return { coordinates, loading, error };
}
