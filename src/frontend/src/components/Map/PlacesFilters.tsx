import { usePlacesStore } from '@/store/placesStore';
import { PlaceCategorySelect } from './PlaceCategorySelect';
import { RatingFilter } from './RatingFilter';
import { ResultLimitSelect } from './ResultLimitSelect';
import type { PlaceCategory } from '@/types/placeCategories';
import './PlacesFilters.css';

export function PlacesFilters() {
  const filters = usePlacesStore((state) => state.filters);
  const setFilters = usePlacesStore((state) => state.setFilters);
  const resetFilters = usePlacesStore((state) => state.resetFilters);

  const handleCategoriesChange = (categories: PlaceCategory[]) => {
    setFilters({ categories });
  };

  const handleRatingChange = (minimumRating: number | null) => {
    setFilters({ minimumRating });
  };

  const handleLimitChange = (limit: 10 | 30 | 50) => {
    setFilters({ limit });
  };

  return (
    <div className="places-filters">
      <div className="places-filters__header">
        <h3 className="places-filters__title">Filter Places</h3>
        <button
          type="button"
          className="places-filters__reset"
          onClick={resetFilters}
          aria-label="Reset all filters to defaults"
        >
          Reset
        </button>
      </div>

      <div className="places-filters__controls">
        <PlaceCategorySelect
          selectedCategories={filters.categories}
          onChange={handleCategoriesChange}
        />

        <RatingFilter
          value={filters.minimumRating}
          onChange={handleRatingChange}
        />

        <ResultLimitSelect
          value={filters.limit}
          onChange={handleLimitChange}
        />
      </div>
    </div>
  );
}
