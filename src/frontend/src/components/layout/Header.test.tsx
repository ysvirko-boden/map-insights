import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

// Mock the useTheme hook
vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

import { useTheme } from '../../contexts/ThemeContext';

describe('Header', () => {
  beforeEach(() => {
    vi.mocked(useTheme).mockReturnValue({
      mode: 'system',
      resolvedTheme: 'light',
      setMode: vi.fn(),
    } as never);
  });

  it('should render the application title', () => {
    render(<Header />);

    expect(screen.getByRole('heading', { name: /map insights/i })).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Header className="custom-class" />);

    const header = container.querySelector('.header');
    expect(header).toHaveClass('custom-class');
  });
});
