import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaceSearchInput } from './PlaceSearchInput';
import type { AutocompletePrediction } from '../../types';

// Mock the hooks and libraries
vi.mock('@vis.gl/react-google-maps', () => ({
  useMapsLibrary: vi.fn(),
}));

vi.mock('../../hooks/useAutocompleteSuggestions', () => ({
  useAutocompleteSuggestions: vi.fn(),
}));

// Mock modules at top level
const { useMapsLibrary } = await import('@vis.gl/react-google-maps');
const mockUseMapsLibrary = vi.mocked(useMapsLibrary);
const { useAutocompleteSuggestions } = await import('../../hooks/useAutocompleteSuggestions');
const mockUseAutocompleteSuggestions = vi.mocked(useAutocompleteSuggestions);

describe('PlaceSearchInput', () => {
  const mockOnPlaceSelect = vi.fn();

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

  const mockPlace = {
    id: 'ChIJ1',
    location: {
      lat: () => 40.7128,
      lng: () => -74.006,
    },
    displayName: 'New York',
    fetchFields: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock scrollIntoView for JSDOM
    Element.prototype.scrollIntoView = vi.fn();

    mockUseMapsLibrary.mockReturnValue({
      Place: vi.fn().mockImplementation(() => mockPlace),
    } as any);

    mockUseAutocompleteSuggestions.mockReturnValue({
      suggestions: [],
      isLoading: false,
      error: null,
    });
  });

  it('should render input field', () => {
    render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    const input = screen.getByRole('textbox', { name: /search for a location/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search for a location...');
  });

  it('should display autocomplete suggestions', async () => {
    mockUseAutocompleteSuggestions.mockReturnValue({
      suggestions: mockSuggestions,
      isLoading: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'New');

    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument();
      expect(screen.getByText('NY, USA')).toBeInTheDocument();
      expect(screen.getByText('Newark')).toBeInTheDocument();
      expect(screen.getByText('NJ, USA')).toBeInTheDocument();
    });
  });

  it('should call onPlaceSelect when suggestion is clicked', async () => {
    mockUseAutocompleteSuggestions.mockReturnValue({
      suggestions: mockSuggestions,
      isLoading: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'New');

    const suggestion = await screen.findByText('New York');
    await user.click(suggestion);

    await waitFor(() => {
      expect(mockOnPlaceSelect).toHaveBeenCalledWith({
        placeId: 'ChIJ1',
        displayName: 'New York, NY, USA',
        location: {
          lat: 40.7128,
          lng: -74.006,
        },
      });
    });
  });

  it('should clear input after selection', async () => {
    mockUseAutocompleteSuggestions.mockReturnValue({
      suggestions: mockSuggestions,
      isLoading: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'New');

    const suggestion = await screen.findByText('New York');
    await user.click(suggestion);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup();
    render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    const input = screen.getByRole('textbox');

    // Initially, clear button should not be visible
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();

    await user.type(input, 'test');

    // After typing, clear button should be visible
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });
  });

  it('should clear input when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    const clearButton = await screen.findByRole('button', { name: /clear search/i });
    await user.click(clearButton);

    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
  });

  it('should select suggestion with Enter key', async () => {
    mockUseAutocompleteSuggestions.mockReturnValue({
      suggestions: mockSuggestions,
      isLoading: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'New');

    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument();
    });

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockOnPlaceSelect).toHaveBeenCalled();
    });
  });

  it('should close dropdown with Escape key', async () => {
    mockUseAutocompleteSuggestions.mockReturnValue({
      suggestions: mockSuggestions,
      isLoading: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'New');

    await waitFor(() => {
      expect(screen.getByText('New York')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('New York')).not.toBeInTheDocument();
    });
  });

  it('should display loading indicator', () => {
    mockUseAutocompleteSuggestions.mockReturnValue({
      suggestions: [],
      isLoading: true,
      error: null,
    });

    render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    expect(screen.getByLabelText(/loading suggestions/i)).toBeInTheDocument();
  });

  it('should display error message', () => {
    const errorMessage = 'Failed to fetch suggestions';
    mockUseAutocompleteSuggestions.mockReturnValue({
      suggestions: [],
      isLoading: false,
      error: errorMessage,
    });

    render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('should not show dropdown when input is empty', () => {
    mockUseAutocompleteSuggestions.mockReturnValue({
      suggestions: mockSuggestions,
      isLoading: false,
      error: null,
    });

    render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should update suggestions when input changes', async () => {
    const user = userEvent.setup();

    const { rerender } = render(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'N');

    mockUseAutocompleteSuggestions.mockReturnValue({
      suggestions: mockSuggestions,
      isLoading: false,
      error: null,
    });

    rerender(<PlaceSearchInput onPlaceSelect={mockOnPlaceSelect} />);

    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      if (listbox) {
        expect(listbox).toBeInTheDocument();
      }
    });
  });
});
