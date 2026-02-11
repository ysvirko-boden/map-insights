import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../../../contexts/ThemeContext';

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

// Wrapper with ThemeProvider
function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all theme buttons', () => {
      renderWithTheme(<ThemeToggle />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('should render light theme button', () => {
      renderWithTheme(<ThemeToggle />);

      const lightButton = screen.getByRole('button', { name: /light/i });
      expect(lightButton).toBeInTheDocument();
    });

    it('should render dark theme button', () => {
      renderWithTheme(<ThemeToggle />);

      const darkButton = screen.getByRole('button', { name: /dark/i });
      expect(darkButton).toBeInTheDocument();
    });

    it('should render system theme button', () => {
      renderWithTheme(<ThemeToggle />);

      const systemButton = screen.getByRole('button', { name: /system/i });
      expect(systemButton).toBeInTheDocument();
    });

    it('should show active state for current theme', () => {
      renderWithTheme(<ThemeToggle />);

      // Default is system mode
      const systemButton = screen.getByRole('button', { name: /system/i });
      expect(systemButton).toHaveClass('theme-toggle-button--active');
    });
  });

  describe('User interactions', () => {
    it('should switch to light theme when light button clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle />);

      const lightButton = screen.getByRole('button', { name: /light/i });
      await user.click(lightButton);

      expect(lightButton).toHaveClass('theme-toggle-button--active');
      expect(lightButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should switch to dark theme when dark button clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle />);

      const darkButton = screen.getByRole('button', { name: /dark/i });
      await user.click(darkButton);

      expect(darkButton).toHaveClass('theme-toggle-button--active');
      expect(darkButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should switch to system theme when system button clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle />);

      // First switch to light
      const lightButton = screen.getByRole('button', { name: /light/i });
      await user.click(lightButton);

      // Then switch back to system
      const systemButton = screen.getByRole('button', { name: /system/i });
      await user.click(systemButton);

      expect(systemButton).toHaveClass('theme-toggle-button--active');
      expect(systemButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should deactivate previous theme when switching', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle />);

      const lightButton = screen.getByRole('button', { name: /light/i });
      const darkButton = screen.getByRole('button', { name: /dark/i });

      await user.click(lightButton);
      expect(lightButton).toHaveClass('theme-toggle-button--active');

      await user.click(darkButton);
      expect(darkButton).toHaveClass('theme-toggle-button--active');
      expect(lightButton).not.toHaveClass('theme-toggle-button--active');
    });

    it('should persist theme selection in localStorage', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle />);

      const darkButton = screen.getByRole('button', { name: /dark/i });
      await user.click(darkButton);

      expect(localStorage.getItem('theme-preference')).toBe(JSON.stringify('dark'));
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithTheme(<ThemeToggle />);

      expect(screen.getByRole('button', { name: /switch to light theme/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /use system theme/i })).toBeInTheDocument();
    });

    it('should have aria-pressed attribute', () => {
      renderWithTheme(<ThemeToggle />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-pressed');
      });
    });

    it('should set aria-pressed="true" for active theme', () => {
      renderWithTheme(<ThemeToggle />);

      const systemButton = screen.getByRole('button', { name: /system/i });
      expect(systemButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should set aria-pressed="false" for inactive themes', () => {
      renderWithTheme(<ThemeToggle />);

      const lightButton = screen.getByRole('button', { name: /light/i });
      const darkButton = screen.getByRole('button', { name: /dark/i });

      expect(lightButton).toHaveAttribute('aria-pressed', 'false');
      expect(darkButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have title attribute for tooltips', () => {
      renderWithTheme(<ThemeToggle />);

      expect(screen.getByRole('button', { name: /light/i })).toHaveAttribute('title', 'Light');
      expect(screen.getByRole('button', { name: /dark/i })).toHaveAttribute('title', 'Dark');
      expect(screen.getByRole('button', { name: /system/i })).toHaveAttribute('title', 'System');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle />);

      const lightButton = screen.getByRole('button', { name: /light/i });

      // Tab to button
      await user.tab();
      
      // Press Enter
      await user.keyboard('{Enter}');

      expect(lightButton).toHaveClass('theme-toggle-button--active');
    });

    it('should support space key activation', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle />);

      const darkButton = screen.getByRole('button', { name: /dark/i });

      // Focus and activate with space
      darkButton.focus();
      await user.keyboard(' ');

      expect(darkButton).toHaveClass('theme-toggle-button--active');
    });
  });

  describe('Visual states', () => {
    it('should have theme-toggle container class', () => {
      const { container } = renderWithTheme(<ThemeToggle />);

      expect(container.querySelector('.theme-toggle')).toBeInTheDocument();
    });

    it('should apply icon class to icons', () => {
      const { container } = renderWithTheme(<ThemeToggle />);

      const icons = container.querySelectorAll('.theme-toggle-icon');
      expect(icons).toHaveLength(3);
    });

    it('should hide icon text from screen readers', () => {
      const { container } = renderWithTheme(<ThemeToggle />);

      const icons = container.querySelectorAll('[role="img"]');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });
});
