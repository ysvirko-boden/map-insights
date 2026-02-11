import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { ThemeProvider, useTheme } from './ThemeContext';
import type { ReactNode } from 'react';

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

// Wrapper component for tests
function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe('ThemeContext', () => {
  let matchMediaMock: Partial<MediaQueryList> & { matches: boolean };

  beforeEach(() => {
    localStorage.clear();
    
    // Mock matchMedia with writable matches property
    matchMediaMock = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    };

    window.matchMedia = vi.fn().mockImplementation(() => matchMediaMock as MediaQueryList);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within ThemeProvider');

      consoleError.mockRestore();
    });

    it('should provide theme context value', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current).toHaveProperty('mode');
      expect(result.current).toHaveProperty('resolvedTheme');
      expect(result.current).toHaveProperty('setMode');
    });
  });

  describe('Theme initialization', () => {
    it('should default to system mode when no preference stored', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('system');
    });

    it('should load theme preference from localStorage', () => {
      localStorage.setItem('theme-preference', JSON.stringify('dark'));

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('dark');
    });

    it('should resolve system theme to light when system prefers light', () => {
      matchMediaMock.matches = false;

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('system');
      expect(result.current.resolvedTheme).toBe('light');
    });

    it('should resolve system theme to dark when system prefers dark', () => {
      matchMediaMock.matches = true;

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.mode).toBe('system');
      expect(result.current.resolvedTheme).toBe('dark');
    });
  });

  describe('Theme switching', () => {
    it('should switch to light theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setMode('light');
      });

      expect(result.current.mode).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });

    it('should switch to dark theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setMode('dark');
      });

      expect(result.current.mode).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    it('should switch to system theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setMode('system');
      });

      expect(result.current.mode).toBe('system');
    });

    it('should persist theme preference in localStorage', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setMode('dark');
      });

      expect(localStorage.getItem('theme-preference')).toBe(JSON.stringify('dark'));
    });
  });

  describe('System theme detection', () => {
    it('should listen for system theme changes', () => {
      renderHook(() => useTheme(), { wrapper });

      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('should update resolved theme when system preference changes', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // Initially light
      expect(result.current.resolvedTheme).toBe('light');

      // Simulate system theme change to dark
      act(() => {
        const callback = (matchMediaMock.addEventListener as ReturnType<typeof vi.fn>).mock
          .calls[0][1] as (event: MediaQueryListEvent) => void;
        callback({ matches: true } as MediaQueryListEvent);
      });

      await waitFor(() => {
        expect(result.current.resolvedTheme).toBe('dark');
      });
    });

    it('should not update resolved theme for non-system modes', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setMode('light');
      });

      // Simulate system theme change
      act(() => {
        const callback = (matchMediaMock.addEventListener as ReturnType<typeof vi.fn>).mock
          .calls[0][1] as (event: MediaQueryListEvent) => void;
        callback({ matches: true } as MediaQueryListEvent);
      });

      // Should stay light (not affected by system change)
      expect(result.current.resolvedTheme).toBe('light');
    });
  });

  describe('DOM updates', () => {
    it('should apply data-theme attribute to document', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setMode('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should update data-theme attribute when theme changes', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setMode('light');
      });

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });

      act(() => {
        result.current.setMode('dark');
      });

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });
  });

  describe('Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const { unmount } = renderHook(() => useTheme(), { wrapper });

      unmount();

      expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });
  });
});
