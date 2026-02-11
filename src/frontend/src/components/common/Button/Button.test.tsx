import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies primary variant by default', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn--primary')
  })

  it('applies correct variant class', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn--secondary')
  })

  it('applies correct size class', () => {
    render(<Button size="large">Large button</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn--large')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>)
    const button = screen.getByRole('button')

    expect(button).toHaveClass('btn--loading')
    expect(button).toBeDisabled()
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )
    await user.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('forwards additional props to button element', () => {
    render(
      <Button type="submit" data-testid="submit-button">
        Submit
      </Button>
    )
    const button = screen.getByTestId('submit-button')

    expect(button).toHaveAttribute('type', 'submit')
  })
})
