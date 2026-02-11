/**
 * Skeleton loader component
 * Reusable loading placeholder with various styles
 */

import './Skeleton.css';

export interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  className?: string;
}

export function Skeleton({
  width,
  height,
  variant = 'rectangular',
  className = '',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100px'),
  };

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

/**
 * Specialized skeleton for PlaceCard
 * Matches the layout of a collapsed place card
 */
export function PlaceCardSkeleton() {
  return (
    <div className="place-card-skeleton" aria-busy="true" aria-live="polite">
      <div className="place-card-skeleton-header">
        <Skeleton variant="circular" width="28px" height="28px" />
        <div className="place-card-skeleton-content">
          <Skeleton variant="text" height="18px" width="70%" />
          <Skeleton variant="text" height="14px" width="50%" />
        </div>
      </div>
    </div>
  );
}
