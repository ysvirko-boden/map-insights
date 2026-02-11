import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('should render copyright text with current year', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear} Map Insights`, 'i'))
    ).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Footer className="custom-class" />);

    const footer = container.querySelector('.footer');
    expect(footer).toHaveClass('custom-class');
  });
});
