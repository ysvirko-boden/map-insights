import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultLimitSelect } from './ResultLimitSelect';

describe('ResultLimitSelect', () => {
  it('should render all limit options', () => {
    // Arrange
    const handleChange = vi.fn();

    // Act
    render(<ResultLimitSelect value={30} onChange={handleChange} />);

    // Assert
    expect(screen.getByLabelText('Show up to 10 places')).toBeInTheDocument();
    expect(screen.getByLabelText('Show up to 30 places')).toBeInTheDocument();
    expect(screen.getByLabelText('Show up to 50 places')).toBeInTheDocument();
  });

  it('should check the selected limit', () => {
    // Arrange
    const handleChange = vi.fn();

    // Act
    render(<ResultLimitSelect value={30} onChange={handleChange} />);

    // Assert
    expect(screen.getByLabelText('Show up to 30 places')).toBeChecked();
    expect(screen.getByLabelText('Show up to 10 places')).not.toBeChecked();
    expect(screen.getByLabelText('Show up to 50 places')).not.toBeChecked();
  });

  it('should display current limit correctly', () => {
    // Arrange
    const handleChange = vi.fn();

    // Act
    render(<ResultLimitSelect value={50} onChange={handleChange} />);

    // Assert
    const radio50 = screen.getByLabelText('Show up to 50 places');
    expect(radio50).toBeChecked();
  });

  it('should call onChange with correct limit when selecting 10', async () => {
    // Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<ResultLimitSelect value={30} onChange={handleChange} />);
    await user.click(screen.getByLabelText('Show up to 10 places'));

    // Assert
    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange).toHaveBeenCalledWith(10);
  });

  it('should call onChange with correct limit when selecting 30', async () => {
    // Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<ResultLimitSelect value={10} onChange={handleChange} />);
    await user.click(screen.getByLabelText('Show up to 30 places'));

    // Assert
    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange).toHaveBeenCalledWith(30);
  });

  it('should call onChange with correct limit when selecting 50', async () => {
    // Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<ResultLimitSelect value={30} onChange={handleChange} />);
    await user.click(screen.getByLabelText('Show up to 50 places'));

    // Assert
    expect(handleChange).toHaveBeenCalledOnce();
    expect(handleChange).toHaveBeenCalledWith(50);
  });

  it('should disable all radio buttons when disabled prop is true', () => {
    // Arrange
    const handleChange = vi.fn();

    // Act
    render(<ResultLimitSelect value={30} onChange={handleChange} disabled />);

    // Assert
    expect(screen.getByLabelText('Show up to 10 places')).toBeDisabled();
    expect(screen.getByLabelText('Show up to 30 places')).toBeDisabled();
    expect(screen.getByLabelText('Show up to 50 places')).toBeDisabled();
  });

  it('should not call onChange when clicking disabled radio button', async () => {
    // Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<ResultLimitSelect value={30} onChange={handleChange} disabled />);
    await user.click(screen.getByLabelText('Show up to 10 places'));

    // Assert
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should not change when clicking already selected option', async () => {
    //Arrange
    const handleChange = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<ResultLimitSelect value={30} onChange={handleChange} />);
    await user.click(screen.getByLabelText('Show up to 30 places'));

    // Assert - Radio buttons don't trigger onChange when already selected
    // This is standard HTML radio button behavior
    expect(handleChange).not.toHaveBeenCalled();
  });
});
