/**
 * PlaceCard component tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaceCard } from './PlaceCard';
import type { PlaceDetails, Location } from '@/types/places';

describe('PlaceCard', () => {
  const mockPlace: PlaceDetails = {
    placeId: 'place-1',
    name: 'Test Restaurant',
    type: 'restaurant',
    rating: 4.2,
    userRatingsTotal: 123,
    formattedAddress: '123 Main St, City, State 12345',
    formattedPhoneNumber: '+1 (555) 123-4567',
    openingHours: {
      openNow: true,
      weekdayText: [
        'Monday: 9:00 AM – 5:00 PM',
        'Tuesday: 9:00 AM – 5:00 PM',
        'Wednesday: 9:00 AM – 5:00 PM',
      ],
    },
    location: {
      lat: 40.7128,
      lng: -74.006,
    },
  };

  const mockMapCenter: Location = {
    lat: 40.7589,
    lng: -73.9851,
  };

  let mockHandlers: {
    onSelect: ReturnType<typeof vi.fn>;
    onToggleExpand: ReturnType<typeof vi.fn>;
    onHide: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockHandlers = {
      onSelect: vi.fn(),
      onToggleExpand: vi.fn(),
      onHide: vi.fn(),
    };
  });

  it('renders collapsed state correctly', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={false}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('(123 reviews)')).toBeInTheDocument();
    expect(screen.queryByText(/Address:/)).not.toBeInTheDocument();
  });

  it('renders expanded state with additional details', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={true}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Address:')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, City, State 12345')).toBeInTheDocument();
    expect(screen.getByText('Phone:')).toBeInTheDocument();
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('Open now')).toBeInTheDocument();
  });

  it('calls onToggleExpand and onSelect when card header clicked', async () => {
    const user = userEvent.setup();

    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={false}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    // Click on the card name to trigger collapse/expand
    const cardName = screen.getByText('Test Restaurant');
    await user.click(cardName);

    expect(mockHandlers.onToggleExpand).toHaveBeenCalledWith('place-1');
    expect(mockHandlers.onSelect).toHaveBeenCalledWith('place-1');
  });

  it('calls onHide when remove button clicked', async () => {
    const user = userEvent.setup();

    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={false}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Remove from list' });
    await user.click(removeButton);

    expect(mockHandlers.onHide).toHaveBeenCalledWith('place-1');
  });

  it('remove button is available in collapsed state', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={false}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Remove from list' });
    expect(removeButton).toBeInTheDocument();
    expect(removeButton).toHaveAttribute('title', 'Remove from list');
  });

  it('remove button is available in expanded state', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={true}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Remove from list' });
    expect(removeButton).toBeInTheDocument();
  });

  it('remove button click does not trigger expand/collapse', async () => {
    const user = userEvent.setup();

    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={false}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    const removeButton = screen.getByRole('button', { name: 'Remove from list' });
    await user.click(removeButton);

    // Only onHide should be called, not onToggleExpand
    expect(mockHandlers.onHide).toHaveBeenCalledWith('place-1');
    expect(mockHandlers.onToggleExpand).not.toHaveBeenCalled();
  });

  it('applies selected styling when isSelected is true', () => {
    const { container } = render(
      <PlaceCard
        place={mockPlace}
        isSelected={true}
        isExpanded={false}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    const card = container.querySelector('.place-card');
    expect(card).toHaveClass('place-card-selected');
  });

  it('displays distance from map center', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={false}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    // Distance should be calculated and displayed
    const distanceElement = screen.getByText(/km|m/);
    expect(distanceElement).toBeInTheDocument();
  });

  it('handles missing optional data gracefully', () => {
    const minimalPlace: PlaceDetails = {
      ...mockPlace,
      rating: null,
      userRatingsTotal: null,
      formattedAddress: null,
      formattedPhoneNumber: null,
      openingHours: null,
    };

    render(
      <PlaceCard
        place={minimalPlace}
        isSelected={false}
        isExpanded={true}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
    expect(screen.queryByText(/reviews/)).not.toBeInTheDocument();
    expect(screen.queryByText('Address:')).not.toBeInTheDocument();
  });

  it('renders without map center (no distance)', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={false}
        mapCenter={null}
        {...mockHandlers}
      />
    );

    // Distance should not be displayed
    const distanceElements = screen.queryAllByText(/km|m/);
    expect(distanceElements.length).toBe(0);
  });

  it('renders star rating correctly', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={false}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    const starsElement = screen.getByLabelText('Rating: 4.2 out of 5');
    expect(starsElement).toBeInTheDocument();
  });

  it('phone number is clickable link', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={true}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    const phoneLink = screen.getByRole('link', { name: '+1 (555) 123-4567' });
    expect(phoneLink).toHaveAttribute('href', 'tel:+1 (555) 123-4567');
  });

  it('does not collapse when clicking on expanded details', async () => {
    const user = userEvent.setup();

    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={true}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    // Click on address text in details section
    const addressText = screen.getByText('123 Main St, City, State 12345');
    await user.click(addressText);

    // Should not have called onToggleExpand
    expect(mockHandlers.onToggleExpand).not.toHaveBeenCalled();
  });

  it('shows opening hours when available', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={true}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Hours:')).toBeInTheDocument();
    expect(screen.getByText('Open now')).toBeInTheDocument();
    expect(screen.getByText('Monday: 9:00 AM – 5:00 PM')).toBeInTheDocument();
  });

  it('shows closed status when place is closed', () => {
    const closedPlace = {
      ...mockPlace,
      openingHours: {
        openNow: false,
        weekdayText: ['Monday: 9:00 AM – 5:00 PM'],
      },
    };

    render(
      <PlaceCard
        place={closedPlace}
        isSelected={false}
        isExpanded={true}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  // Tests for new enhanced features
  it('displays type field when expanded', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={true}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Type:')).toBeInTheDocument();
    expect(screen.getByText('restaurant')).toBeInTheDocument();
  });

  it('displays coordinates in correct format', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={true}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Coordinates:')).toBeInTheDocument();
    expect(screen.getByText('40.7128, -74.006')).toBeInTheDocument();
  });

  it('renders Google Maps link with correct attributes', () => {
    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={true}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    const mapsLink = screen.getByRole('link', { name: 'Open in Google Maps' });
    expect(mapsLink).toHaveAttribute(
      'href',
      'https://www.google.com/maps/place/?q=place_id:place-1'
    );
    expect(mapsLink).toHaveAttribute('target', '_blank');
    expect(mapsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('Google Maps link prevents event propagation', async () => {
    const user = userEvent.setup();

    render(
      <PlaceCard
        place={mockPlace}
        isSelected={false}
        isExpanded={true}
        mapCenter={mockMapCenter}
        {...mockHandlers}
      />
    );

    const mapsLink = screen.getByRole('link', { name: 'Open in Google Maps' });
    await user.click(mapsLink);

    // Card should not toggle when link is clicked
    expect(mockHandlers.onToggleExpand).not.toHaveBeenCalled();
  });
});
