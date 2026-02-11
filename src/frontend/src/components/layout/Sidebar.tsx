import { PlacesFilters } from '@/components/Map/PlacesFilters';
import { LoadPlacesButton } from '@/components/Map/LoadPlacesButton';
import { PlacesList } from '@/components/Map/PlacesList';
import { usePlacesStore } from '@/store/placesStore';
import { usePlacesSearch } from '@/hooks/usePlacesSearch';
import type { ViewportBounds } from '@/types/places';
import './Sidebar.css';

export interface SidebarProps {
  className?: string;
  isLoadingPlaces?: boolean;
}

export function Sidebar({
  className = '',
  isLoadingPlaces = false,
}: SidebarProps) {
  const triggerSearch = usePlacesStore((state) => state.triggerSearch);
  const searchBounds = usePlacesStore((state) => state.searchBounds);
  const filters = usePlacesStore((state) => state.filters);
  const mapCenter = usePlacesStore((state) => state.mapCenter);

  // Fetch places when search bounds are set
  const {
    data: searchResults,
    isLoading,
    error,
  } = usePlacesSearch(searchBounds, filters);

  const handleLoadPlaces = (bounds: ViewportBounds) => {
    triggerSearch(bounds);
  };

  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar-content">
        <section className="sidebar-section">
          <PlacesFilters />
        </section>

        <section className="sidebar-section">
          <LoadPlacesButton
            onLoad={handleLoadPlaces}
            isLoading={isLoadingPlaces || isLoading}
          />
        </section>

        <section className="sidebar-section sidebar-places-list">
          {searchBounds && (
            <PlacesList
              places={searchResults?.places || []}
              isLoading={isLoading}
              error={error}
              mapCenter={mapCenter}
            />
          )}
        </section>
      </div>
    </aside>
  );
}
