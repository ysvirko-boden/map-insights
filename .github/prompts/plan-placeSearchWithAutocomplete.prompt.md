# Plan: Place Search with Autocomplete

This feature adds a Google Places autocomplete search box as a floating control at the top-center of the map. Users can search for any location globally, and selecting a result centers the map and displays a marker at that location. Implementation follows the [react-google-maps autocomplete example](https://github.com/visgl/react-google-maps/tree/main/examples/autocomplete) pattern using the Places Autocomplete Data API.

**Key Decisions**:
- **Approach**: Custom build using `useMapsLibrary('places')` hook and Places Autocomplete Data API (not beta web component)
- **UI Position**: Floating control at top-center via `MapControl` component
- **Place Types**: All places (no filtering)
- **Region**: Global search (no geographic restrictions)
- **Place Info**: No info window or details—just center map and show marker
- **State**: Local component state for search input and selected place

**Steps**

1. **Create Place Types** in [src/frontend/src/types/place.ts](src/frontend/src/types/place.ts)
   - Define `Place` interface with `placeId`, `displayName`, `location` (lat/lng)
   - Define `AutocompletePrediction` type matching Google API response structure
   - Export from [types/index.ts](src/frontend/src/types/index.ts)

2. **Create Debounce Utility** in [src/frontend/src/utils/debounce.ts](src/frontend/src/utils/debounce.ts)
   - Generic `debounce` function that delays execution until after wait period
   - Takes callback and delay (300ms default)
   - Returns debounced function
   - Include TypeScript types

3. **Create `useAutocompleteSuggestions` Hook** in [src/frontend/src/hooks/useAutocompleteSuggestions.ts](src/frontend/src/hooks/useAutocompleteSuggestions.ts)
   - Use `useMapsLibrary('places')` from `@vis.gl/react-google-maps`
   - Accept `input` string and optional `requestOptions` parameters
   - Manage `AutocompleteSessionToken` via `useRef` for billing optimization
   - Fetch predictions using Places API `AutocompleteSuggestion.fetchAutocompleteSuggestions()`
   - Return `{ suggestions, isLoading, error }` object (follow `useGeolocation` pattern)
   - Apply debouncing (300ms) to API calls
   - Handle empty input (clear suggestions)
   - Clean up on unmount

4. **Create `PlaceSearchInput` Component** in [src/frontend/src/components/Map/PlaceSearchInput.tsx](src/frontend/src/components/Map/PlaceSearchInput.tsx)
   - Accept `onPlaceSelect` callback prop with `Place` parameter
   - Use `useAutocompleteSuggestions` hook
   - Render text input with controlled value
   - Display autocomplete dropdown when suggestions exist
   - Handle keyboard navigation (arrow keys, enter, escape)
   - Clicking suggestion triggers `onPlaceSelect` callback and clears input
   - Include clear button (X icon) when input has value
   - Style as floating control with appropriate z-index
   - Loading indicator while fetching suggestions
   - Error handling for failed API calls

5. **Create `MapControl` Component** in [src/frontend/src/components/Map/MapControl.tsx](src/frontend/src/components/Map/MapControl.tsx)
   - Wrapper for custom controls positioned on map
   - Accept `position` prop (uses `ControlPosition` enum from `@vis.gl/react-google-maps`)
   - Accept `children` to render custom control content
   - Use `useMap()` hook to access map instance
   - Use map's `controls` array to attach custom control at specified position
   - Handle mounting/unmounting properly
   - Based on @vis.gl/react-google-maps custom control patterns

6. **Update Map Component** in [src/frontend/src/components/Map/Map.tsx](src/frontend/src/components/Map/Map.tsx)
   - Add state: `selectedPlace: Place | null`
   - Add `handlePlaceSelect` function to update `selectedPlace` state and center map
   - Center map using map instance ref: `map.panTo(place.location)` and `map.setZoom(15)`
   - Import `AdvancedMarker` from `@vis.gl/react-google-maps`
   - Render `AdvancedMarker` at `selectedPlace.location` when `selectedPlace` exists
   - Integrate `MapControl` with `position={ControlPosition.TOP_CENTER}`
   - Render `PlaceSearchInput` inside `MapControl`
   - Pass `handlePlaceSelect` to `PlaceSearchInput`

7. **Add Styles** in [src/frontend/src/components/Map/PlaceSearchInput.css](src/frontend/src/components/Map/PlaceSearchInput.css)
   - Search input: white background, rounded corners, shadow, padding
   - Autocomplete dropdown: white background, shadow, positioned below input
   - Suggestion items: hover state, clickable cursor
   - Loading spinner styles
   - Clear button styles
   - Responsive width (min 300px, max 500px)
   - Ensure proper z-index layering

8. **Write Tests for `useAutocompleteSuggestions`** in [src/frontend/src/hooks/useAutocompleteSuggestions.test.ts](src/frontend/src/hooks/useAutocompleteSuggestions.test.ts)
   - Mock `useMapsLibrary` hook
   - Test: returns empty suggestions initially
   - Test: fetches suggestions when input changes
   - Test: sets loading state during fetch
   - Test: handles API errors
   - Test: clears suggestions when input is empty
   - Test: debounces API calls (verify not called immediately)
   - Use `renderHook` and `waitFor` from @testing-library/react

9. **Write Tests for `PlaceSearchInput`** in [src/frontend/src/components/Map/PlaceSearchInput.test.tsx](src/frontend/src/components/Map/PlaceSearchInput.test.tsx)
   - Mock `useAutocompleteSuggestions` hook
   - Test: renders input field
   - Test: displays autocomplete suggestions
   - Test: calls `onPlaceSelect` when suggestion clicked
   - Test: clears input after selection
   - Test: shows clear button when input has value
   - Test: handles keyboard navigation
   - Test: displays loading indicator
   - Test: displays error message on API error
   - Coverage target: >80%

10. **Write Tests for Debounce Utility** in [src/frontend/src/utils/debounce.test.ts](src/frontend/src/utils/debounce.test.ts)
    - Test: delays function execution
    - Test: cancels previous call on rapid invocations
    - Test: passes arguments correctly
    - Use `vi.useFakeTimers()` for time control

11. **Update Map Tests** in [src/frontend/src/components/Map/Map.test.tsx](src/frontend/src/components/Map/Map.test.tsx)
    - Mock `MapControl` and `PlaceSearchInput` components
    - Test: renders search control
    - Test: centers map when place is selected
    - Test: renders marker for selected place
    - Test: marker updates when different place selected

**Verification**

After implementation:
- **Manual Testing**:
  1. Start dev server: `cd src/frontend && npm run dev`
  2. Verify search box appears at top-center of map
  3. Type in search box → autocomplete suggestions appear
  4. Select a suggestion → map centers on location + marker appears
  5. Search for another place → map re-centers + marker moves
  6. Clear search input using X button
  7. Test with various place types (addresses, landmarks, businesses)

- **Automated Testing**:
  ```bash
  cd src/frontend
  npm test -- PlaceSearchInput
  npm test -- useAutocompleteSuggestions
  npm test -- debounce
  npm test -- Map
  npm run test:coverage  # Verify >80% coverage
  ```

- **Type Checking**: `npm run type-check`
- **Linting**: `npm run lint`

**Dependencies**: No new packages needed—`@vis.gl/react-google-maps` v1.7.1 already includes Places API support via `useMapsLibrary('places')` hook.

---

**Ready for Implementation?** This plan is ready to execute. The feature will integrate seamlessly with existing code patterns and follow all project conventions (TypeScript strict mode, functional components, testing requirements, etc.).
