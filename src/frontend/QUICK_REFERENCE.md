# Quick Reference - React TypeScript SPA

## 🚀 Essential Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run preview          # Preview production build

# Quality Checks
npm run type-check       # TypeScript validation
npm run lint             # Check linting
npm run lint:fix         # Fix linting issues
npm run format           # Format all files
npm run format:check     # Check formatting

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:ui          # Interactive UI
npm run test:coverage    # Coverage report

# Building
npm run build            # Production build
npm run clean            # Clean artifacts
```

## 📁 Path Aliases

```typescript
import { Component } from '@/Component'           // src/
import { Button } from '@components/Button'       // src/components/
import { useHook } from '@hooks/useHook'         // src/hooks/
import { helper } from '@utils/helper'           // src/utils/
import { api } from '@services/api'              // src/services/
import type { User } from '@types/user'          // src/types/
import { store } from '@store/store'             // src/store/
import { Page } from '@pages/Page'               // src/pages/
import logo from '@assets/logo.svg'              // src/assets/
```

## 🧩 Component Template

```typescript
import type { ReactNode } from 'react'
import './Component.css'

export interface ComponentProps {
  children?: ReactNode
  variant?: 'primary' | 'secondary'
  onAction?: () => void
}

export function Component({
  children,
  variant = 'primary',
  onAction,
}: ComponentProps) {
  return (
    <div className={`component component--${variant}`}>
      {children}
    </div>
  )
}
```

## 🪝 Hook Template

```typescript
import { useState, useEffect } from 'react'

export function useCustomHook<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)

  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    }
  }, [value])

  return [value, setValue] as const
}
```

## 🧪 Component Test Template

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Component } from './Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component>Test</Component>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Component onAction={handleClick}>Click</Component>)
    await user.click(screen.getByText('Click'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## 🪝 Hook Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCustomHook } from './useCustomHook'

describe('useCustomHook', () => {
  it('works correctly', () => {
    const { result } = renderHook(() => useCustomHook(0))

    expect(result.current[0]).toBe(0)

    act(() => {
      result.current[1](1)
    })

    expect(result.current[0]).toBe(1)
  })
})
```

## 🌐 Environment Variables

```typescript
// .env.local
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MyApp

// Usage in code
const apiUrl = import.meta.env.VITE_API_URL
const appName = import.meta.env.VITE_APP_NAME
```

## 📦 API Service Template

```typescript
// src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL

export interface User {
  id: number
  name: string
  email: string
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`)
  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }
  return response.json()
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })
  if (!response.ok) {
    throw new Error('Failed to create user')
  }
  return response.json()
}
```

## 🎯 Common React Patterns

### Conditional Rendering
```typescript
// Simple conditional
{isLoading && <Spinner />}
{error && <Error message={error} />}

// Ternary
{isLoggedIn ? <Dashboard /> : <Login />}

// Nullish coalescing
<div>{user?.name ?? 'Guest'}</div>
```

### Lists
```typescript
<ul>
  {items.map(item => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>
```

### Event Handlers
```typescript
// Inline
<button onClick={() => handleClick(id)}>Click</button>

// With callback
const handleClick = useCallback((id: number) => {
  console.log(id)
}, [])
```

### Form Handling
```typescript
const [value, setValue] = useState('')

<input
  value={value}
  onChange={e => setValue(e.target.value)}
/>
```

## 🎨 Common Hooks

### useState
```typescript
const [count, setCount] = useState(0)
const [user, setUser] = useState<User | null>(null)
```

### useEffect
```typescript
useEffect(() => {
  // Side effect
  return () => {
    // Cleanup
  }
}, [dependency])
```

### useCallback
```typescript
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b)
  },
  [a, b]
)
```

### useMemo
```typescript
const memoizedValue = useMemo(
  () => computeExpensiveValue(a, b),
  [a, b]
)
```

### useRef
```typescript
const inputRef = useRef<HTMLInputElement>(null)

<input ref={inputRef} />

// Access: inputRef.current?.focus()
```

## 📝 TypeScript Utility Types

```typescript
// Partial - all properties optional
type PartialUser = Partial<User>

// Required - all properties required
type RequiredUser = Required<User>

// Pick - select properties
type UserName = Pick<User, 'name' | 'email'>

// Omit - exclude properties
type UserWithoutId = Omit<User, 'id'>

// Record - key-value pairs
type UserMap = Record<string, User>

// Extract - extract types
type Status = 'loading' | 'success' | 'error'
type SuccessOrError = Exclude<Status, 'loading'>
```

## ♿ Accessibility Patterns

```typescript
// Button
<button
  aria-label="Close modal"
  onClick={onClose}
>
  <CloseIcon aria-hidden="true" />
</button>

// Input
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={!!error}
/>

// Form
<form aria-labelledby="form-title">
  <h2 id="form-title">Contact Form</h2>
  {/* form fields */}
</form>
```

## 🔍 Testing Library Queries

```typescript
// Preferred (accessible)
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByText('Welcome')
screen.getByAltText('Logo')

// Fallback
screen.getByTestId('submit-button')

// Async queries
await screen.findByText('Loading...')

// Query variants
getBy...     // Throws if not found
queryBy...   // Returns null if not found
findBy...    // Async, waits for element
```

## 📊 Test Assertions

```typescript
// Existence
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// Visibility
expect(element).toBeVisible()
expect(element).not.toBeVisible()

// Text content
expect(element).toHaveTextContent('text')

// Classes
expect(element).toHaveClass('active')

// Attributes
expect(element).toHaveAttribute('href', '/home')

// Disabled
expect(element).toBeDisabled()
expect(element).not.toBeDisabled()

// Mock functions
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(2)
expect(mockFn).toHaveBeenCalledWith('arg')
```

## 🚦 Git Workflow

```bash
# Before commit
npm run type-check
npm run lint:fix
npm run format
npm test

# Commit
git add .
git commit -m "feat: add user profile component"

# Before push
npm run build
```

## 📚 Documentation Files

- **[FRONTEND_GUIDE.md](FRONTEND_GUIDE.md)** - Comprehensive guide
- **[SETUP.md](SETUP.md)** - Setup instructions
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Project overview
- **[CHECKLIST.md](CHECKLIST.md)** - Development checklists

## 🆘 Common Issues

### Port already in use
Change port in `vite.config.ts`: `server: { port: 3001 }`

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors in editor
VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### ESLint not working
Check `.vscode/settings.json` and restart VS Code

---

**Keep this reference handy! 📌**
