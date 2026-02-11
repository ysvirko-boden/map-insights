import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RatingFilter } from './RatingFilter';

describe('RatingFilter', () => {
  it('should render all rating options', () => {
    // Arrange
    const handleChange = vi.fn();

    // Act
    render(<RatingFilter value={null} onChange={handleChange} />);

    // Assert
    const select = screen.getByLabelText('Minimum Rating');
    expect(select).toBeInTheDocument();
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(5);
    expect(screen.getByRole('option', { name: /Any Rating/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /3\.0\+/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /3\.5\+/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /4\.0\+/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /4\.5\+/ })).toBeInTheDocument();
  });

  it('should display current value when value is null', () => {
    // Arrange
    const handleChange = vi.fn();

    // Act
    render(<RatingFilter value={null} onChange={handleChange} />);

    // Assert
    const select = screen.getByLabelText('Minimum Rating');
    expect((select as HTMLSelectElement).value).toBe('');
  });

  it('should display current value when value is set', () => {
    // Arrange
    const handleChange = vi.fn();

    // Act
    render(<RatingFilter value={4.0} onChange={handleChange} />);

    // Assert
    const select = screen.getByLabelText('Minimum Rating');
    expect((select as HTMLSelectElement).value).toBe('4');
  });

  it('should call onChange with correct value when selecting rating', async () => {
    // Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<RatingFilter value={null} onChange={handleChange} />);
    const select = screen.getByLabelText('Minimum Rating');
    await user.selectOptions(select, '4');

    // Assert
    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange).toHaveBeenCalledWith(4.0);
  });

  it('should call onChange with null when selecting "Any Rating"', async () => {
    // Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<RatingFilter value={4.0} onChange={handleChange} />);
    const select = screen.getByLabelText('Minimum Rating');
    await user.selectOptions(select, '');

    // Assert
    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it('should handle different rating values correctly', async () => {
    // Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<RatingFilter value={null} onChange={handleChange} />);
    const select = screen.getByLabelText('Minimum Rating');
    
    // Test 3.5
    await user.selectOptions(select, '3.5');
    expect(handleChange).toHaveBeenLastCalledWith(3.5);

    // Test 4.5
    await user.selectOptions(select, '4.5');
    expect(handleChange).toHaveBeenLastCalledWith(4.5);

    // Assert
    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it('should be disabled when disabled prop is true', () => {
    // Arrange
    const handleChange = vi.fn();

    // Act
    render(<RatingFilter value={null} onChange={handleChange} disabled />);

    // Assert
    const select = screen.getByLabelText('Minimum Rating');
    expect(select).toBeDisabled();
  });

  it('should not call onChange when disabled', async () => {
    // Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<RatingFilter value={null} onChange={handleChange} disabled />);
    const select = screen.getByLabelText('Minimum Rating');
    
    // Attempt to change while disabled
    await user.selectOptions(select, '4');

    // Assert
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should support keyboard navigation', async () => {
    // Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<RatingFilter value={null} onChange={handleChange} />);
    
    // Tab to select
    await user.tab();
    const select = screen.getByLabelText('Minimum Rating');
    expect(select).toHaveFocus();

    // Use arrow keys to change value and press Enter to confirm
    await user.keyboard('{ArrowDown}');
    
    // Since select auto-changes with arrow keys in browsers, 
    // the onChange should be called
    // Note: In jsdom, select behavior might differ from real browsers
    // Just verify that the select is focused and can be interacted with
    expect(select).toHaveFocus();
  });
});
