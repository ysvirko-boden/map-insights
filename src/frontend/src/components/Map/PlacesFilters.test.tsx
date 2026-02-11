import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlacesFilters } from './PlacesFilters';
import { usePlacesStore } from '@/store/placesStore';
import type { PlaceCategory } from '@/types/places';

// Mock the store
vi.mock('@/store/placesStore');

describe('PlacesFilters', () => {
  let mockSetFilters: ReturnType<typeof vi.fn>;
  let mockResetFilters: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetFilters = vi.fn();
    mockResetFilters = vi.fn();

    // Setup default store mock
    vi.mocked(usePlacesStore).mockImplementation((selector) => {
      const state = {
        filters: {
          categories: [] as PlaceCategory[],
          minimumRating: null,
          limit: 30 as const,
        },
        setFilters: mockSetFilters,
        resetFilters: mockResetFilters,
      };

      // @ts-expect-error - selector typing is complex
      return selector(state);
    });
  });

  it('should render all filter components', () => {
    // Act
    render(<PlacesFilters />);

    // Assert
    expect(screen.getByText('Filter Places')).toBeInTheDocument();
    expect(screen.getByText('Place Categories')).toBeInTheDocument();
    expect(screen.getByText('Minimum Rating')).toBeInTheDocument();
    expect(screen.getByText('Results Per Search')).toBeInTheDocument();
  });

  it('should render reset button', () => {
    // Act
    render(<PlacesFilters />);

    // Assert
    const resetButton = screen.getByRole('button', { name: /reset/i });
    expect(resetButton).toBeInTheDocument();
  });

  it('should display current filter values from store', () => {
    // Arrange
    vi.mocked(usePlacesStore).mockImplementation((selector) => {
      const state = {
        filters: {
          categories: ['food_dining', 'coffee_shops'] as PlaceCategory[],
          minimumRating: 4.0,
          limit: 50 as const,
        },
        setFilters: mockSetFilters,
        resetFilters: mockResetFilters,
      };

      // @ts-expect-error - selector typing is complex
      return selector(state);
    });

    // Act
    render(<PlacesFilters />);

    // Assert
    const ratingSelect = screen.getByLabelText('Minimum Rating');
    expect((ratingSelect as HTMLSelectElement).value).toBe('4');

    expect(screen.getByLabelText('Show up to 50 places')).toBeChecked();
  });

  it('should call setFilters when category changes', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<PlacesFilters />);
    await user.click(screen.getByText('Food & Dining'));

    // Assert
    expect(mockSetFilters).toHaveBeenCalledOnce();
    expect(mockSetFilters).toHaveBeenCalledWith({ categories: ['food_dining'] });
  });

  it('should call setFilters when rating changes', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<PlacesFilters />);
    const ratingSelect = screen.getByLabelText('Minimum Rating');
    await user.selectOptions(ratingSelect, '4');

    // Assert
    expect(mockSetFilters).toHaveBeenCalledOnce();
    expect(mockSetFilters).toHaveBeenCalledWith({ minimumRating: 4.0 });
  });

  it('should call setFilters when limit changes', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<PlacesFilters />);
    await user.click(screen.getByLabelText('Show up to 50 places'));

    // Assert
    expect(mockSetFilters).toHaveBeenCalledOnce();
    expect(mockSetFilters).toHaveBeenCalledWith({ limit: 50 });
  });

  it('should call resetFilters when reset button is clicked', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<PlacesFilters />);
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    // Assert
    expect(mockResetFilters).toHaveBeenCalledOnce();
  });

  it('should update multiple filters independently', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<PlacesFilters />);
    
    // Change category
    await user.click(screen.getByText('Food & Dining'));
    expect(mockSetFilters).toHaveBeenLastCalledWith({ categories: ['food_dining'] });

    // Change rating
    await user.selectOptions(screen.getByLabelText('Minimum Rating'), '3.5');
    expect(mockSetFilters).toHaveBeenLastCalledWith({ minimumRating: 3.5 });

    // Change limit
    await user.click(screen.getByLabelText('Show up to 10 places'));
   expect(mockSetFilters).toHaveBeenLastCalledWith({ limit: 10 });

    // Assert
    expect(mockSetFilters).toHaveBeenCalledTimes(3);
  });

  it('should handle empty categories selection', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usePlacesStore).mockImplementation((selector) => {
      const state = {
        filters: {
          categories: ['food_dining'] as PlaceCategory[],
          minimumRating: null,
          limit: 30 as const,
        },
        setFilters: mockSetFilters,
        resetFilters: mockResetFilters,
      };

      // @ts-expect-error - selector typing is complex
      return selector(state);
    });

    // Act
    render(<PlacesFilters />);
    await user.click(screen.getByText('All Categories'));

    // Assert
    expect(mockSetFilters).toHaveBeenCalledWith({ categories: [] });
  });

  it('should have accessible labels for all controls', () => {
    // Act
    render(<PlacesFilters />);

    // Assert
    expect(screen.getByText('Place Categories')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimum Rating')).toBeInTheDocument();
    expect(screen.getByLabelText('Show up to 10 places')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset all filters/i })).toBeInTheDocument();
  });
});
