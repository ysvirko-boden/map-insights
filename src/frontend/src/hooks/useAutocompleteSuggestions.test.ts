import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAutocompleteSuggestions } from './useAutocompleteSuggestions';
import type { AutocompletePrediction } from '../types';

// Mock the @vis.gl/react-google-maps module
vi.mock('@vis.gl/react-google-maps', () => ({
  useMapsLibrary: vi.fn(),
}));

// Mock debounce to return immediate execution for testing
vi.mock('../utils/debounce', () => ({
  debounce: (fn: () => void) => fn,
}));

// Mock modules at top level
const { useMapsLibrary } = await import('@vis.gl/react-google-maps');
const mockUseMapsLibrary = vi.mocked(useMapsLibrary);

describe('useAutocompleteSuggestions', () => {
  const mockSuggestions: AutocompletePrediction[] = [
    {
      placePrediction: {
        place: 'place1',
        placeId: 'ChIJ1',
        text: { text: 'New York, NY, USA' },
        structuredFormat: {
          mainText: { text: 'New York' },
          secondaryText: { text: 'NY, USA' },
        },
      },
    },
    {
      placePrediction: {
        place: 'place2',
        placeId: 'ChIJ2',
        text: { text: 'Newark, NJ, USA' },
        structuredFormat: {
          mainText: { text: 'Newark' },
          secondaryText: { text: 'NJ, USA' },
        },
      },
    },
  ];

  const mockFetchAutocompleteSuggestions = vi.fn();
  const mockAutocompleteSuggestion = {
    fetchAutocompleteSuggestions: mockFetchAutocompleteSuggestions,
  };
  const mockAutocompleteSessionToken = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMapsLibrary.mockReturnValue({
      AutocompleteSuggestion: mockAutocompleteSuggestion,
      AutocompleteSessionToken: mockAutocompleteSessionToken,
    } as any); // Using 'any' for test purposes
  });

  it('should return empty suggestions initially', () => {
    const { result } = renderHook(() =>
      useAutocompleteSuggestions({ input: '' })
    );

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch suggestions when input changes', async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValueOnce({
      suggestions: mockSuggestions,
    });

    const { result } = renderHook(() =>
      useAutocompleteSuggestions({ input: 'New York' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchAutocompleteSuggestions).toHaveBeenCalledWith(
      expect.objectContaining({
        input: 'New York',
      })
    );
    expect(result.current.suggestions).toEqual(mockSuggestions);
    expect(result.current.error).toBeNull();
  });

  it('should set loading state during fetch', async () => {
    mockFetchAutocompleteSuggestions.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ suggestions: [] }), 100))
    );

    const { result } = renderHook(() =>
      useAutocompleteSuggestions({ input: 'test' })
    );

    // Initially should be loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Should eventually finish loading
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 200 }
    );
  });

  it('should handle API errors', async () => {
    const errorMessage = 'API request failed';
    mockFetchAutocompleteSuggestions.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() =>
      useAutocompleteSuggestions({ input: 'test' })
    );

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear suggestions when input is empty', async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValueOnce({
      suggestions: mockSuggestions,
    });

    const { result, rerender } = renderHook(
      (input: string) => useAutocompleteSuggestions({ input }),
      {
        initialProps: 'New York',
      }
    );

    await waitFor(() => {
      expect(result.current.suggestions.length).toBeGreaterThan(0);
    });

    // Clear input
    rerender('');

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should not fetch suggestions when places library is not loaded', () => {
    mockUseMapsLibrary.mockReturnValue(null);

    const { result } = renderHook(() =>
      useAutocompleteSuggestions({ input: 'test' })
    );

    expect(result.current.suggestions).toEqual([]);
    expect(mockFetchAutocompleteSuggestions).not.toHaveBeenCalled();
  });

  it('should handle whitespace-only input', () => {
    const { result } = renderHook(() =>
      useAutocompleteSuggestions({ input: '   ' })
    );

    expect(result.current.suggestions).toEqual([]);
    expect(mockFetchAutocompleteSuggestions).not.toHaveBeenCalled();
  });

  it('should pass custom request options', async () => {
    mockFetchAutocompleteSuggestions.mockResolvedValueOnce({
      suggestions: mockSuggestions,
    });

    const customOptions = {
      includedPrimaryTypes: ['restaurant'],
      locationRestriction: {
        circle: {
          center: { lat: 40.7128, lng: -74.006 },
          radius: 500,
        },
      },
    };

    const { result } = renderHook(() =>
      useAutocompleteSuggestions({
        input: 'pizza',
        requestOptions: customOptions as any,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetchAutocompleteSuggestions).toHaveBeenCalledWith(
      expect.objectContaining({
        input: 'pizza',
        ...customOptions,
      })
    );
  });
});
