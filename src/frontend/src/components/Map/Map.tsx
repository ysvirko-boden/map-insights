import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  ControlPosition,
  useMap,
} from '@vis.gl/react-google-maps';
import { useGeolocation } from '../../hooks/useGeolocation';
import { usePlacesStore } from '../../store/placesStore';
import { usePlacesSearch } from '../../hooks/usePlacesSearch';
import { useTheme } from '../../contexts/ThemeContext';
import type { Place } from '../../types';
import type { ViewportBounds } from '../../types/places';
import { MapControl } from './MapControl';
import { PlaceSearchInput } from './PlaceSearchInput';
import { LocationButton } from './LocationButton';
import { MarkerContent } from './MarkerContent';
import './Map.css';

const DEFAULT_ZOOM = 15;
const SELECTED_PLACE_ZOOM = 15;
const BOUNDS_UPDATE_DEBOUNCE_MS = 500;

/**
 * Google Maps Map ID configuration.
 * Create a Map ID in Google Cloud Console: https://console.cloud.google.com/google/maps-apis/studio/maps
 * Configure in .env file as VITE_GOOGLE_MAPS_MAP_ID
 * 
 * Note: Theme switching is handled via the colorScheme property, not different Map IDs.
 * See: https://developers.google.com/maps/documentation/javascript/mapcolorscheme
 */
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID as string | undefined;

export interface MapProps {
  onBoundsChange?: (bounds: ViewportBounds) => void;
}

interface MapContentProps {
  onBoundsChange?: (bounds: ViewportBounds) => void;
}

function MapContent({ onBoundsChange }: MapContentProps) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const map = useMap();
  
  // Autocomplete state (single place selection)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  // Store state for search results
  const searchBounds = usePlacesStore((state) => state.searchBounds);
  const filters = usePlacesStore((state) => state.filters);
  const selectedPlaceId = usePlacesStore((state) => state.selectedPlaceId);
  const hiddenPlaceIds = usePlacesStore((state) => state.hiddenPlaceIds);
  const selectPlace = usePlacesStore((state) => state.selectPlace);
  const setMapCenter = usePlacesStore((state) => state.setMapCenter);
  
  // Fetch search results (TanStack Query will cache and deduplicate with Sidebar)
  const { data: searchResults } = usePlacesSearch(searchBounds, filters);
  
  // Memoize places to avoid unnecessary dependency updates
  const places = useMemo(() => {
    return searchResults?.places || [];
  }, [searchResults?.places]);
  
  // Debounce timer for bounds updates
  const boundsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle autocomplete place selection (existing functionality)
  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    
    if (map) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      map.panTo(place.location);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      map.setZoom(SELECTED_PLACE_ZOOM);
    }
  };

  // Handle search marker click
  const handleMarkerClick = useCallback((placeId: string) => {
    selectPlace(placeId);
  }, [selectPlace]);

  // Convert Google Maps bounds to ViewportBounds type
  const convertBounds = useCallback((
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    googleBounds: any
  ): ViewportBounds | null => {
    if (!googleBounds) return null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const ne = googleBounds.getNorthEast() as { lat: () => number; lng: () => number };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const sw = googleBounds.getSouthWest() as { lat: () => number; lng: () => number };

      const bounds = {
        north: ne.lat(),
        south: sw.lat(),
        east: ne.lng(),
        west: sw.lng(),
      };

      // Calculate and store map center
      const center = {
        lat: (bounds.north + bounds.south) / 2,
        lng: (bounds.east + bounds.west) / 2,
      };
      setMapCenter(center);

      return bounds;
    } catch (error) {
      console.error('Error converting bounds:', error);
      return null;
    }
  }, [setMapCenter]);

  // Track viewport bounds changes
  useEffect(() => {
    if (!map || !onBoundsChange) return;

    const handleBoundsChanged = () => {
      // Clear existing timer
      if (boundsTimerRef.current) {
        clearTimeout(boundsTimerRef.current);
      }

      // Debounce bounds update
      boundsTimerRef.current = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const googleBounds = map.getBounds();
        const bounds = convertBounds(googleBounds);
        
        if (bounds) {
          onBoundsChange(bounds);
        }
      }, BOUNDS_UPDATE_DEBOUNCE_MS);
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const listener = map.addListener('idle', handleBoundsChanged);

    // Cleanup
    return () => {
      if (boundsTimerRef.current) {
        clearTimeout(boundsTimerRef.current);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      if (listener?.remove) listener.remove();
    };
  }, [map, onBoundsChange, convertBounds]);

  // Filter visible places (exclude hidden ones)
  const visiblePlaces = useMemo(() => {
    return places.filter((place) => !hiddenPlaceIds.has(place.placeId));
  }, [places, hiddenPlaceIds]);

  // Render search markers
  const searchMarkers = useMemo(() => {
    return visiblePlaces.map((place) => {
      const isSelected = selectedPlaceId === place.placeId;
      
      return (
        <AdvancedMarker
          key={place.placeId}
          position={place.location}
          onClick={() => handleMarkerClick(place.placeId)}
          zIndex={isSelected ? 1000 : 1}
        >
          <MarkerContent place={place} isSelected={isSelected} />
        </AdvancedMarker>
      );
    });
  }, [visiblePlaces, selectedPlaceId, handleMarkerClick]);

  return (
    <>
      <MapControl position={ControlPosition.TOP_CENTER}>
        <PlaceSearchInput onPlaceSelect={handlePlaceSelect} />
      </MapControl>

      <MapControl position={ControlPosition.RIGHT_CENTER}>
        <LocationButton />
      </MapControl>

      {/* Autocomplete marker (yellow) */}
      {selectedPlace && (
        <AdvancedMarker position={selectedPlace.location} zIndex={500}>
          <MarkerContent
            place={{
              placeId: selectedPlace.placeId,
              name: selectedPlace.displayName,
              type: 'place',
              rating: null,
              userRatingsTotal: null,
              formattedAddress: null,
              formattedPhoneNumber: null,
              openingHours: null,
              location: selectedPlace.location,
            }}
            isSelected={false}
            isAutocomplete
          />
        </AdvancedMarker>
      )}

      {/* Search result markers (blue/red) */}
      {searchMarkers}
    </>
  );
}

export function Map({ onBoundsChange }: MapProps = {}) {
  const { coordinates, loading, error } = useGeolocation();
  const { resolvedTheme } = useTheme();

  // Map color scheme based on theme
  // Uses google.maps.ColorScheme: LIGHT, DARK, or FOLLOW_SYSTEM
  // Note: colorScheme can only be set at map initialization
  // To switch themes dynamically, we remount the map using the key prop
  const colorScheme = useMemo(() => {
    return resolvedTheme === 'dark' ? 'DARK' : 'LIGHT';
  }, [resolvedTheme]);

  if (loading) {
    return (
      <div className="map-loading">
        <div className="spinner" />
        <p>Loading map...</p>
      </div>
    );
  }

  if (!coordinates) {
    return (
      <div className="map-error">
        <p>Unable to load map. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      {error && (
        <div className="map-notification">
          <p>{error}</p>
        </div>
      )}
      <GoogleMap
        key={colorScheme}
        id="default"
        mapId={GOOGLE_MAPS_MAP_ID}
        colorScheme={colorScheme}
        defaultCenter={{
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        }}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        <MapContent onBoundsChange={onBoundsChange} />
      </GoogleMap>
    </div>
  );
}
