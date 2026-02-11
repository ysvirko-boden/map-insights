---
applyTo: "src/frontend/src/store/**/*.ts,src/frontend/src/store/**/*.tsx,src/frontend/src/contexts/**/*.ts,src/frontend/src/contexts/**/*.tsx"
---

# State Management Guidelines

## State Management Strategy
- Use React Context for simple global state (theme, auth)
- Use Zustand for complex client state (places filters, UI state)
- Use custom hooks like useLocalStorage for persistence
- Keep state as local as possible

## React Context

### When to Use
- Theme/UI preferences
- Authentication state
- Simple global flags
- Values that don't change frequently

### Structure
```typescript
interface AuthContextType {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = useCallback(async (credentials: Credentials) => {
    // implementation
  }, []);
  
  const logout = useCallback(() => {
    setUser(null);
  }, []);
  
  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Best Practices
- Memoize context value to prevent unnecessary re-renders
- Create custom hook for accessing context
- Throw error if hook used outside provider
- Split large contexts into smaller ones
- Use composition over deeply nested providers

## Zustand

### When to Use
- Complex client state (places filters, selection, hidden items)
- State shared across many components
- State that updates frequently
- Need for devtools middleware

### Store Structure
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface StoreState {
  // State
  count: number;
  user: User | null;
  
  // Actions
  increment: () => void;
  decrement: () => void;
  setUser: (user: User | null) => void;
}

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        user: null,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
        setUser: (user) => set({ user }),
      }),
      { name: 'app-storage' }
    )
  )
);
```

### Best Practices
- Split large stores into smaller domain-specific stores
- Use selectors to subscribe to specific state slices
- Group related state and actions together
- Use middleware for persistence and devtools
- Keep actions pure - handle side effects in components

### Selectors
```typescript
import { shallow } from 'zustand/shallow';

// Subscribe to specific slice
const count = useStore((state) => state.count);

// Shallow equality for objects
const user = useStore(
  (state) => ({ name: state.user?.name, email: state.user?.email }),
  shallow
);
```

## TanStack Query (React Query)

### When to Use
- Fetching data from APIs
- Caching server data
- Automatic refetching and revalidation
- Optimistic updates
- Infinite scrolling

### Setup
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Queries
```typescript
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });
}
```

### Mutations
```typescript
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (user: CreateUserDto) => 
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(user),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### Best Practices
- Use query keys consistently (array format)
- Invalidate queries after mutations
- Use optimistic updates for better UX
- Configure staleTime based on data freshness needs
- Handle loading and error states
- Use enabled option for dependent queries

## State Location Decision Tree
1. Does only one component need it? → Local state (useState)
2. Do parent and child need it? → Lift to common parent
3. Do siblings need it? → Lift to common parent or Context
4. Is it complex client state used everywhere? → Zustand
5. Is it simple global state? → React Context
6. Does it need persistence? → useLocalStorage + useState/Context

## Performance
- Avoid creating new objects in selectors
- Use Zustand selectors to subscribe to specific slices
- Memoize context values
- Split large contexts
- Use React.memo strategically on consumers
- Handle Set/Map objects carefully in Zustand (create new instances for updates)

## Anti-Patterns
- Don't put all state in global store
- Avoid using Context for frequently changing values
- Don't mix server and client state in same store
- Avoid prop drilling - but don't over-globalize
- Don't use Redux patterns in Zustand (no switch statements, no action types)
- Don't forget to create new Set/Map instances when updating (spreads don't work)

## Testing
- Mock context providers in tests
- Test store actions independently using Zustand's getState/setState
- Verify state updates happen correctly
- Test localStorage persistence with mock storage

### Example: Testing Zustand Store
```typescript
describe('placesStore', () => {
  beforeEach(() => {
    usePlacesStore.setState({
      filters: DEFAULT_FILTERS,
      selectedPlaceId: null,
    });
  });

  it('should update filters', () => {
    const { setFilters } = usePlacesStore.getState();
    setFilters({ minimumRating: 4.0 });

    expect(usePlacesStore.getState().filters.minimumRating).toBe(4.0);
  });
});
```