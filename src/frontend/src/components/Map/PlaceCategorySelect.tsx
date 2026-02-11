import type { PlaceCategory } from '../../types/placeCategories';
import {
  ALL_CATEGORIES,
  getCategoryLabel,
  getCategoryIcon,
} from '../../types/placeCategories';
import './PlaceCategorySelect.css';

interface PlaceCategorySelectProps {
  selectedCategories: PlaceCategory[];
  onChange: (categories: PlaceCategory[]) => void;
}

export function PlaceCategorySelect({
  selectedCategories,
  onChange,
}: PlaceCategorySelectProps) {
  const handleCategoryToggle = (category: PlaceCategory) => {
    const isSelected = selectedCategories.includes(category);

    if (isSelected) {
      onChange(selectedCategories.filter((c) => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const isAllSelected = selectedCategories.length === 0;

  return (
    <div className="place-category-select">
      <div className="category-header">
        <h3>Place Categories</h3>
        {selectedCategories.length > 0 && (
          <button onClick={handleClearAll} className="clear-button">
            All Categories
          </button>
        )}
      </div>

      <div className="category-buttons">
        {ALL_CATEGORIES.map((category) => {
          const isSelected = selectedCategories.includes(category);

          return (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className={`category-button ${isSelected ? 'selected' : ''} ${
                isAllSelected ? 'all-active' : ''
              }`}
              aria-pressed={isSelected}
            >
              <span className="material-icons">{getCategoryIcon(category)}</span>
              <span className="category-label">{getCategoryLabel(category)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
