import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  isLoading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, isLoading && 'btn--loading', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading ? <span className="btn__spinner" /> : children}
    </button>
  )
}
