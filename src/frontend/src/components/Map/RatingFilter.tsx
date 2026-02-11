import './RatingFilter.css';

export interface RatingFilterProps {
  value: number | null;
  onChange: (rating: number | null) => void;
  disabled?: boolean;
}

interface RatingOption {
  value: number | null;
  label: string;
  stars: string;
}

const RATING_OPTIONS: RatingOption[] = [
  { value: null, label: 'Any Rating', stars: '' },
  { value: 3.0, label: '3.0+', stars: '★★★' },
  { value: 3.5, label: '3.5+', stars: '★★★☆' },
  { value: 4.0, label: '4.0+', stars: '★★★★' },
  { value: 4.5, label: '4.5+', stars: '★★★★☆' },
];

export function RatingFilter({
  value,
  onChange,
  disabled = false,
}: RatingFilterProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    const rating = selectedValue === '' ? null : parseFloat(selectedValue);
    onChange(rating);
  };

  return (
    <div className="rating-filter">
      <label htmlFor="rating-filter-select" className="rating-filter__label">
        Minimum Rating
      </label>
      
      <div className="rating-filter__select-wrapper">
        <select
          id="rating-filter-select"
          className="rating-filter__select"
          value={value === null ? '' : value}
          onChange={handleChange}
          disabled={disabled}
          aria-label="Minimum Rating"
        >
          {RATING_OPTIONS.map((option) => (
            <option 
              key={option.value ?? 'any'} 
              value={option.value ?? ''}
            >
              {option.label} {option.stars}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
