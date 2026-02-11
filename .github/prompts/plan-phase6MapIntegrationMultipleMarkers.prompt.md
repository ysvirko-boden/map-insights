# Plan: Phase 6 - Map Integration Multiple Markers

Integrate places search results with the map by displaying multiple markers for all visible places and implementing bidirectional selection synchronization between map markers and sidebar list. This phase completes the core feature with full map-list interaction.

## Context from Phase 4 & 5 Changes

**Key Implementation Differences:**
1. **No photos**: `PlaceDetails` no longer has `photoUrls` - images removed from display
2. **Backend grid search**: GooglePlacesService divides viewport into grid cells and makes parallel requests
   - Configuration: `MaxParallelRequests`, `GridCellSizeInDegrees`, `MaxGridCells`
   - Results are deduplicated and sorted by review count
3. **Existing components**: PlaceCard, PlacesList, PlacesFilters, LoadPlacesButton all implemented
4. **Store structure**: Already has `triggerSearch` action and `searchBounds` state (seen in Sidebar.tsx)

## Steps

1. **Refactor Map component state management**
   - Update [src/frontend/src/components/Map/Map.tsx](src/frontend/src/components/Map/Map.tsx):
     - Remove local `selectedPlace` state (single place from autocomplete)
     - Import `usePlacesStore` to access `selectedPlaceId` and `hiddenPlaceIds`
     - Get search results from parent component (App) via props
     - Keep autocomplete functionality for backward compatibility
     - Manage two marker types:
       - **Autocomplete marker**: Single marker from PlaceSearchInput (existing yellow marker)
       - **Search markers**: Multiple markers from places search (new blue markers)
   - Add props interface: `places?: PlaceDetails[]` to receive search results from parent

2. **Implement viewport bounds tracking**
   - In MapContent component within [Map.tsx](src/frontend/src/components/Map/Map.tsx):
     - Use `useMap()` hook to get map instance (already imported)
     - Add map event listener for `idle` events (fires after pan/zoom complete)
     - Extract bounds on map movement: `map.getBounds()`
     - Convert Google Maps `LatLngBounds` to `ViewportBounds` type
     - Store in component state: `const [viewportBounds, setViewportBounds] = useState<ViewportBounds | null>(null)`
     - Pass bounds to parent via callback prop: `onBoundsChange?: (bounds: ViewportBounds) => void`
     - Debounce bounds updates (500ms) to prevent excessive callbacks during dragging
   - Create helper function: `convertGoogleBoundsToViewportBounds(googleBounds): ViewportBounds | null`
     - Handle null/undefined bounds
     - Extract: `north: ne.lat(), south: sw.lat(), east: ne.lng(), west: sw.lng()`

3. **Integrate places search with map**
   - Map component receives `places` prop from parent (App or container)
   - Parent (App.tsx) manages:
     - Call `usePlacesSearch(searchBounds, filters)` at App level
     - Pass search results down to Map component
     - Pass search results down to Sidebar component
   - Alternative: Keep search in Sidebar (current), pass results to Map via App
   - Chosen approach: Lift search state to App.tsx for shared access

4. **Render multiple markers for search results**
   - In MapContent component:
     - Filter places: Remove hidden places using `hiddenPlaceIds` from store
     - Filter visible places: `const visiblePlaces = (places || []).filter(p => !hiddenPlaceIds.has(p.placeId))`
     - Map over filtered places and render `AdvancedMarker` for each:
       ```tsx
       {visiblePlaces.map(place => (
         <AdvancedMarker
           key={place.placeId}
           position={place.location}
           onClick={() => handleMarkerClick(place.placeId)}
         >
           <MarkerContent place={place} isSelected={selectedPlaceId === place.placeId} />
         </AdvancedMarker>
       ))}
       ```
     - Marker content: Simple pin with place type icon or emoji
     - Style markers differently from autocomplete marker:
       - Search markers: Blue color `#4285F4` (Google blue)
       - Selected marker: Red color `#EA4335` + larger size (scale 1.2x)
       - Autocomplete marker: Yellow/default color (keep existing)
   - Handle marker click: Call `selectPlace(placeId)` from store

