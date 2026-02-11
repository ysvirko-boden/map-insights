/**
 * Unit tests for PlaceCategorySelect component
 * Tests category selection, multi-select, and clear functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaceCategorySelect } from './PlaceCategorySelect';

describe('PlaceCategorySelect', () => {
  const mockOnChange = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 10 category buttons', () => {
    render(
      <PlaceCategorySelect selectedCategories={[]} onChange={mockOnChange} />
    );

    expect(screen.getByText('Food & Dining')).toBeInTheDocument();
    expect(screen.getByText('Coffee Shops')).toBeInTheDocument();
    expect(screen.getByText('Groceries & Essentials')).toBeInTheDocument();
    expect(screen.getByText('Attractions & Culture')).toBeInTheDocument();
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Nature & Parks')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
    expect(screen.getByText('Nightlife & Entertainment')).toBeInTheDocument();
  });

  it('displays category icons', () => {
    const { container } = render(
      <PlaceCategorySelect selectedCategories={[]} onChange={mockOnChange} />
    );

    const icons = container.querySelectorAll('.material-icons');
    expect(icons.length).toBe(10); // One icon per category
  });

  it('calls onChange with selected category on single selection', async () => {
    const user = userEvent.setup();
    render(
      <PlaceCategorySelect selectedCategories={[]} onChange={mockOnChange} />
    );

    const foodButton = screen.getByText('Food & Dining').closest('button') as HTMLButtonElement;
    await user.click(foodButton);

    expect(mockOnChange).toHaveBeenCalledWith(['food_dining']);
  });

  it('calls onChange with multiple categories on multi-select', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <PlaceCategorySelect selectedCategories={[]} onChange={mockOnChange} />
    );

    const foodButton = screen.getByText('Food & Dining').closest('button') as HTMLButtonElement;
    await user.click(foodButton);
    expect(mockOnChange).toHaveBeenCalledWith(['food_dining']);

    // Simulate state update after first selection
    rerender(
      <PlaceCategorySelect
        selectedCategories={['food_dining']}
        onChange={mockOnChange}
      />
    );

    const coffeeButton = screen.getByText('Coffee Shops').closest('button') as HTMLButtonElement;
    await user.click(coffeeButton);
    expect(mockOnChange).toHaveBeenCalledWith(['food_dining', 'coffee_shops']);
  });

  it('removes category when clicking selected button', async () => {
    const user = userEvent.setup();
    render(
      <PlaceCategorySelect
        selectedCategories={['food_dining', 'coffee_shops']}
        onChange={mockOnChange}
      />
    );

    const foodButton = screen.getByText('Food & Dining').closest('button') as HTMLButtonElement;
    await user.click(foodButton);

    expect(mockOnChange).toHaveBeenCalledWith(['coffee_shops']);
  });

  it('applies selected class to selected categories', () => {
    render(
      <PlaceCategorySelect
        selectedCategories={['food_dining', 'attractions']}
        onChange={mockOnChange}
      />
    );

    const foodButton = screen.getByText('Food & Dining').closest('button') as HTMLButtonElement;
    const coffeeButton = screen.getByText('Coffee Shops').closest('button') as HTMLButtonElement;

    expect(foodButton).toHaveClass('selected');
    expect(coffeeButton).not.toHaveClass('selected');
  });

  it('shows "All Categories" button when categories are selected', () => {
    render(
      <PlaceCategorySelect
        selectedCategories={['food_dining']}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  it('hides "All Categories" button when no categories are selected', () => {
    render(
      <PlaceCategorySelect selectedCategories={[]} onChange={mockOnChange} />
    );

    expect(screen.queryByText('All Categories')).not.toBeInTheDocument();
  });

  it('clears all categories when clicking "All Categories" button', async () => {
    const user = userEvent.setup();
    render(
      <PlaceCategorySelect
        selectedCategories={['food_dining', 'coffee_shops']}
        onChange={mockOnChange}
      />
    );

    const clearButton = screen.getByText('All Categories');
    await user.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('applies all-active class to buttons when no categories selected', () => {
    const { container } = render(
      <PlaceCategorySelect selectedCategories={[]} onChange={mockOnChange} />
    );

    const buttons = container.querySelectorAll('.category-button');
    buttons.forEach((button) => {
      expect(button).toHaveClass('all-active');
    });
  });

  it('removes all-active class when categories are selected', () => {
    const { container } = render(
      <PlaceCategorySelect
        selectedCategories={['food_dining']}
        onChange={mockOnChange}
      />
    );

    const buttons = container.querySelectorAll('.category-button');
    buttons.forEach((button) => {
      expect(button).not.toHaveClass('all-active');
    });
  });

  it('sets aria-pressed correctly for selected categories', () => {
    render(
      <PlaceCategorySelect
        selectedCategories={['food_dining']}
        onChange={mockOnChange}
      />
    );

    const foodButton = screen.getByText('Food & Dining').closest('button') as HTMLButtonElement;
    const coffeeButton = screen.getByText('Coffee Shops').closest('button') as HTMLButtonElement;

    expect(foodButton).toHaveAttribute('aria-pressed', 'true');
    expect(coffeeButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('handles rapid category toggling', async () => {
    const user = userEvent.setup();
    render(
      <PlaceCategorySelect selectedCategories={[]} onChange={mockOnChange} />
    );

    const foodButton = screen.getByText('Food & Dining').closest('button') as HTMLButtonElement;
    const coffeeButton = screen.getByText('Coffee Shops').closest('button') as HTMLButtonElement;
    const attractionsButton = screen
      .getByText('Attractions & Culture')
      .closest('button') as HTMLButtonElement;

    await user.click(foodButton);
    await user.click(coffeeButton);
    await user.click(attractionsButton);

    expect(mockOnChange).toHaveBeenCalledTimes(3);
  });

  it('renders category header', () => {
    render(
      <PlaceCategorySelect selectedCategories={[]} onChange={mockOnChange} />
    );

    expect(screen.getByText('Place Categories')).toBeInTheDocument();
  });

  it('maintains button order matching ALL_CATEGORIES', () => {
    const { container } = render(
      <PlaceCategorySelect selectedCategories={[]} onChange={mockOnChange} />
    );

    const buttons = container.querySelectorAll('.category-button');
    const labels = Array.from(buttons).map(
      (btn) => btn.querySelector('.category-label')?.textContent
    );

    expect(labels).toEqual([
      'Food & Dining',
      'Coffee Shops',
      'Groceries & Essentials',
      'Attractions & Culture',
      'Shopping',
      'Nature & Parks',
      'Healthcare',
      'Services',
      'Transportation',
      'Nightlife & Entertainment',
    ]);
  });
});
