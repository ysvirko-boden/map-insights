import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlacesFilters } from './PlacesFilters';
import { LoadPlacesButton } from './LoadPlacesButton';
import { usePlacesStore } from '@/store/placesStore';
import { useMapBounds } from '@/hooks/useMapBounds';
import type { ViewportBounds } from '@/types/places';

// Mock dependencies
vi.mock('@/hooks/useMapBounds');

describe('PlacesFilters Integration', () => {
  const mockBounds: ViewportBounds = {
    north: 40.7589,
    south: 40.7489,
    east: -73.9851,
    west: -73.9951,
  };

  let mockGetMapBounds: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset store to default state
    const store = usePlacesStore.getState();
    store.resetFilters();
    store.clearSearch();
    
    // Setup map bounds mock
    mockGetMapBounds = vi.fn().mockReturnValue(mockBounds);
    vi.mocked(useMapBounds).mockReturnValue({
      getMapBounds: mockGetMapBounds,
    });
  });

  describe('Full filter interaction flow', () => {
    it('should complete full filter flow: change filters → load places → verify store', async () => {
      // Arrange
      const user = userEvent.setup();

      // Render both components together
      render(
        <div>
          <PlacesFilters />
          <LoadPlacesButton onLoad={vi.fn()} />
        </div>
      );

      // Step 1: Change category filter
      await user.click(screen.getByText('Food & Dining'));
      
      // Verify store updated
      await waitFor(() => {
        const state = usePlacesStore.getState();
        expect(state.filters.categories).toContain('food_dining');
      });

      // Step 2: Change rating filter
      await user.selectOptions(screen.getByLabelText('Minimum Rating'), '4');
      
      // Verify store updated
      await waitFor(() => {
        const state = usePlacesStore.getState();
        expect(state.filters.minimumRating).toBe(4.0);
      });

      // Step 3: Change limit
      await user.click(screen.getByLabelText('Show up to 50 places'));
      
      // Verify store updated
      await waitFor(() => {
        const state = usePlacesStore.getState();
        expect(state.filters.limit).toBe(50);
      });

      // Step 4: Click reset
      await user.click(screen.getByRole('button', { name: /reset/i }));
      
      // Verify filters restored to defaults
      await waitFor(() => {
        const state = usePlacesStore.getState();
        expect(state.filters.categories).toEqual([]);
        expect(state.filters.minimumRating).toBeNull();
        expect(state.filters.limit).toBe(30);
      });
    });

    it('should allow selecting multiple categories', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<PlacesFilters />);
      
      await user.click(screen.getByText('Food & Dining'));
      await user.click(screen.getByText('Coffee Shops'));
      await user.click(screen.getByText('Attractions & Culture'));

      // Assert
      await waitFor(() => {
        const state = usePlacesStore.getState();
        expect(state.filters.categories).toEqual(expect.arrayContaining(['food_dining', 'coffee_shops', 'attractions']));
      });
    });

    it('should deselect category when clicking again', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<PlacesFilters />);
      
      // Select
      await user.click(screen.getByText('Food & Dining'));
      await waitFor(() => {
        expect(usePlacesStore.getState().filters.categories).toContain('food_dining');
      });
      
      // Deselect
      await user.click(screen.getByText('Food & Dining'));

      // Assert
      await waitFor(() => {
        const state = usePlacesStore.getState();
        expect(state.filters.categories).not.toContain('food_dining');
      });
    });

    it('should clear all categories when clicking "All Categories"', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<PlacesFilters />);
      
      // Select some categories
      await user.click(screen.getByText('Food & Dining'));
      await user.click(screen.getByText('Coffee Shops'));
      
      // Click "All Categories" button
      await user.click(screen.getByText('All Categories'));

      // Assert
      await waitFor(() => {
        const state = usePlacesStore.getState();
        expect(state.filters.categories).toEqual([]);
      });
    });

    it('should persist filter changes across component remounts', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act - First render
      const { unmount } = render(<PlacesFilters />);
      await user.click(screen.getByText('Food & Dining'));
      await user.selectOptions(screen.getByLabelText('Minimum Rating'), '4');
      
      unmount();

      // Re-render
      render(<PlacesFilters />);

      // Assert
      expect(screen.getByText('Food & Dining').closest('button')).toHaveClass('selected');
      const ratingSelect = screen.getByLabelText('Minimum Rating');
      expect((ratingSelect as HTMLSelectElement).value).toBe('4');
    });
  });

  describe('LoadPlacesButton integration', () => {
    it('should trigger search with current filters and bounds', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleLoad = vi.fn();

      // Act
      render(
        <div>
          <PlacesFilters />
          <LoadPlacesButton onLoad={handleLoad} />
        </div>
      );

      // Set filters
      await user.click(screen.getByText('Food & Dining'));
      await user.selectOptions(screen.getByLabelText('Minimum Rating'), '4');
      
      // Click load button
      await user.click(screen.getByRole('button', { name: /load places/i }));

      // Assert
      expect(handleLoad).toHaveBeenCalledWith(mockBounds);
      
      // Verify filters are as expected
      const state = usePlacesStore.getState();
      expect(state.filters.categories).toContain('food_dining');
      expect(state.filters.minimumRating).toBe(4.0);
    });

    it('should handle load with no filters set (defaults)', async () => {
      // Arrange
      const user = userEvent.setup();
      const handleLoad = vi.fn();

      // Act
      render(
        <div>
          <PlacesFilters />
          <LoadPlacesButton onLoad={handleLoad} />
        </div>
      );

      // Click load without changing filters
      await user.click(screen.getByRole('button', { name: /load places/i }));

      // Assert
      expect(handleLoad).toHaveBeenCalledWith(mockBounds);
      
      const state = usePlacesStore.getState();
      expect(state.filters.categories).toEqual([]);
      expect(state.filters.minimumRating).toBeNull();
      expect(state.filters.limit).toBe(30);
    });

    it('should enable load button but not call onLoad when map bounds unavailable', async () => {
      // Arrange
      mockGetMapBounds.mockReturnValue(null);
      const handleLoad = vi.fn();
      const user = userEvent.setup();

      // Act
      render(<LoadPlacesButton onLoad={handleLoad} />);
      const button = screen.getByRole('button');
      
      // Assert - button should be enabled
      expect(button).not.toBeDisabled();
      
      // But clicking should not call onLoad
      await user.click(button);
      expect(handleLoad).not.toHaveBeenCalled();
    });

    it('should show loading state', () => {
      // Act
      render(<LoadPlacesButton onLoad={vi.fn()} isLoading />);

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Keyboard accessibility', () => {
    it.skip('should navigate through all filter controls with Tab', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<PlacesFilters />);

      // Tab through controls
      await user.tab(); // Reset button
      expect(screen.getByRole('button', { name: /reset/i })).toHaveFocus();

      await user.tab(); // All Types checkbox
      expect(screen.getByLabelText('All Types')).toHaveFocus();

      await user.tab(); // Restaurant checkbox
      expect(screen.getByLabelText('Restaurant')).toHaveFocus();

      // Continue tabbing...
      await user.tab(); // Hotel
      await user.tab(); // Cafe
      // ... more checkboxes
      
      // At some point we reach the rating select
      for (let i = 0; i < 10; i++) {
        await user.tab();
      }
      // Should eventually reach rating select
    });

    it('should select category with keyboard', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<PlacesFilters />);
      
      // Tab to first category button
      await user.tab(); // Reset
      await user.tab(); // First category
      
      // Press Enter/Space to select
      await user.keyboard('{Enter}');

      // Assert
      await waitFor(() => {
        expect(usePlacesStore.getState().filters.categories.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid filter changes', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<PlacesFilters />);
      
      // Rapidly change filters
      await user.click(screen.getByText('Food & Dining'));
      await user.click(screen.getByText('Coffee Shops'));
      await user.selectOptions(screen.getByLabelText('Minimum Rating'), '4');
      await user.click(screen.getByLabelText('Show up to 50 places'));
      await user.click(screen.getByText('Attractions & Culture'));

      // Assert - all changes should be applied
      await waitFor(() => {
        const state = usePlacesStore.getState();
        expect(state.filters.categories).toContain('food_dining');
        expect(state.filters.categories).toContain('coffee_shops');
        expect(state.filters.categories).toContain('attractions');
        expect(state.filters.minimumRating).toBe(4.0);
        expect(state.filters.limit).toBe(50);
      });
    });

    it('should handle reset after multiple changes', async () => {
      // Arrange
      const user = userEvent.setup();

      // Act
      render(<PlacesFilters />);
      
      // Make multiple changes
      await user.click(screen.getByText('Food & Dining'));
      await user.click(screen.getByText('Coffee Shops'));
      await user.selectOptions(screen.getByLabelText('Minimum Rating'), '4.5');
      await user.click(screen.getByLabelText('Show up to 10 places'));
      
      // Reset
      await user.click(screen.getByRole('button', { name: /reset/i }));

      // Assert - everything should be back to defaults
      await waitFor(() => {
        const state = usePlacesStore.getState();
        expect(state.filters.categories).toEqual([]);
        expect(state.filters.minimumRating).toBeNull();
        expect(state.filters.limit).toBe(30);
      });
    });
  });
});
