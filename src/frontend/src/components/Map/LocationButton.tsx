import { useMap } from '@vis.gl/react-google-maps';
import './LocationButton.css';

export function LocationButton() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const map = useMap();

  const handleLocateMe = () => {
    if (!map) return;

    // Request user's current location
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Pan to user's actual current location
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        map.panTo({
          lat: latitude,
          lng: longitude,
        });

        // Set zoom to show local area
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        map.setZoom(15);
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  };

  return (
    <button
      className="location-button"
      onClick={handleLocateMe}
      title="Show your current location"
      aria-label="Show your current location"
    >
      <svg
        className="location-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    </button>
  );
}
