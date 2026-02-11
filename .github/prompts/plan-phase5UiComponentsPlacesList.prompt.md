# Plan: Phase 5 - UI Components Places List

Build the places list display in the sidebar. This includes a container component for managing the list state, individual place cards with collapsed/expanded views, and integration with Zustand store for selection and hiding. The list will display search results from the backend with loading, error, and empty states.

## Steps

1. **Create PlaceCard component - Collapsed state**
   - Create [src/frontend/src/components/Map/PlaceCard.tsx](src/frontend/src/components/Map/PlaceCard.tsx):
     - Props interface: `place: PlaceDetails`, `isSelected: boolean`, `isExpanded: boolean`, `onSelect: (id: string) => void`, `onToggleExpand: (id: string) => void`, `onHide: (id: string) => void`
     - Collapsed view displays:
       - Place type icon (using `getPlaceTypeIcon`)
       - Place name (truncated if long)
       - Star rating (visual stars + numeric, e.g., "★★★★☆ 4.2")
       - Review count (e.g., "(123 reviews)")
       - Distance from map center (using `calculateDistance` and `formatDistance` from utils)
       - Expand indicator (chevron down icon or "Show more")
     - Click anywhere on card to expand (except hide button)
     - Selected state: Different background color or border
     - Semantic HTML: `<article>` for card, `<button>` for interactive elements
   - Create [PlaceCard.css](src/frontend/src/components/Map/PlaceCard.css):
     - Card layout: Flexbox for icon + content
     - Hover state on clickable areas
     - Selected state styling (highlighted)
     - Typography: Name bold, secondary info smaller/lighter
     - Star rating visual styling
     - Responsive: Adjust padding/font size on small screens

2. **Create PlaceCard component - Expanded state**
   - Extend [PlaceCard.tsx](src/frontend/src/components/Map/PlaceCard.tsx) with expanded view:
     - All collapsed content remains visible at top
     - Additional details displayed:
       - Photo carousel (show up to 3 photos from `photoUrls`)
       - Full formatted address
       - Phone number (formatted, clickable `tel:` link)
       - Opening hours:
         - "Open now" or "Closed" badge (from `openingHours.openNow`)
         - Weekday text list (from `openingHours.weekdayText`)
       - Hide button: "Remove from list" or X icon
     - Collapse indicator (chevron up or "Show less")
     - Hide button is separate from expand/collapse action
   - Update [PlaceCard.css](src/frontend/src/components/Map/PlaceCard.css):
     - Expanded state: More vertical spacing, show hidden elements
     - Photo carousel: Horizontal scrollable container
     - Hours display: Compact list or collapsible
     - Hide button: Prominent but secondary action (not destructive red)

3. **Create photo carousel component** (optional sub-component)
   - Create [src/frontend/src/components/Map/PhotoCarousel.tsx](src/frontend/src/components/Map/PhotoCarousel.tsx):
     - Props: `photoUrls: string[]`, `altText: string` (place name for alt)
     - Display up to 3 photos horizontally scrollable
     - Fallback: Show placeholder if no photos
     - Simple implementation: Horizontal scroll container with images
     - Optional: Dots indicator showing current photo
     - Lazy load images for performance
   - Create [PhotoCarousel.css](src/frontend/src/components/Map/PhotoCarousel.css)
   - Create [PhotoCarousel.test.tsx](src/frontend/src/components/Map/PhotoCarousel.test.tsx)

4. **Create PlaceCard tests**
   - Create [src/frontend/src/components/Map/PlaceCard.test.tsx](src/frontend/src/components/Map/PlaceCard.test.tsx):
     - Test collapsed state renders correctly (name, rating, review count)
     - Test clicking card calls onToggleExpand
     - Test expanded state shows additional details
     - Test clicking again collapses card
     - Test hide button calls onHide
     - Test selected state applies correct styling
     - Test distance calculation and display
     - Test handles missing optional data (no rating, no photos, no hours)
     - Use mock PlaceDetails objects with complete and partial data

5. **Create PlacesList container component**
   - Create [src/frontend/src/components/Map/PlacesList.tsx](src/frontend/src/components/Map/PlacesList.tsx):
     - Props: `places: PlaceDetails[]`, `isLoading: boolean`, `error: Error | null`, `mapCenter: Location | null`
     - Connect to Zustand store:
       - Read: `selectedPlaceId`, `hiddenPlaceIds`
       - Actions: `selectPlace`, `hidePlace`
     - Manage local state: `expandedPlaceId` (which card is expanded, one at a time)
     - Filter out hidden places from display
     - Calculate distance for each place from mapCenter
     - Render states:
       - **Loading**: Skeleton loaders (3-5 card skeletons)
       - **Error**: Error message with retry button
       - **Empty**: "No places found" message, suggest adjusting filters
       - **Success**: List of PlaceCard components
     - Show count: "X places found" header
     - Scrollable container with smooth scrolling
   - Create [PlacesList.css](src/frontend/src/components/Map/PlacesList.css):
     - List container: Flex column with gap between cards
     - Count header styling
     - Empty state centered text with icon
     - Error state styling (not alarming, informative)
     - Scrollbar styling (thin, modern)
     - Loading skeleton animation