5. **Create MarkerContent component**
   - Create [src/frontend/src/components/Map/MarkerContent.tsx](src/frontend/src/components/Map/MarkerContent.tsx):
     - Props: `place: PlaceDetails`, `isSelected: boolean`, `isAutocomplete?: boolean`
     - Render custom marker pin with icon
     - Use `getPlaceTypeIcon` utility to get appropriate emoji/icon
     - Apply conditional classes for styling
     - Use simple design for performance (avoid heavy images)
   - Create [MarkerContent.css](src/frontend/src/components/Map/MarkerContent.css):
     - `.marker-content` - base styling
     - `.marker-content--selected` - red, larger scale
     - `.marker-content--autocomplete` - yellow
     - `.marker-content--search` - blue
     - Smooth CSS transitions for scale and color
     - Drop shadow for depth

6. **Implement map-to-list synchronization**
   - Marker click already updates store via `selectPlace(placeId)`
   - PlacesList component (implemented in Phase 5) already:
     - Subscribes to `selectedPlaceId` from store
     - Scrolls selected card into view via `useEffect` + `cardRefs`
   - Verify the existing integration works correctly
   - No additional code needed - store pattern handles this automatically

7. **Implement list-to-map synchronization**
   - In MapContent component:
     - Watch `selectedPlaceId` from store with `useEffect`
     - When selection changes from list:
       - **Do NOT pan or zoom** (per refined requirements)
       - Marker highlighting happens automatically via re-render with `isSelected` prop
       - Selected marker will show red + larger via MarkerContent component
   - No explicit synchronization code needed - React state updates handle it

8. **Update App.tsx to coordinate map and sidebar**
   - Update [src/frontend/src/App.tsx](src/frontend/src/App.tsx):
     - Import `usePlacesSearch` hook
     - Get `searchBounds` and `filters` from store
     - Call `const { data, isLoading, error } = usePlacesSearch(searchBounds, filters)`
     - Pass search results to both Map and Sidebar:
       - `<Map places={data?.places} onBoundsChange={handleBoundsChange} />`
       - Sidebar already uses `usePlacesSearch` directly - coordinate to avoid duplicate calls
   - Alternative: Pass viewport bounds from Map to Sidebar, keep search in Sidebar
   - Chosen: Keep search in Sidebar (current), pass places from Sidebar to App to Map via props

9. **Refactor Sidebar to expose search results**
   - Update [src/frontend/src/components/layout/Sidebar.tsx](src/frontend/src/components/layout/Sidebar.tsx):
     - Add prop: `onSearchResultsChange?: (places: PlaceDetails[]) => void`
     - Call callback when search results update
     - Or: Return search results to parent if converting to controlled component
   - Alternative (simpler): Keep Sidebar as-is, duplicate `usePlacesSearch` call in Map
     - TanStack Query caching prevents duplicate network requests
     - Recommended approach for MVP

10. **Add map center to store or calculate from bounds**
    - Update [src/frontend/src/store/placesStore.ts](src/frontend/src/store/placesStore.ts):
      - Add state: `mapCenter: Location | null`
      - Add action: `setMapCenter(center: Location | null) => void`
    - In Map component, extract map center and update store
    - PlacesList reads from store for distance calculations
    - Alternative: Calculate center from searchBounds (simpler)

11. **Add CSS for marker styling**
    - Create [src/frontend/src/components/Map/MarkerContent.css](src/frontend/src/components/Map/MarkerContent.css):
      - Base marker pin design (40x40px)
      - Selected state: scale(1.2), red background
      - Autocomplete: yellow background
      - Search: blue background
      - Smooth transitions: `transition: all 0.2s ease`
      - Z-index for selected markers: higher than others
      - Drop shadow: `box-shadow: 0 2px 4px rgba(0,0,0,0.3)`
    - Import in MarkerContent.tsx

12. **Update Map.test.tsx for multi-marker support**
    - Update [src/frontend/src/components/Map/Map.test.tsx](src/frontend/src/components/Map/Map.test.tsx):
      - Mock `usePlacesStore` to return test data
      - Add test: "renders multiple markers for places array"
      - Add test: "marker click calls selectPlace action"
      - Add test: "selected marker has highlighted styling"
      - Add test: "hidden places are not rendered as markers"
      - Add test: "autocomplete marker and search markers coexist"
      - Mock `useMap` hook for bounds changes
      - Use `screen`, `render` from testing-library

