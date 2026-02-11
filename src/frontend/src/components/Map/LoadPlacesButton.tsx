import { useMapBounds } from '@/hooks/useMapBounds';
import type { ViewportBounds } from '@/types/places';
import './LoadPlacesButton.css';

export interface LoadPlacesButtonProps {
  onLoad: (bounds: ViewportBounds) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function LoadPlacesButton({
  onLoad,
  isLoading = false,
  disabled = false,
}: LoadPlacesButtonProps) {
  const { getMapBounds } = useMapBounds();

  const handleClick = () => {
    if (isLoading || disabled) return;

    const bounds = getMapBounds();
    if (bounds) {
      onLoad(bounds);
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      className="load-places-button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={isLoading ? 'Loading places...' : 'Load places in current map area'}
    >
      {isLoading ? (
        <>
          <span className="load-places-button__spinner" aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        'Load Places'
      )}
    </button>
  );
}
