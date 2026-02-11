# Plan: Phase 4 - UI Components Filters & Controls

Build filter UI components and load button for places discovery. Components will be placed in the existing 25% right sidebar and integrate with Zustand store for state management. This phase focuses on creating reusable, accessible, and tested UI components for controlling the place search.

## Steps

1. **Create PlaceTypeSelect component**
   - Create [src/frontend/src/components/Map/PlaceTypeSelect.tsx](src/frontend/src/components/Map/PlaceTypeSelect.tsx):
     - Props interface: `value: PlaceType[]`, `onChange: (types: PlaceType[]) => void`, `disabled?: boolean`
     - Multi-select dropdown/checkboxes for place types
     - Display human-readable labels using `getPlaceTypeLabel` from utils
     - Show icon next to each type using `getPlaceTypeIcon`
     - "All Types" option to clear selection
     - Accessible: proper ARIA labels, keyboard navigation
     - Use semantic HTML: `<select multiple>` or custom checkbox group
   - Create [PlaceTypeSelect.css](src/frontend/src/components/Map/PlaceTypeSelect.css):
     - Styled as dropdown or checkbox list
     - Clear visual indication of selected types
     - Hover and focus states
     - Disabled state styling
   - Create [PlaceTypeSelect.test.tsx](src/frontend/src/components/Map/PlaceTypeSelect.test.tsx):
     - Test renders all place types with correct labels
     - Test selecting/deselecting types calls onChange
     - Test "All Types" option clears selection
     - Test keyboard navigation
     - Test disabled state

2. **Create RatingFilter component**
   - Create [src/frontend/src/components/Map/RatingFilter.tsx](src/frontend/src/components/Map/RatingFilter.tsx):
     - Props: `value: number | null`, `onChange: (rating: number | null) => void`, `disabled?: boolean`
     - Dropdown with options: "Any", "3.0+", "3.5+", "4.0+", "4.5+"
     - Display star icons for visual clarity
     - "Any" option sets value to null
     - Accessible with proper labels
   - Create [RatingFilter.css](src/frontend/src/components/Map/RatingFilter.css):
     - Styled select dropdown
     - Star icon rendering
     - Consistent with PlaceTypeSelect styling
   - Create [RatingFilter.test.tsx](src/frontend/src/components/Map/RatingFilter.test.tsx):
     - Test renders all rating options
     - Test selecting rating calls onChange with correct value
     - Test "Any" option sets null
     - Test displays current value correctly

3. **Create ResultLimitSelect component**
   - Create [src/frontend/src/components/Map/ResultLimitSelect.tsx](src/frontend/src/components/Map/ResultLimitSelect.tsx):
     - Props: `value: 10 | 30 | 50`, `onChange: (limit: 10 | 30 | 50) => void`, `disabled?: boolean`
     - Dropdown or radio buttons with options: 10, 30, 50
     - Label: "Show up to X places"
     - Default: 30
   - Create [ResultLimitSelect.css](src/frontend/src/components/Map/ResultLimitSelect.css):
     - Compact styling, radio buttons or small dropdown
     - Clear indication of selected value
   - Create [ResultLimitSelect.test.tsx](src/frontend/src/components/Map/ResultLimitSelect.test.tsx):
     - Test renders all limit options
     - Test selecting limit calls onChange
     - Test displays current limit correctly

4. **Create PlacesFilters container component**
   - Create [src/frontend/src/components/Map/PlacesFilters.tsx](src/frontend/src/components/Map/PlacesFilters.tsx):
     - No props - connects directly to Zustand store using `usePlacesStore`
     - Read: `filters` from store
     - Actions: `setFilters`, `resetFilters` from store
     - Compose: PlaceTypeSelect, RatingFilter, ResultLimitSelect
     - Include "Reset Filters" button to restore defaults
     - Section heading: "Filter Places"
     - Layout: Vertical stack with spacing between filters
   - Create [PlacesFilters.css](src/frontend/src/components/Map/PlacesFilters.css):
     - Clean, organized layout
     - Consistent spacing between filter controls
     - Section styling for grouping
     - Reset button styling
   - Create [PlacesFilters.test.tsx](src/frontend/src/components/Map/PlacesFilters.test.tsx):
     - Mock Zustand store
     - Test renders all filter components
     - Test changing filter updates store
     - Test reset button calls resetFilters action
     - Test displays current filter values from store

5. **Create LoadPlacesButton component**
   - Create [src/frontend/src/components/Map/LoadPlacesButton.tsx](src/frontend/src/components/Map/LoadPlacesButton.tsx):
     - Props: `onLoad: (bounds: ViewportBounds) => void`, `isLoading?: boolean`, `disabled?: boolean`
     - Primary action button: "Load Places"
     - Get current map viewport bounds using `useMap()` hook from `@vis.gl/react-google-maps`
     - Click handler: Extract bounds from map, call `onLoad` with bounds
     - Show loading state: Disabled with spinner/text "Loading..."
     - Disabled when no map or already loading
     - Position: Below filters in sidebar OR as floating button on map
   - Create [LoadPlacesButton.css](src/frontend/src/components/Map/LoadPlacesButton.css):
     - Prominent primary button styling
     - Loading state with spinner animation
     - Disabled state styling
     - Full width in sidebar context
   - Create [LoadPlacesButton.test.tsx](src/frontend/src/components/Map/LoadPlacesButton.test.tsx):
     - Mock useMap hook
     - Test clicking button calls onLoad with map bounds
     - Test button disabled when isLoading is true
     - Test button disabled when no map instance
     - Test displays loading state correctly

