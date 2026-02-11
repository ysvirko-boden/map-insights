import { useEffect, useState, useRef, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import type { AutocompletePrediction } from '../types';
import { debounce } from '../utils/debounce';

interface UseAutocompleteSuggestionsOptions {
  input: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestOptions?: any;
}

interface UseAutocompleteSuggestionsResult {
  suggestions: AutocompletePrediction[];
  isLoading: boolean;
  error: string | null;
}

export function useAutocompleteSuggestions({
  input,
  requestOptions,
}: UseAutocompleteSuggestionsOptions): UseAutocompleteSuggestionsResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const placesLibrary = useMapsLibrary('places');
  const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionTokenRef = useRef<any>(null);

  // Initialize session token when places library is loaded
  useEffect(() => {
    if (!placesLibrary) return;

    if (!sessionTokenRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken();
    }
  }, [placesLibrary]);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(
    async (searchInput: string) => {
      if (!placesLibrary || !searchInput.trim()) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        const request: any = {
          input: searchInput,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          sessionToken: sessionTokenRef.current ?? undefined,
          ...requestOptions,
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const response = await placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        setSuggestions(response.suggestions as AutocompletePrediction[]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch suggestions';
        setError(errorMessage);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [placesLibrary, requestOptions]
  );

  // Create debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useRef(
    debounce((searchInput: string) => {
      fetchSuggestions(searchInput);
    }, 300)
  ).current;

  // Fetch suggestions when input changes
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    debouncedFetchSuggestions(input);
  }, [input, debouncedFetchSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionTokenRef.current = null;
    };
  }, []);

  return { suggestions, isLoading, error };
}
