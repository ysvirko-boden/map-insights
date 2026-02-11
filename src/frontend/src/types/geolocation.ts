export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  loading: boolean;
  error: string | null;
}
