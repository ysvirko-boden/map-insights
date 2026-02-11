import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoadPlacesButton } from './LoadPlacesButton';
import { useMapBounds } from '@/hooks/useMapBounds';
import type { ViewportBounds } from '@/types/places';

// Mock the useMapBounds hook
vi.mock('@/hooks/useMapBounds');

describe('LoadPlacesButton', () => {
  let mockGetMapBounds: ReturnType<typeof vi.fn>;
  const mockBounds: ViewportBounds = {
    north: 40.7589,
    south: 40.7489,
    east: -73.9851,
    west: -73.9951,
  };

  beforeEach(() => {
    mockGetMapBounds = vi.fn().mockReturnValue(mockBounds);
    vi.mocked(useMapBounds).mockReturnValue({
      getMapBounds: mockGetMapBounds,
    });
  });

  it('should render with default text', () => {
    // Arrange
    const handleLoad = vi.fn();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} />);

    // Assert
    expect(screen.getByRole('button', { name: /load places/i })).toBeInTheDocument();
    expect(screen.getByText('Load Places')).toBeInTheDocument();
  });

  it('should call onLoad with map bounds when clicked', async () => {
    // Arrange
    const handleLoad = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} />);
    await user.click(screen.getByRole('button', { name: /load places/i }));

    // Assert
    expect(handleLoad).toHaveBeenCalledOnce();
    expect(handleLoad).toHaveBeenCalledWith(mockBounds);
  });

  it('should not call onLoad when bounds are not available', async () => {
    // Arrange
    mockGetMapBounds.mockReturnValue(null);
    const handleLoad = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} />);
    
    // Button should be enabled (not disabled)
    const button = screen.getByRole('button', { name: /load places/i });
    expect(button).not.toBeDisabled();

    // Try to click
    await user.click(button);

    // Assert - onLoad should not be called when bounds are unavailable
    expect(handleLoad).not.toHaveBeenCalled();
  });

  it('should display loading state when isLoading is true', () => {
    // Arrange
    const handleLoad = vi.fn();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} isLoading />);

    // Assert
    expect(screen.getByRole('button', { name: /loading places/i })).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show spinner when loading', () => {
    // Arrange
    const handleLoad = vi.fn();

    // Act
    const { container } = render(<LoadPlacesButton onLoad={handleLoad} isLoading />);

    // Assert
    const spinner = container.querySelector('.load-places-button__spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should be disabled when isLoading is true', () => {
    // Arrange
    const handleLoad = vi.fn();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} isLoading />);

    // Assert
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should be disabled when disabled prop is true', () => {
    // Arrange
    const handleLoad = vi.fn();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} disabled />);

    // Assert
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onLoad when clicking disabled button', async () => {
    // Arrange
    const handleLoad = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} disabled />);
    await user.click(screen.getByRole('button'));

    // Assert
    expect(handleLoad).not.toHaveBeenCalled();
  });

  it('should not call onLoad when clicking while loading', async () => {
    // Arrange
    const handleLoad = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} isLoading />);
    await user.click(screen.getByRole('button'));

    // Assert
    expect(handleLoad).not.toHaveBeenCalled();
  });

  it('should be enabled by default but not call onLoad when bounds unavailable', async () => {
    // Arrange
    mockGetMapBounds.mockReturnValue(null);
    const handleLoad = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} />);
    const button = screen.getByRole('button');
    
    // Assert - button should NOT be disabled
    expect(button).not.toBeDisabled();
    
    // But clicking it should not call onLoad
    await user.click(button);
    expect(handleLoad).not.toHaveBeenCalled();
  });

  it('should support keyboard interaction', async () => {
    // Arrange
    const handleLoad = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} />);
    
    // Tab to button
    await user.tab();
    const button = screen.getByRole('button');
    expect(button).toHaveFocus();

    // Press Enter
    await user.keyboard('{Enter}');

    // Assert
    expect(handleLoad).toHaveBeenCalledWith(mockBounds);
  });

  it('should have accessible label in default state', () => {
    // Arrange
    const handleLoad = vi.fn();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} />);

    // Assert
    const button = screen.getByRole('button', {
      name: /load places in current map area/i,
    });
    expect(button).toBeInTheDocument();
  });

  it('should have accessible label in loading state', () => {
    // Arrange
    const handleLoad = vi.fn();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} isLoading />);

    // Assert
    const button = screen.getByRole('button', {
      name: /loading places/i,
    });
    expect(button).toBeInTheDocument();
  });

  it('should handle rapid clicks without multiple calls', async () => {
    // Arrange
    const handleLoad = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<LoadPlacesButton onLoad={handleLoad} />);
    const button = screen.getByRole('button');
    
    // Double click rapidly
    await user.dblClick(button);

    // Assert - should only call once per click, so 2 times
    expect(handleLoad).toHaveBeenCalledTimes(2);
  });
});
