---
applyTo: "src/frontend/src/components/**/*.tsx,src/frontend/src/components/**/*.jsx"
---

# React Component Guidelines

## Component Structure
- Keep components small and focused on a single responsibility (<200 lines)
- Use functional components with hooks exclusively
- Export components as named exports for better tree-shaking
- Define props interface/type before the component
- Use TypeScript strict mode for all component definitions

## TypeScript Patterns
- Always define explicit prop types using `interface` or `type`
- Use discriminated unions for components with different states
- Enable strict null checks and handle undefined cases
- Prefer `interface` for component props, `type` for unions/intersections

## State Management
- Use `useState` for local component state
- Use `useReducer` for complex state logic
- Lift state only when necessary - keep it as local as possible
- Use React Context for cross-component state, not prop drilling

## Performance
- Use `memo` strategically, not by default - only for expensive renders
- Wrap callbacks in `useCallback` only when passed to memoized children
- Use `useMemo` for expensive computations, not simple operations
- Avoid inline object/array creation in props when component is memoized

## Hooks
- Place all hooks at the top of components
- Never call hooks conditionally
- Extract complex logic into custom hooks
- Name custom hooks starting with `use`

## Props
- Destructure props in function signature for clarity
- Provide default values using destructuring defaults
- Avoid boolean props named with negatives (use `isDisabled` not `notEnabled`)
- Use children prop for composition

## Styling
- Use CSS Modules for scoped styles (`ComponentName.module.css`)
- Co-locate CSS file with component
- Use className instead of inline styles unless dynamic values
- Compose classnames with clsx library for conditional classes
- Use camelCase for CSS Module class names

## Event Handlers
- Name handlers with `handle` prefix (e.g., `handleClick`)
- Pass event handlers without invoking (onClick={handleClick} not onClick={handleClick()})
- Type events explicitly (e.g., `React.MouseEvent<HTMLButtonElement>`)

## Testing
- Write tests for user interactions and edge cases
- Test components through their public interface (props/events)
- Avoid testing implementation details
- Use `screen` queries from @testing-library/react

## Accessibility
- Use semantic HTML elements
- Add ARIA labels where necessary
- Ensure keyboard navigation works
- Use proper heading hierarchy

## Code Organization
- Group related state and effects together
- Order: props destructuring → state → refs → computed values → effects → handlers → render
- Extract JSX fragments into variables for readability when complex