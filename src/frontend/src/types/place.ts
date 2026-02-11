/**
 * Place interface for autocomplete feature
 * This is used with Google Places Autocomplete API
 * For search results, use PlaceDetails from places.ts
 */
export interface Place {
  placeId: string;
  displayName: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface AutocompletePrediction {
  placePrediction: {
    place: string;
    placeId: string;
    text: {
      text: string;
    };
    structuredFormat: {
      mainText: {
        text: string;
      };
      secondaryText: {
        text: string;
      };
    };
  };
}