6. **Update Sidebar to include filters**
   - Update [src/frontend/src/components/layout/Sidebar.tsx](src/frontend/src/components/layout/Sidebar.tsx):
     - Import and render `PlacesFilters` component at top
     - Import and render `LoadPlacesButton` below filters
     - Remove placeholder content ("Additional content will appear here")
     - Add section for future places list (placeholder div with comment)
     - Connect LoadPlacesButton to trigger search (via callback or store action)
   - Update [Sidebar.css](src/frontend/src/components/layout/Sidebar.css):
     - Adjust padding for filter controls
     - Add spacing between sections
     - Ensure scrollable content area

7. **Create useMapBounds custom hook**
   - Create [src/frontend/src/hooks/useMapBounds.ts](src/frontend/src/hooks/useMapBounds.ts):
     - Use `useMap()` from `@vis.gl/react-google-maps`
     - Return function: `getMapBounds(): ViewportBounds | null`
     - Extract bounds from map instance: `map.getBounds()`
     - Convert Google Maps LatLngBounds to ViewportBounds type
     - Handle null map or unavailable bounds
     - Type-safe with proper return types
   - Create [useMapBounds.test.ts](src/frontend/src/hooks/useMapBounds.test.ts):
     - Mock useMap hook
     - Test returns bounds when map available
     - Test returns null when map not available
     - Test converts Google Maps bounds to ViewportBounds correctly

8. **Integration: Connect filters to search trigger**
   - Update [Map.tsx](src/frontend/src/components/Map/Map.tsx):
     - Keep existing single place selection state for backward compatibility
     - No changes needed in this phase (multi-marker support comes in Phase 6)
   - Consider where search state should live:
     - Option A: In Map component, pass trigger callback to Sidebar
     - Option B: In dedicated container component wrapping Map + Sidebar
     - Option C: In Zustand store as search action (recommended)
   - If using store approach, add to placesStore:
     - Action: `triggerSearch: (bounds: ViewportBounds) => void`
     - State: `searchBounds: ViewportBounds | null` (for hook consumption)

9. **Add visual feedback for filter changes**
   - Create [FilterIndicator component](src/frontend/src/components/Map/FilterIndicator.tsx) (optional enhancement):
     - Shows count of active filters
     - Badge: "3 filters active"
     - Position: Near filter section header
     - Click to show/hide filter panel (collapsible)
   - Add to PlacesFilters if implemented

10. **Accessibility improvements**
    - Review all components for ARIA attributes:
      - Label associations: `<label htmlFor>` or `aria-label`
      - Role attributes for custom controls
      - `aria-expanded` for collapsible sections
      - `aria-disabled` for disabled states
    - Test keyboard navigation:
      - Tab order makes sense
      - Enter/Space activate buttons
      - Escape closes dropdowns
    - Test with screen reader (optional but recommended)

11. **Responsive design considerations**
    - Add media queries to [Sidebar.css](src/frontend/src/components/layout/Sidebar.css):
      - On mobile (<768px): Sidebar becomes bottom drawer or modal
      - On tablet (768-1024px): Adjust sidebar width percentage
      - Ensure filters remain usable on small screens
    - Add mobile-specific button positioning if needed

12. **Write integration test for filter flow**
    - Create [src/frontend/src/components/Map/PlacesFilters.integration.test.tsx](src/frontend/src/components/Map/PlacesFilters.integration.test.tsx):
      - Test full filter interaction flow:
        1. Render PlacesFilters with store provider
        2. Change place type filter
        3. Change rating filter
        4. Change limit
        5. Verify store updated correctly
        6. Click reset
        7. Verify filters restored to defaults
      - Test LoadPlacesButton integration:
        1. Render with map context
        2. Click load button
        3. Verify callback called with bounds
        4. Verify loading state displayed

## Verification

- Run `npm run type-check` - zero TypeScript errors
- Run `npm test` - all new component tests pass
- Run `npm run test:coverage` - new components have >80% coverage
- Run `npm run dev` - frontend starts without errors
- Visual verification:
  - Filters appear in right sidebar
  - All filter controls render correctly
  - Changing filters updates Zustand store (check devtools)
  - Load button appears below filters
  - Loading state displays when clicked
  - Reset button restores default values
- Accessibility verification:
  - Tab navigation works through all controls
  - Screen reader announces labels correctly
  - Keyboard can activate all interactive elements
- Responsive verification:
  - Filters remain usable on mobile viewport
  - No layout breaking on small screens

## Decisions

- **Filter placement**: In existing 25% right sidebar (matches original requirement)
- **Multi-select for place types**: Use checkbox group for better UX than multi-select dropdown
- **Rating filter**: Dropdown with predefined options (simpler than slider for MVP)
- **Store connection**: PlacesFilters connects directly to store (no prop drilling)
- **LoadPlacesButton**: Accepts callback prop for flexibility, can be used from sidebar or map overlay
- **useMapBounds hook**: Encapsulates map bounds extraction logic, reusable across components
- **No collapsible filters**: Keep filters always visible for MVP (can add later)
- **Reset button**: Included for user convenience, restores default filter state
- **Visual feedback**: Show active filter count as optional enhancement
- **Responsive**: Mobile consideration but full mobile optimization deferred to later phase
- **Component co-location**: Filter components in Map folder (domain-based organization, related to map search)
- **CSS Modules**: Use regular CSS files with BEM naming (consistent with existing components like PlaceSearchInput.css)
- **Accessibility-first**: Proper labels, keyboard navigation, semantic HTML from the start
