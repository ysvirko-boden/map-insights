# Comprehensive Guide: Modern SPA Development with TypeScript & React

## Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [TypeScript Configuration](#typescript-configuration)
4. [Build & Compilation](#build--compilation)
5. [Code Quality & Linting](#code-quality--linting)
6. [Unit Testing](#unit-testing)
7. [Development Workflow](#development-workflow)
8. [Production Build & Deployment](#production-build--deployment)
9. [Best Practices](#best-practices)

---

## 1. Development Environment Setup

### Prerequisites
- **Node.js**: v20+ (LTS recommended)
- **Package Manager**: npm/pnpm/yarn
- **IDE**: VS Code with extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Error Lens

### Initial Setup
```bash
cd src/frontend
npm install
```

---

## 2. Project Structure

```
src/frontend/
├── public/                 # Static assets (favicon, robots.txt)
├── src/
│   ├── assets/            # Images, fonts, icons
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Generic components (Button, Input)
│   │   └── feature/       # Feature-specific components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route/page components
│   ├── services/          # API clients, external services
│   ├── store/             # State management (Zustand)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Helper functions
│   ├── styles/            # Global styles, theme
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Application entry point
│   └── vite-env.d.ts      # Vite type declarations
├── tests/                 # Test utilities, setup
├── .env.example           # Environment variables template
├── .prettierrc            # Prettier configuration
├── eslint.config.js       # ESLint configuration
├── tsconfig.json          # TypeScript base config
├── tsconfig.app.json      # App-specific TypeScript config
├── vite.config.ts         # Vite configuration
├── vitest.config.ts       # Vitest test configuration
└── package.json           # Dependencies and scripts
```

---

## 3. TypeScript Configuration

### Best Practices

#### Strict Mode
Always enable strict mode for type safety:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### Path Aliases
Configure path aliases for clean imports:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
```

#### Type Organization
- **Global types**: `src/types/global.d.ts`
- **Component types**: Co-locate with components
- **API types**: `src/types/api.ts`
- **Utility types**: `src/types/utils.ts`

---

## 4. Build & Compilation

### Vite Configuration

Vite is a modern build tool that provides:
- ⚡ Lightning-fast HMR (Hot Module Replacement)
- 📦 Optimized production builds
- 🔧 Plugin ecosystem

#### Key Features in vite.config.ts:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },
  
  // Dev server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  
  // Build optimization
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        }
      }
    }
  }
})
```

### Build Commands

```bash
# Development server with HMR
npm run dev

# Type check only
npm run type-check

# Production build
npm run build

# Preview production build locally
npm run preview
```

### TypeScript Compilation

- **Development**: Vite handles transpilation via esbuild (faster)
- **Production**: `tsc -b` validates types before build
- **CI/CD**: Always run type checking separately

---

## 5. Code Quality & Linting

### ESLint Configuration

ESLint ensures code quality and consistency. Modern flat config:

```javascript
// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // React Refresh
      'react-refresh/only-export-components': 'warn',
      
      // TypeScript
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_' 
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
    }
  }
]
```

### Prettier Configuration

Prettier ensures consistent formatting:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### Integration

```bash
# Lint all files
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format all files
npm run format

# Check formatting
npm run format:check
```

---

## 6. Unit Testing

### Vitest Setup

Vitest is a Vite-native test framework with:
- ⚡ Fast execution (powered by Vite)
- 🔧 Jest-compatible API
- 📊 Built-in coverage

#### Configuration (vitest.config.ts):
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
```

### Testing Stack

```json
{
  "devDependencies": {
    "vitest": "^2.1.8",
    "@vitest/ui": "^2.1.8",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^25.0.1"
  }
}
```

### Test Structure

```
tests/
├── setup.ts              # Global test setup
├── utils/                # Test utilities
│   ├── render.tsx        # Custom render function
│   └── mocks.ts          # Mock data
└── __mocks__/            # Module mocks
```

### Writing Tests

#### Component Test Example:
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

#### Hook Test Example:
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter())
    
    expect(result.current.count).toBe(0)
    
    result.current.increment()
    
    expect(result.current.count).toBe(1)
  })
})
```

### Test Commands

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 7. Development Workflow

### Daily Development Cycle

```bash
# 1. Start development server
npm run dev

# 2. Make changes with auto-reload

# 3. Run tests in watch mode (separate terminal)
npm run test:watch

# 4. Lint and format before commit
npm run lint:fix
npm run format
```

### Pre-Commit Checklist

Use **Husky** + **lint-staged** for automated checks:

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Git Hooks

```bash
# .husky/pre-commit
npm run type-check
npm run lint
npm run test:changed
```

---

## 8. Production Build & Deployment

### Build Process

```bash
# 1. Type check
npm run type-check

# 2. Lint
npm run lint

# 3. Test with coverage
npm run test:coverage

# 4. Build for production
npm run build

# 5. Preview build locally
npm run preview
```

### Build Optimization

#### Code Splitting
```typescript
// Lazy loading routes
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  )
}
```

#### Asset Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'utils': ['lodash', 'date-fns'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
```

### Environment Variables

```bash
# .env.development
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MapInsights Dev

# .env.production
VITE_API_URL=https://api.mapinsights.com
VITE_APP_NAME=MapInsights
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

---

## 9. Best Practices

### Component Design

#### 1. Single Responsibility
```typescript
// ❌ Bad: Component does too much
function UserProfile() {
  const [user, setUser] = useState()
  const [posts, setPosts] = useState()
  // fetching logic, rendering, styling...
}

// ✅ Good: Separated concerns
function UserProfile() {
  const user = useUser()
  return <UserProfileView user={user} />
}
```

#### 2. Proper TypeScript Typing
```typescript
// ✅ Type all props
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  // ...
}
```

#### 3. Use Custom Hooks
```typescript
// ✅ Extract reusable logic
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initialValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
```

### State Management

#### Local State
```typescript
// Use useState for component-local state
const [isOpen, setIsOpen] = useState(false)
```

#### Global State (Zustand)
```typescript
import { create } from 'zustand'

interface UserStore {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}))
```

#### Server State (TanStack Query)
```typescript
import { useQuery } from '@tanstack/react-query'

function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### Performance Optimization

#### 1. Memoization
```typescript
// Expensive calculations
const sortedData = useMemo(
  () => data.sort((a, b) => a.value - b.value),
  [data]
)

// Callback functions
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

#### 2. Virtual Lists
```typescript
import { FixedSizeList } from 'react-window'

function LargeList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>{items[index]}</div>
      )}
    </FixedSizeList>
  )
}
```

### Error Handling

#### Error Boundaries
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, info)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
```

### Accessibility

```typescript
// ✅ Good accessibility
<button
  aria-label="Close modal"
  onClick={onClose}
  disabled={isLoading}
>
  <CloseIcon aria-hidden="true" />
</button>

// ✅ Semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>
```

### Code Organization

```typescript
// ✅ Export organization
// components/Button/index.ts
export { Button } from './Button'
export type { ButtonProps } from './Button'

// ✅ Named exports over default
export function Button() { }  // ✅
export default Button         // ❌
```

---

## Summary: Essential Commands

```bash
# Development
npm run dev              # Start dev server
npm run type-check       # Check types
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run format           # Format code

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:ui          # UI mode
npm run test:coverage    # Coverage report

# Production
npm run build            # Production build
npm run preview          # Preview build

# Maintenance
npm outdated             # Check outdated packages
npm audit                # Security audit
npm run clean            # Clean build artifacts
```

---

## Resources

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Vite**: https://vite.dev
- **Vitest**: https://vitest.dev
- **Testing Library**: https://testing-library.com
- **ESLint**: https://eslint.org
- **Prettier**: https://prettier.io

---

**Last Updated**: January 2026