6. **Create skeleton loader component**
   - Create [src/frontend/src/components/common/Skeleton/Skeleton.tsx](src/frontend/src/components/common/Skeleton/Skeleton.tsx):
     - Reusable skeleton component for loading states
     - Props: `width?: string`, `height?: string`, `variant?: 'text' | 'rectangular' | 'circular'`
     - Pulsing animation effect
     - Export also `PlaceCardSkeleton` for specific use
   - Create [Skeleton.css](src/frontend/src/components/common/Skeleton/Skeleton.css):
     - Shimmer/pulse animation
     - Gray background with lighter animated overlay
   - Create [Skeleton.test.tsx](src/frontend/src/components/common/Skeleton/Skeleton.test.tsx)

7. **Create PlacesList tests**
   - Create [src/frontend/src/components/Map/PlacesList.test.tsx](src/frontend/src/components/Map/PlacesList.test.tsx):
     - Mock Zustand store
     - Test loading state shows skeletons
     - Test error state shows error message
     - Test empty state shows "no results" message
     - Test success state renders all places (minus hidden)
     - Test selecting place updates store
     - Test hiding place updates store and removes from list
     - Test expanding one place collapses others
     - Test count header shows correct number
     - Test filters out hidden places

8. **Integrate PlacesList into Sidebar**
   - Update [src/frontend/src/components/layout/Sidebar.tsx](src/frontend/src/components/layout/Sidebar.tsx):
     - Import `usePlacesSearch` hook
     - Import `usePlacesStore` (already imported)
     - Get `searchBounds` and `filters` from store
     - Call `usePlacesSearch(searchBounds, filters)` to get data
     - Get map center for distance calculations (may need to pass as prop or use hook)
     - Replace placeholder comment with `<PlacesList>` component
     - Pass: `places`, `isLoading`, `error`, `mapCenter`
     - Handle case when no search performed yet (searchBounds is null)
   - Update [Sidebar.css](src/frontend/src/components/layout/Sidebar.css):
     - Ensure places list section is scrollable
     - Adjust section heights so list takes remaining space
     - Use flexbox: filters fixed at top, list grows to fill

9. **Add scroll-to-selected functionality**
   - Update [PlacesList.tsx](src/frontend/src/components/Map/PlacesList.tsx):
     - When `selectedPlaceId` changes, scroll selected card into view
     - Use `useEffect` watching `selectedPlaceId`
     - Use `scrollIntoView` with smooth behavior
     - Assign refs to each PlaceCard for scrolling
     - Alternative: Use `IntersectionObserver` for smooth UX

10. **Performance: Add virtualization for large lists** (optional enhancement)
    - Consider adding `react-virtual` or `react-window` for lists > 50 items
    - Only render visible cards + buffer
    - Improves performance when limit is 50
    - **Decision**: Defer to post-MVP if needed, 50 items shouldn't cause issues

11. **Add empty state illustrations** (optional enhancement)
    - Create or use simple SVG illustration for empty state
    - Make "no results" more friendly and helpful
    - Suggest specific actions: "Try adjusting your filters" with button linking to filters

12. **Write integration test for PlacesList flow**
    - Create [src/frontend/src/components/Map/PlacesList.integration.test.tsx](src/frontend/src/components/Map/PlacesList.integration.test.tsx):
      - Test full flow:
        1. Render PlacesList with loading state
        2. Render with places data
        3. Click to select a place
        4. Verify store updated
        5. Click to expand a place
        6. Verify expanded state shows details
        7. Click hide button
        8. Verify place removed from list and store updated
      - Mock store, mock usePlacesSearch hook

## Verification

- Run `npm run type-check` - zero TypeScript errors
- Run `npm test` - all new tests pass (PlaceCard, PlacesList, Skeleton)
- Run `npm run test:coverage` - new components >80% coverage
- Run `npm run dev` - frontend starts without errors
- Visual verification:
  - Trigger search (click Load Places button)
  - Loading skeletons appear briefly
  - Places list populates in sidebar
  - Cards show name, rating, review count, distance
  - Click card to expand - shows photos, address, phone, hours
  - Click again to collapse
  - Hide button removes place from list
  - Selecting place highlights card
  - Empty state shows when no results
  - Error state shows on API failure
- Interaction verification:
  - Scroll works smoothly in list
  - Selected card scrolls into view
  - Only one card expanded at a time
  - Hidden places don't show in list but remain in store
- Accessibility verification:
  - Cards are keyboard accessible (Tab, Enter)
  - Screen reader announces card content
  - Hide button has clear accessible label
- Performance verification:
  - List with 50 items scrolls smoothly
  - Images lazy load (network tab shows progressive loading)

## Decisions

- **One expanded card at a time**: Cleaner UX, less scrolling, keeps sidebar organized
- **Distance from map center**: Calculate client-side using Haversine formula (already in utils)
- **Photos carousel**: Simple horizontal scroll for MVP, no fancy slider library
- **Hide button in expanded state**: Requires intentional action, prevents accidental hiding
- **Skeleton count**: Show 3-5 skeletons regardless of limit (user doesn't know result count yet)
- **Error handling**: Show friendly error with retry option, log to console for debugging
- **Empty state**: Helpful message suggesting filter adjustment, not just "no results"
- **Scroll behavior**: Auto-scroll selected card into view for better UX when clicking map marker (Phase 6)
- **Virtualization**: Defer to post-MVP, 50 items should perform fine without it
- **Component location**: PlaceCard and PlacesList in Map folder (domain cohesion with search)
- **Skeleton location**: common/Skeleton (reusable across app)
- **Photo loading**: Use native lazy loading (`loading="lazy"` attribute), no library needed
- **Opening hours display**: Show full weekday text in list (compact format), not just open/closed badge
- **Review count**: Display alongside rating for social proof
- **Responsive text**: Truncate long place names with ellipsis, show full name in expanded state
