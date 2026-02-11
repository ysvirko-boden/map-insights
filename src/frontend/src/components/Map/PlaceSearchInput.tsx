import type { KeyboardEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import type { Place } from '../../types';
import { useAutocompleteSuggestions } from '../../hooks/useAutocompleteSuggestions';
import './PlaceSearchInput.css';

interface PlaceSearchInputProps {
  onPlaceSelect: (place: Place) => void;
}

export function PlaceSearchInput({ onPlaceSelect }: PlaceSearchInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isDismissed, setIsDismissed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const placesLibrary = useMapsLibrary('places');
  const { suggestions, isLoading, error } = useAutocompleteSuggestions({
    input: inputValue,
  });

  // Compute dropdown visibility based on suggestions, input, and dismissal state
  const isDropdownVisible = suggestions.length > 0 && inputValue.trim() !== '' && !isDismissed;

  const handleInputChange = (value: string) => {
    setInputValue(value);
    // Reset selected index when input changes
    setSelectedIndex(-1);
    // Re-show dropdown when user types
    setIsDismissed(false);
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedIndex(-1);
    setIsDismissed(false);
    inputRef.current?.focus();
  };

  const handleSelectPlace = (placeId: string, displayName: string) => {
    if (!placesLibrary) return;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const place = new placesLibrary.Place({ id: placeId });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    void place.fetchFields({
      fields: ['location', 'displayName'],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    }).then(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const location = place.location;
      if (location) {
        const selectedPlace: Place = {
          placeId,
          displayName,
          location: {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            lat: location.lat(),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            lng: location.lng(),
          },
        };

        onPlaceSelect(selectedPlace);
        setInputValue('');
        setSelectedIndex(-1);
        setIsDismissed(false);
        inputRef.current?.blur();
      }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    }).catch((err: unknown) => {
      console.error('Error fetching place details:', err);
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownVisible) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const suggestion = suggestions[selectedIndex];
          handleSelectPlace(
            suggestion.placePrediction.placeId,
            suggestion.placePrediction.text.text
          );
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedIndex(-1);
        setIsDismissed(true);
        inputRef.current?.blur();
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedItem = dropdownRef.current.children[selectedIndex] as HTMLElement;
      selectedItem?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  return (
    <div className="place-search">
      <div className="place-search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="place-search-input"
          placeholder="Search for a location..."
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search for a location"
          aria-autocomplete="list"
          aria-controls="autocomplete-dropdown"
          aria-expanded={isDropdownVisible}
        />
        {isLoading && (
          <div className="place-search-spinner" aria-label="Loading suggestions">
            <div className="spinner" />
          </div>
        )}
        {inputValue && !isLoading && (
          <button
            type="button"
            className="place-search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <div className="place-search-error" role="alert">
          {error}
        </div>
      )}

      {isDropdownVisible && (
        <div
          ref={dropdownRef}
          id="autocomplete-dropdown"
          className="place-search-dropdown"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => {
            const { placeId, text, structuredFormat } = suggestion.placePrediction;
            const mainText = structuredFormat?.mainText?.text || text?.text || placeId;
            const secondaryText = structuredFormat?.secondaryText?.text || '';
            
            return (
              <button
                key={placeId}
                type="button"
                className={`place-search-suggestion ${
                  index === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => handleSelectPlace(placeId, text?.text || mainText)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="suggestion-main">
                  {mainText}
                </div>
                {secondaryText && (
                  <div className="suggestion-secondary">
                    {secondaryText}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
