---
applyTo: "src/frontend/src/types/**/*.ts,src/frontend/src/types/**/*.d.ts"
---

# TypeScript Type Definitions Guidelines

## File Organization
- One main type/interface per file for complex types
- Group related types in same file for simpler cases
- Use `.d.ts` only for ambient declarations (e.g., vite-env.d.ts)
- Export all types that are used outside the file
- Use `export type` syntax to clearly mark type-only exports

## Naming Conventions
- Use PascalCase for interfaces and types
- Prefix interfaces with `I` only if there's a naming conflict
- Use descriptive names that clearly indicate purpose
- Suffix with type category when helpful (e.g., `UserResponse`, `ApiError`)

## Interface vs Type
- Prefer `interface` for object shapes and component props
- Use `type` for unions, intersections, and primitives
- Use `type` for tuples, mapped types, and function signatures
- `interface` can be extended and merged, `type` uses intersections
- Both work for most cases - consistency matters more than choice

## Best Practices

### Strict Typing
- Enable strict mode in tsconfig.json
- Avoid `any` - use `unknown` when type is truly unknown
- Use `never` for impossible states
- Explicitly type function return values

### Utility Types
- Use built-in utility types (Partial, Pick, Omit, Record, etc.)
- Create custom utility types for repeated patterns
- Document complex utility types with comments

### API Response Types
```typescript
// Generic API response wrapper
export type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: string;
};

// Specific resource types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}
```

### Discriminated Unions
```typescript
// Use for components with different states
type ButtonProps = {
  variant: 'primary';
  onClick: () => void;
} | {
  variant: 'link';
  href: string;
};
```

### Enums vs Union Types
- Prefer union types over enums for better tree-shaking
- Use const assertions for object-like enums
```typescript
// Prefer this
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

// Over this
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}
```

### Environment Variables
- Vite environment variables in `import.meta.env` return `any` type in strict mode
- Use type assertion for known variables:
```typescript
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
```
- Alternatively, extend `ImportMetaEnv` in `vite-env.d.ts`:
```typescript
interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}
```

### Generic Constraints
- Use generic constraints to improve type safety
- Provide default generic types when sensible
```typescript
export interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
}
```

### Readonly and Const
- Use `readonly` for immutable properties
- Use `ReadonlyArray<T>` or `readonly T[]` for immutable arrays
- Use `as const` for literal types

## Documentation
- Add JSDoc comments for exported types
- Explain non-obvious type decisions
- Document generic type parameters

## Common Patterns

### Form Data
```typescript
export interface LoginFormData {
  email: string;
  password: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;
```

### Event Handlers
```typescript
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T> = (data: T) => void | Promise<void>;
```

### Component Props
```typescript
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export type ComponentProps<T = {}> = T & BaseProps;
```

## Avoid
- Don't use `Function` type, specify function signature
- Avoid deep nesting (>3 levels) - create intermediate types
- Don't duplicate types - create shared types
- Avoid prefixing all interfaces with `I`