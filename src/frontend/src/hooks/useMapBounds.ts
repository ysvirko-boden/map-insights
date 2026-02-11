import { useCallback } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { ViewportBounds } from '@/types/places';

/**
 * Custom hook to extract map viewport bounds
 * Returns a function that gets current map bounds or null if unavailable
 */
export function useMapBounds() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const map = useMap('default');

  const getMapBounds = useCallback((): ViewportBounds | null => {
    if (!map) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const bounds = map.getBounds();
    if (!bounds) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const ne = bounds.getNorthEast();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const sw = bounds.getSouthWest();

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      north: ne.lat(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      south: sw.lat(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      east: ne.lng(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      west: sw.lng(),
    };
  }, [map]);

  return { getMapBounds };
}
