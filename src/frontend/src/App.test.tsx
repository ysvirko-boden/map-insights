import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the Map component
vi.mock('./components/Map', () => ({
  Map: () => <div data-testid="map">Map Component</div>,
}));

// Mock the Sidebar component to avoid needing QueryClientProvider
vi.mock('./components/layout/Sidebar', () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar Component</aside>,
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
const mockMatchMedia = {
  matches: false,
  media: '(prefers-color-scheme: dark)',
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
  onchange: null,
};
window.matchMedia = vi.fn().mockImplementation(() => mockMatchMedia);

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the app layout with map', () => {
    render(<App />);

    // Check for layout elements
    expect(screen.getByRole('heading', { name: /map insights/i })).toBeInTheDocument();
    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  describe('Theme integration', () => {
    it('should render theme toggle in header', () => {
      render(<App />);

      // Theme toggle buttons should be present
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3);
      
      // Check for theme buttons
      expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
    });

    it('should apply theme to document element', () => {
      render(<App />);

      // Default should be system mode, which resolves to light
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should switch theme when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      const darkButton = screen.getByRole('button', { name: /dark/i });
      await user.click(darkButton);

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should wrap app with ThemeProvider', () => {
      render(<App />);

      // ThemeProvider should be working (theme toggle visible and functional)
      const systemButton = screen.getByRole('button', { name: /system/i });
      expect(systemButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should persist theme preference', async () => {
      const user = userEvent.setup();
      render(<App />);

      const lightButton = screen.getByRole('button', { name: /light/i });
      await user.click(lightButton);

      expect(localStorage.getItem('theme-preference')).toBe(JSON.stringify('light'));
    });
  });
});

