---
applyTo: "src/frontend/**/*"
---

# Frontend Development Guidelines

## Technology Stack
- **React 19+** with functional components and hooks
- **TypeScript** with strict mode enabled
- **Vite** for build tooling and dev server
- **@vis.gl/react-google-maps** for Google Maps integration
- **Zustand** for client state management (places filters)
- **React Context** for global state (theme system)
- **Vitest** with @testing-library/react for testing
- **ESLint** and **Prettier** for code quality

## Code Quality Standards

### TypeScript
- Enable and follow strict mode - no `any` types allowed
- Always define explicit types for props, state, and return values
- Use `interface` for object shapes, `type` for unions/intersections
- Prefer union types over enums for better tree-shaking
- Use utility types (Partial, Pick, Omit, Record) appropriately

### Import Organization
- Use path aliases: `@/`, `@components/`, `@hooks/`, `@utils/`, etc.
- Group imports: external packages → internal modules → types → styles
- Use named exports over default exports
- Import types with `import type` when possible

### Code Style
- Format all code with Prettier (enforced on save)
- Follow ESLint rules - no warnings or errors allowed
- Use meaningful, descriptive variable and function names
- Keep functions small and focused (< 50 lines)
- Extract complex logic into separate functions or hooks

## Component Development

### Structure
- Use functional components exclusively
- Define prop interfaces before component
- Destructure props in function signature
- Order: props → state → refs → computed values → effects → handlers → render

### Best Practices
- Keep components focused on single responsibility
- Limit component file size (< 200 lines, extract if larger)
- Use composition over prop drilling
- Avoid inline object/array creation in props for memoized components
- Always handle loading and error states

### Naming
- Use PascalCase for component files and names
- Prefix boolean props with `is`, `has`, `should` (e.g., `isLoading`)
- Name event handlers with `handle` prefix (e.g., `handleClick`)
- Use descriptive names that indicate purpose, not implementation

## Routing

### TanStack Router
- **File-based routing**: Define routes in `router.tsx`
- **Type-safe navigation**: Use `useNavigate()` hook for programmatic navigation
- **Link component**: Use `<Link>` from `@tanstack/react-router` for navigation
- **Route guards**: Use `beforeLoad` for auth checks and redirects
- **Lazy loading**: Use `lazy` for code-splitting routes

### Route Structure
- Define root route with layout (header, sidebar, footer)
- Create child routes for pages (home, login, etc.)
- Use `Outlet` component to render nested routes
- Implement 404 NotFound route

### Navigation Patterns
```typescript
// Programmatic navigation
const navigate = useNavigate();
navigate({ to: '/login' });

// Declarative navigation
<Link to="/">Home</Link>
```

### Auth Protection
- Implement `beforeLoad` hooks to check authentication
- Redirect unauthenticated users to login
- Use redirect helper from TanStack Router

## State Management

### Local State
- Use `useState` for simple component state
- Use `useReducer` for complex state machines
- Keep state as local as possible - lift only when necessary

### Global State
- **React Context**: Use for theme system (ThemeProvider pattern)
- **Zustand**: Use for client state (places filters, selected place)
- **TanStack Query**: Use for server state (API calls, caching, background refetch)
- **Custom hooks**: useLocalStorage for localStorage persistence
- Avoid prop drilling - use context or state management

## Custom Hooks

### Guidelines
- Always prefix with `use`
- Return object for multiple values, array for two related values
- Specify all useEffect dependencies correctly
- Clean up side effects (subscriptions, timers, listeners)
- Test hooks independently using renderHook

### Common Patterns
- Extract reusable logic from components
- Encapsulate complex state operations
- Share stateful logic across components
- Handle API calls and data fetching

## Testing Requirements

### Coverage
- Write tests for all components and hooks
- Maintain >80% test coverage
- Test user interactions, not implementation details
- Include edge cases and error scenarios

### Component Tests
- Use @testing-library/react and userEvent
- Query by accessible roles/labels (avoid testId)
- Test through component's public API (props/events)
- Verify loading states, error states, and success states

### Hook Tests
- Use renderHook from @testing-library/react
- Test initial state, updates, and side effects
- Verify cleanup functions are called
- Mock external dependencies

