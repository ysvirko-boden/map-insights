# Plan: Phase 3 - Frontend Data Layer

Build the frontend data infrastructure for places discovery: TypeScript types matching backend DTOs, API client service for backend communication, Zustand store for client state (filters, selection, hidden places), and TanStack Query hook for server state (search results with caching). This establishes the data foundation for UI components in later phases.

## Steps

1. **Create TypeScript type definitions for Places API**
   - Create [src/frontend/src/types/places.ts](src/frontend/src/types/places.ts):
     - `ViewportBounds` interface: `north`, `south`, `east`, `west` (all `number`)
     - `PlaceType` union type with curated values: `'restaurant' | 'hotel' | 'cafe' | 'museum' | 'park' | 'shopping_mall' | 'tourist_attraction' | 'bar' | 'gym' | 'gas_station'`
     - `PlaceSearchFilters` interface: `placeTypes` (`PlaceType[]`), `minimumRating` (`number | null`), `limit` (`10 | 30 | 50`)
     - `PlaceDetails` interface matching backend `PlaceDetailsDto`:
       - `placeId`, `name`, `type` (string, required)
       - `rating` (`number | null`), `userRatingsTotal` (`number | null`)
       - `photoUrls` (string[])
       - `formattedAddress`, `formattedPhoneNumber` (string | null)
       - `openingHours` (`OpeningHours | null`)
       - `location` with `lat` and `lng` (number)
     - `OpeningHours` interface: `openNow` (`boolean | null`), `weekdayText` (`string[] | null`)
     - `PlaceSearchRequest` interface: `viewportBounds` (`ViewportBounds`), `placeTypes` (`string[] | null`), `minimumRating` (`number | null`), `limit` (number)
     - `PlaceSearchResponse` interface: `places` (`PlaceDetails[]`), `totalCount` (number)
   - Export all types using `export type` syntax
   - Use `interface` for object shapes, `type` for unions per TypeScript guidelines
   - Add JSDoc comments for complex types

2. **Update existing Place type and create index export**
   - Update [src/frontend/src/types/place.ts](src/frontend/src/types/place.ts):
     - Keep existing `Place` interface for backward compatibility with autocomplete
     - Add comment indicating this is for autocomplete, while `PlaceDetails` is for search results
   - Update [src/frontend/src/types/index.ts](src/frontend/src/types/index.ts):
     - Export all types from `place.ts`
     - Export all types from `places.ts`
     - Use `export type * from './places'` syntax

3. **Create API service for backend communication**
   - Create [src/frontend/src/services/api.ts](src/frontend/src/services/api.ts):
     - Define `API_BASE_URL` constant: `http://localhost:5000` (consider env var for production)
     - Create `ApiError` class extending `Error` with `statusCode` and `details` properties
     - Create generic `fetchJson` helper function:
       - Accept URL, method, body, headers
       - Handle fetch errors, network errors, HTTP errors
       - Parse JSON response
       - Throw `ApiError` with meaningful messages
       - Type-safe with generics: `fetchJson<T>(url, options): Promise<T>`
   - Create [src/frontend/src/services/placesService.ts](src/frontend/src/services/placesService.ts):
     - Import types from `@types/places`
     - Export `searchPlaces` function:
       - Accept `PlaceSearchRequest` parameter
       - Call `POST /api/places/search` using `fetchJson`
       - Return `PlaceSearchResponse`
       - Type: `(request: PlaceSearchRequest) => Promise<PlaceSearchResponse>`
     - Handle errors gracefully, throw `ApiError` instances

