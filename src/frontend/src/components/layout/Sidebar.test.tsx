import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';

// Mock the child components
vi.mock('@/components/Map/PlacesFilters', () => ({
  PlacesFilters: () => <div data-testid="places-filters">PlacesFilters</div>,
}));

vi.mock('@/components/Map/LoadPlacesButton', () => ({
  LoadPlacesButton: () => <button data-testid="load-places-button">LoadPlacesButton</button>,
}));

vi.mock('@/store/placesStore', () => {
  const mockState = {
    triggerSearch: vi.fn(),
    searchBounds: null,
    filters: { placeTypes: [], minimumRating: null, limit: 30 },
    mapCenter: null,
  };

  return {
    usePlacesStore: vi.fn((selector: (state: typeof mockState) => unknown) => {
      return selector(mockState);
    }),
  };
});

vi.mock('@/hooks/usePlacesSearch', () => ({
  usePlacesSearch: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
  })),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function renderWithProviders(component: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
}

describe('Sidebar', () => {
  it('should render PlacesFilters component', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByTestId('places-filters')).toBeInTheDocument();
  });

  it('should render LoadPlacesButton component', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByTestId('load-places-button')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = renderWithProviders(<Sidebar className="custom-class" />);

    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toHaveClass('custom-class');
  });

  it('should have places list placeholder section', () => {
    const { container } = renderWithProviders(<Sidebar />);

    const placesListSection = container.querySelector('.sidebar-places-list');
    expect(placesListSection).toBeInTheDocument();
  });
});