13. **Integration testing**
    - Create [src/frontend/src/components/Map/Map.integration.test.tsx](src/frontend/src/components/Map/Map.integration.test.tsx):
      - Full flow test with real store and query client
      - Test steps:
        1. Render Map with search results
        2. Verify markers appear on map
        3. Simulate marker click
        4. Verify selection in store updated
        5. Verify marker styling updated
      - Mock Google Maps API calls
      - Use `waitFor` for async updates

14. **Handle edge cases**
    - Empty search results: No markers on map, show message in sidebar
    - All places hidden: Show "No places to display" in sidebar, no markers
    - No search triggered: Show initial state with "Load Places" instruction
    - Search loading: Show loading skeletons in PlacesList, keep existing markers visible
    - Search error: Show error message in sidebar, don't block map interaction
    - Map not ready: Disable LoadPlacesButton until map initialized
    - Marker click on hidden place: Should not be possible (filtered before render)

15. **Performance optimization**
    - Memoize marker rendering:
      ```tsx
      const markers = useMemo(() => 
        visiblePlaces.map(place => <AdvancedMarker ... />)
      , [visiblePlaces, selectedPlaceId]);
      ```
    - Debounce viewport bounds updates to reduce re-renders during drag
    - Use `React.memo` for MarkerContent component to prevent unnecessary re-renders
    - Limit markers rendered if results > 100 (though backend already limits to 50 max)
    - Consider virtualization if implementing infinite scroll for places list

## Verification

- Run `npm run type-check` - zero TypeScript errors
- Run `npm test` - all tests pass including new Map tests
- Run `npm run test:coverage` - maintain >80% coverage
- Run `npm run dev` - frontend starts without errors
- Visual verification:
  - Load places via button → Multiple blue markers appear on map
  - Markers positioned correctly at place locations
  - Clicking marker highlights it (red + larger) and selects in list
  - List item highlights and scrolls into view
  - Clicking place in list highlights marker on map (no pan/zoom)
  - Hidden places don't show markers on map
  - Autocomplete search still shows yellow marker (separate from search)
- Performance verification:
  - Load 50 places - smooth rendering and interaction
  - Pan/zoom map - no lag, responsive
  - Select different places - instant highlighting
- Accessibility verification:
  - Markers are keyboard accessible (if supported by AdvancedMarker)
  - Screen reader announces marker content/labels

## Decisions

- **No pan/zoom on list selection**: Per refined requirements, only highlight marker when selecting from list (no map movement)
- **Dual marker system**: Keep autocomplete (yellow) separate from search results (blue) for clarity
- **Selected marker styling**: Red #EA4335 + 1.2x scale for clear visual feedback
- **Marker clustering**: Deferred to post-MVP; backend already limits results (10/30/50), so max 50 markers
- **Viewport bounds tracking**: Use map `idle` event (fires after pan/zoom complete) rather than `bounds_changed` (fires continuously during drag)
- **Search trigger**: Explicit button click (already implemented in Phase 4), not automatic on bounds change
- **Store-centric architecture**: Map and List both subscribe to shared Zustand store for selection state
- **Search state location**: Duplicate `usePlacesSearch` in Map component (TanStack Query caching prevents duplicate requests)
- **Hidden places**: Filter on frontend before rendering markers (consistent with PlacesList filtering)
- **Distance calculation**: Use map center from viewport bounds average, not user location
- **Marker content**: Simple emoji/icon with colored background, not custom images (better performance with AdvancedMarker)
- **No marker info windows**: Details shown in sidebar PlaceCard when selected (cleaner UX, avoids clutter)
- **Error handling**: Show errors in sidebar, don't block map interaction
- **Backward compatibility**: Keep existing autocomplete single-marker functionality intact for place search
- **Component structure**: Create separate MarkerContent component for reusability and testing
- **Map center in store**: Add to store for PlacesList distance calculations
