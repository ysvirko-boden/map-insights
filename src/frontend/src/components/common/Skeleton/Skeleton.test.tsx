/**
 * Skeleton component tests
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, PlaceCardSkeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('.skeleton');

    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('skeleton-rectangular');
  });

  it('renders text variant', () => {
    const { container } = render(<Skeleton variant="text" />);
    const skeleton = container.querySelector('.skeleton');

    expect(skeleton).toHaveClass('skeleton-text');
  });

  it('renders circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    const skeleton = container.querySelector('.skeleton');

    expect(skeleton).toHaveClass('skeleton-circular');
  });

  it('applies custom width and height', () => {
    const { container } = render(<Skeleton width="200px" height="50px" />);
    const skeleton = container.querySelector('.skeleton');

    expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.querySelector('.skeleton');

    expect(skeleton).toHaveClass('custom-class');
  });

  it('has accessibility attributes', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('.skeleton');

    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('aria-live', 'polite');
  });
});

describe('PlaceCardSkeleton', () => {
  it('renders place card skeleton structure', () => {
    const { container } = render(<PlaceCardSkeleton />);

    expect(container.querySelector('.place-card-skeleton')).toBeInTheDocument();
    expect(container.querySelector('.place-card-skeleton-header')).toBeInTheDocument();
    expect(container.querySelector('.place-card-skeleton-content')).toBeInTheDocument();
  });

  it('has accessibility attributes', () => {
    const { container } = render(<PlaceCardSkeleton />);
    const skeleton = container.querySelector('.place-card-skeleton');

    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('aria-live', 'polite');
  });
});