4. **Create Zustand store for Places client state**
   - Create [src/frontend/src/store/placesStore.ts](src/frontend/src/store/placesStore.ts):
     - Define `PlacesState` interface:
       - `filters`: `PlaceSearchFilters` - current filter settings
       - `selectedPlaceId`: `string | null` - currently selected place ID
       - `hiddenPlaceIds`: `Set<string>` - places manually hidden by user
       - `setFilters`: `(filters: Partial<PlaceSearchFilters>) => void`
       - `selectPlace`: `(placeId: string | null) => void`
       - `hidePlace`: `(placeId: string) => void`
       - `resetHiddenPlaces`: `() => void`
       - `resetFilters`: `() => void`
     - Create store using `create` from `zustand`:
       - Initial state: filters with defaults (limit: 30, minimumRating: null, placeTypes: [])
       - Implement actions to update state immutably
       - Use `set` function with state updates
     - Add devtools middleware for debugging: `devtools(...)`
     - Export `usePlacesStore` hook

5. **Create TanStack Query hook for Places search**
   - Create [src/frontend/src/hooks/usePlacesSearch.ts](src/frontend/src/hooks/usePlacesSearch.ts):
     - Import `useQuery` from `@tanstack/react-query`
     - Import `searchPlaces` from `@services/placesService`
     - Import types from `@types/places`
     - Create `usePlacesSearch` custom hook:
       - Accept parameters: `viewportBounds: ViewportBounds | null`, `filters: PlaceSearchFilters`, `enabled?: boolean`
       - Use `useQuery` with:
         - `queryKey`: `['places', 'search', viewportBounds, filters]` - ensures cache invalidation on changes
         - `queryFn`: Call `searchPlaces` with request object
         - `enabled`: Only run when `enabled && viewportBounds !== null`
         - `staleTime`: 5 minutes (from Phase 1 configuration)
         - `retry`: 1 (network errors only)
       - Return object with: `{ data, isLoading, isError, error, refetch }`
       - Type return value explicitly

6. **Add environment variable for API URL**
   - Create [src/frontend/.env.example](src/frontend/.env.example):
     - Add `VITE_API_BASE_URL=http://localhost:5000`
     - Document that this should be copied to `.env.local` for local development
   - Update [src/frontend/src/vite-env.d.ts](src/frontend/src/vite-env.d.ts):
     - Extend `ImportMetaEnv` interface to include `VITE_API_BASE_URL: string`
     - This provides type safety for environment variables
   - Update [services/api.ts](src/frontend/src/services/api.ts):
     - Use `import.meta.env.VITE_API_BASE_URL` instead of hardcoded URL
     - Fallback to `http://localhost:5000` if not defined

7. **Write unit tests for placesService**
   - Create [src/frontend/src/services/placesService.test.ts](src/frontend/src/services/placesService.test.ts):
     - Mock global `fetch` using `vi.fn()`
     - Test successful search returns PlaceSearchResponse
     - Test request body matches expected structure
     - Test API error (400) throws ApiError with correct status
     - Test server error (500) throws ApiError
     - Test network error throws ApiError
     - Use `// Arrange // Act // Assert` comments
     - Use `expect` from vitest, `vi.fn()` for mocks
     - Run `npm test` to verify

8. **Write unit tests for placesStore**
   - Create [src/frontend/src/store/placesStore.test.ts](src/frontend/src/store/placesStore.test.ts):
     - Test initial state has correct defaults
     - Test `setFilters` updates filters (partial and full)
     - Test `selectPlace` sets selected place ID
     - Test `hidePlace` adds to hidden set
     - Test `resetHiddenPlaces` clears hidden set
     - Test `resetFilters` restores default filters
     - Test multiple operations maintain state consistency
     - Use Zustand's store directly in tests (no React rendering needed)
     - Run `npm test` to verify

9. **Write unit tests for usePlacesSearch hook**
   - Create [src/frontend/src/hooks/usePlacesSearch.test.ts](src/frontend/src/hooks/usePlacesSearch.test.ts):
     - Use `renderHook` from `@testing-library/react`
     - Create `QueryClient` wrapper for tests
     - Mock `searchPlaces` service function using `vi.mock`
     - Test hook returns loading state initially
     - Test successful query returns data
     - Test disabled query doesn't fetch (enabled: false)
     - Test null viewport doesn't fetch
     - Test error handling returns error object
     - Test refetch function triggers new request
     - Use `waitFor` for async state updates
     - Run `npm test` to verify

