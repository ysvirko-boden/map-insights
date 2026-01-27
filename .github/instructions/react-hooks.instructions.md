---
applyTo: "src/frontend/src/hooks/**/*.ts,src/frontend/src/hooks/**/*.tsx"
---

# Custom Hooks Guidelines

## Naming
- Always start hook names with `use` prefix
- Use descriptive names that indicate purpose (e.g., `useAuth`, `useFetch`, `useLocalStorage`)
- Follow camelCase convention

## Structure
- Return values as object for multiple returns, use array only for two related values
- Type return values explicitly
- Keep hooks focused on one piece of reusable logic

## Dependencies
- Always specify dependency arrays for useEffect and useMemo
- Use ESLint's exhaustive-deps rule
- Extract stable values outside the hook to minimize dependencies
- Avoid functions in dependency arrays - use useCallback if needed

## Type Safety
- Define generic types for hooks that work with different data types
- Export type definitions for hook return values
- Use TypeScript strict mode

## Common Patterns

### Data Fetching Hooks
- Return loading, error, and data states
- Handle cleanup for cancelled requests
- Use AbortController for fetch cancellation
- Consider using React Query instead for complex data fetching

Example:
```typescript
export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const abortController = new AbortController();
    // fetch implementation
    return () => abortController.abort();
  }, [url]);
  
  return { data, loading, error };
}
```

### State Hooks
- Encapsulate complex state logic
- Provide clear API for state updates
- Consider useReducer for complex state machines

### Side Effect Hooks
- Clean up side effects in return function
- Handle component unmounting gracefully
- Avoid creating memory leaks (event listeners, timers, subscriptions)

## Testing
- Test hooks using @testing-library/react-hooks or renderHook
- Test hook behavior, not implementation
- Verify cleanup functions are called

## Performance
- Memoize expensive computations with useMemo
- Cache callbacks with useCallback when necessary
- Avoid premature optimization

## Anti-Patterns to Avoid
- Don't call hooks conditionally or in loops
- Don't use hooks outside of React components or custom hooks
- Avoid returning too many values (>5) - consider restructuring
- Don't duplicate built-in React hooks behavior