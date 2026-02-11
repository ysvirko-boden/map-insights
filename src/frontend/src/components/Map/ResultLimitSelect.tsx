import './ResultLimitSelect.css';

export interface ResultLimitSelectProps {
  value: 10 | 30 | 50;
  onChange: (limit: 10 | 30 | 50) => void;
  disabled?: boolean;
}

const LIMIT_OPTIONS: Array<10 | 30 | 50> = [10, 30, 50];

export function ResultLimitSelect({
  value,
  onChange,
  disabled = false,
}: ResultLimitSelectProps) {
  const handleChange = (limit: 10 | 30 | 50) => {
    if (!disabled) {
      onChange(limit);
    }
  };

  return (
    <div className="result-limit-select">
      <label className="result-limit-select__label">
        Results Per Search
      </label>
      
      <div className="result-limit-select__options" role="radiogroup" aria-labelledby="result-limit-label">
        {LIMIT_OPTIONS.map((limit) => (
          <label key={limit} className="result-limit-select__option">
            <input
              type="radio"
              name="result-limit"
              value={limit}
              checked={value === limit}
              onChange={() => handleChange(limit)}
              disabled={disabled}
              className="result-limit-select__radio"
              aria-label={`Show up to ${limit} places`}
            />
            <span className="result-limit-select__option-text">
              {limit} places
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