10. **Create helper utilities for Places data**
    - Create [src/frontend/src/utils/places.ts](src/frontend/src/utils/places.ts):
      - `getPlaceTypeLabel` function: Map `PlaceType` to human-readable labels (e.g., 'restaurant' → 'Restaurant', 'shopping_mall' → 'Shopping Mall')
      - `getPlaceTypeIcon` function: Map `PlaceType` to icon identifier (for future icon rendering)
      - `calculateDistance` function: Haversine formula to calculate distance between two lat/lng points (returns distance in meters)
      - `formatDistance` function: Format distance for display (e.g., '1.2 km', '350 m')
      - Export all utility functions
    - Create [src/frontend/src/utils/places.test.ts](src/frontend/src/utils/places.test.ts):
      - Test `getPlaceTypeLabel` for all place types
      - Test `calculateDistance` with known coordinates
      - Test `formatDistance` with various distances
      - Run `npm test` to verify

11. **Add type safety for API responses**
    - Create [src/frontend/src/types/api.ts](src/frontend/src/types/api.ts):
      - `ApiResponse<T>` generic type for successful responses
      - `ApiErrorResponse` interface for error responses with validation errors array
      - `ValidationError` interface: `field` (string), `message` (string)
    - Update [services/api.ts](src/frontend/src/services/api.ts):
      - Use `ApiErrorResponse` type when parsing error responses
      - Include validation errors in `ApiError` details property
      - Handle different error response formats (string message vs validation array)

12. **Update tsconfig paths for new directories**
    - Verify [src/frontend/tsconfig.json](src/frontend/tsconfig.json) has path mappings:
      - `@services/*` → `./src/services/*`
      - `@store/*` → `./src/store/*`
      - `@types/*` → `./src/types/*`
    - These should already exist from vite.config.ts but TypeScript needs them too
    - Add if missing for IDE autocomplete and type checking

## Verification

- Run `npm run type-check` - zero TypeScript errors
- Run `npm test` - all new tests pass (services, store, hook, utilities)
- Verify test coverage: `npm run test:coverage` - new files should have >80% coverage
- Import types in a test file to verify exports work correctly
- Create a simple test component that uses the hook and store to verify integration
- Check Zustand devtools in browser (after running dev server) shows placesStore
- Manual API test: Call `searchPlaces` function with valid request, verify it calls backend correctly
- Verify environment variables are typed in IDE (autocomplete for `import.meta.env.VITE_API_BASE_URL`)

## Decisions

- **ViewportBounds as separate type**: Reusable across request/response, aligns with backend structure
- **PlaceType union type over enum**: Better tree-shaking, simpler type checking, follows TypeScript guidelines
- **Curated place types**: Limit to 10 for MVP simplicity, can expand later
- **Set for hiddenPlaceIds**: Efficient lookups, automatically deduplicates, mutable operations
- **Partial filters update**: `setFilters` accepts partial to update single filter without knowing all values
- **Query key includes bounds + filters**: Ensures cache invalidation when search criteria changes, prevents stale results
- **Enabled parameter in hook**: Allows components to control when search runs, prevents unnecessary requests on mount
- **5-minute staleTime**: Balances fresh data with API quota conservation, matches backend cache strategy
- **Separate api.ts and placesService.ts**: Generic fetch helper reusable for future endpoints, places-specific logic isolated
- **ApiError class**: Structured error handling, includes status code and details for better error messages in UI
- **Haversine distance calculation**: Client-side calculation avoids backend call for distance sorting/filtering
- **Environment variable for API URL**: Production deployment flexibility, different URLs for dev/staging/prod
- **Path aliases**: Cleaner imports, easier refactoring, follows project conventions
