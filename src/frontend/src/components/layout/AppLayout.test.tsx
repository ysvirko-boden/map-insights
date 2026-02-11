import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppLayout } from './AppLayout';

// Mock the useTheme hook
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

// Mock the Sidebar component since it now has complex dependencies
vi.mock('./Sidebar', () => ({
  Sidebar: () => <div><h2>Sidebar</h2></div>,
}));

import { useTheme } from '../../contexts/ThemeContext';

describe('AppLayout', () => {
  beforeEach(() => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'system',
      resolvedTheme: 'light',
      setMode: vi.fn(),
    } as never);
  });

  it('should render all layout sections', () => {
    render(
      <AppLayout>
        <div>Main content</div>
      </AppLayout>
    );

    expect(screen.getByRole('heading', { name: /map insights/i })).toBeInTheDocument();
    expect(screen.getByText(/main content/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /sidebar/i })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should render children in main content area', () => {
    render(
      <AppLayout>
        <div data-testid="test-content">Test content</div>
      </AppLayout>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });
});
