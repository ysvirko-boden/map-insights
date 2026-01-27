---
applyTo: "src/frontend/**/*.test.ts,src/frontend/**/*.test.tsx,src/frontend/**/*.spec.ts,src/frontend/**/*.spec.tsx"
---

# Testing Guidelines

## Test Framework
- Use Vitest as primary test runner
- Use @testing-library/react for component testing
- Use @testing-library/user-event for user interactions
- Use @testing-library/jest-dom for DOM assertions

## File Organization
- Place test files next to the code they test (e.g., `Button.tsx` → `Button.test.tsx`)
- Name test files with `.test.tsx` or `.spec.tsx` extension
- Group related tests in describe blocks

## Test Structure
- Follow AAA pattern: Arrange, Act, Assert
- One assertion per test when possible
- Use descriptive test names that explain behavior
- Start test names with "should" or use "it/test" with descriptive string

Example:
```typescript
describe('Button', () => {
  it('calls onClick when clicked', async () => {
    // Arrange
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    // Act
    await user.click(screen.getByRole('button'));
    
    // Assert
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Component Testing

### Rendering
- Use `render` from @testing-library/react
- Wrap components in necessary providers (Router, Context, etc.)
- Create custom render function for common wrappers

### Queries
- Prefer accessible queries in this order:
  1. getByRole
  2. getByLabelText
  3. getByPlaceholderText
  4. getByText
  5. getByTestId (last resort)
- Use `screen` instead of destructuring render result
- Use `queryBy` for elements that may not exist
- Use `findBy` for async elements

### User Interactions
- Always use userEvent over fireEvent
- Setup userEvent before each interaction: `const user = userEvent.setup()`
- Test user flows, not implementation details
- Wait for async state updates with `waitFor`

### Assertions
- Use jest-dom matchers for better error messages
- Verify visible behavior, not internal state
- Check accessibility attributes
- Test error states and loading states

## Hook Testing
```typescript
import { renderHook, waitFor } from '@testing-library/react';

test('useFetch returns data', async () => {
  const { result } = renderHook(() => useFetch('/api/users'));
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  
  expect(result.current.data).toBeDefined();
});
```

## Mocking

### Functions
```typescript
const mockFn = vi.fn();
mockFn.mockReturnValue('value');
mockFn.mockResolvedValue('async value');
```

### Modules
```typescript
vi.mock('../api/client', () => ({
  fetchUsers: vi.fn(),
}));
```

### Timers
```typescript
vi.useFakeTimers();
// test code
vi.runAllTimers();
vi.useRealTimers();
```

## Async Testing
- Use async/await syntax
- Use `waitFor` for async assertions
- Use `findBy` queries for elements that appear asynchronously
- Set appropriate timeouts for slow operations

## Coverage
- Aim for meaningful coverage, not 100%
- Focus on critical business logic
- Test edge cases and error handling
- Don't test library code or trivial functions

## Test Data
- Use factories or builders for test data
- Keep test data minimal and relevant
- Use constants for commonly used test values
- Avoid magic numbers and strings

## Best Practices
- Test behavior, not implementation
- Keep tests independent and isolated
- Clean up after tests (automatic with testing-library)
- Avoid testing private methods
- Mock external dependencies (API calls, localStorage, etc.)
- Test accessibility (ARIA labels, keyboard navigation)

## Anti-Patterns to Avoid
- Don't test implementation details (state, internal methods)
- Avoid snapshot tests for components (brittle, not meaningful)
- Don't use `data-testid` unless absolutely necessary
- Avoid accessing component instance or state
- Don't make tests dependent on each other
- Avoid large setup blocks - use helper functions

## Performance
- Use `vi.mock` at module level, not in beforeEach
- Avoid unnecessary re-renders in tests
- Clean up properly to prevent memory leaks
- Use `screen.debug()` sparingly for debugging