## Performance

### Optimization Strategies
- Use lazy loading for routes: `const Page = lazy(() => import('./Page'))`
- Memoize expensive calculations with useMemo
- Cache callbacks with useCallback when passed to memoized children
- Use React.memo strategically, not by default
- Avoid premature optimization - profile first

### Bundle Size
- Keep bundle size small - monitor in production builds
- Code split by routes
- Lazy load heavy dependencies
- Use tree-shakeable libraries

## Accessibility

### Requirements
- Use semantic HTML elements
- Provide ARIA labels where necessary
- Ensure keyboard navigation works
- Maintain proper heading hierarchy
- Add alt text to all images
- Ensure color contrast meets WCAG standards

### Implementation
- Test with keyboard navigation
- Use proper ARIA attributes
- Provide focus indicators
- Make interactive elements accessible

## Error Handling

### Client Errors
- Implement error boundaries for component errors
- Display user-friendly error messages
- Log errors for debugging (use error tracking service)
- Provide recovery actions when possible

### API Errors
- Handle all API error responses
- Display contextual error messages
- Implement retry logic for transient failures
- Validate data before sending to API

## Environment Configuration

### Variables
- Prefix all environment variables with `VITE_`
- Never commit `.env.local` files
- Use `.env.example` as template
- Type environment variables in `vite-env.d.ts`

### TypeScript Strict Mode Handling
Vite environment variables return `any` in strict mode. Use type assertions:

```typescript
// Option 1: Type assertion (quick)
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

// Option 2: Extend ImportMetaEnv interface (better)
// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_GOOGLE_MAPS_MAP_ID_LIGHT?: string;
  readonly VITE_GOOGLE_MAPS_MAP_ID_DARK?: string;
}
```

### Required Variables
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps JavaScript API key (required)
- `VITE_GOOGLE_MAPS_MAP_ID_LIGHT` - Map ID for light theme (optional)
- `VITE_GOOGLE_MAPS_MAP_ID_DARK` - Map ID for dark theme (optional)

## Build & Deployment

### Pre-Deploy Checklist
- Run `npm run type-check` - no errors
- Run `npm run lint` - no warnings or errors  
- Run `npm test` - all tests passing
- Run `npm run build` - builds successfully
- Check bundle size and optimize if needed

### Production Build
- Enable source maps for debugging
- Implement code splitting for better caching
- Optimize images and assets
- Test production build locally with `npm run preview`

## Code Review Standards

### Required Checks
- TypeScript compiles without errors
- All tests pass
- ESLint shows no warnings or errors
- Code is formatted with Prettier
- No console.log or debugger statements
- Meaningful commit messages

### Quality Criteria
- Code is readable and maintainable
- No code duplication
- Follows established patterns
- Includes necessary tests
- Documentation for complex logic

## Anti-Patterns to Avoid

### Component Issues
- Large components (>200 lines) - extract smaller ones
- Deep prop drilling - use context or state management
- Inline functions in JSX that recreate on each render
- Missing cleanup in useEffect
- Mutating state directly

### TypeScript Issues
- Using `any` type
- Ignoring TypeScript errors with `@ts-ignore`
- Not typing function parameters and returns
- Excessive type assertions

### Performance Issues
- Unnecessary re-renders from inline objects/arrays
- Missing dependency arrays in hooks
- Rendering large lists without virtualization
- Not lazy loading routes

### Testing Issues
- Testing implementation details
- Not testing error cases
- Incomplete test coverage
- Flaky tests that sometimes fail

## Development Workflow

### Daily Workflow
1. Start dev server: `npm run dev`
2. Run tests in watch mode: `npm run test:watch`
3. Make changes with auto-reload
4. Write tests for new features
5. Verify type safety and linting

### Before Committing
1. Format code: `npm run format`
2. Fix linting: `npm run lint:fix`
3. Verify types: `npm run type-check`
4. Run tests: `npm test`
5. Review changes

### Code Organization
- Group related files in feature folders
- Co-locate tests with source files
- Keep file structure flat when possible
- Use index files for clean exports
