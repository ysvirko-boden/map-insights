# Plan: Phase 7 - Integration & Testing

Final integration phase focusing on comprehensive end-to-end testing, polish, documentation, and production readiness. Based on completed Phases 1-6, this includes testing the full flow, addressing edge cases, performance optimization, and deployment preparation.

## Context & Changes from Original Plans

**Completed Features:**
- ✅ Backend API with grid-based search (multiple requests under the hood)
- ✅ Frontend data layer with Zustand + TanStack Query
- ✅ Filter UI components (place types, rating, result limit)
- ✅ Places list with expand/collapse functionality
- ✅ Map integration with multiple markers (blue/red for selected)
- ✅ Bidirectional sync: list ↔ map

**Key Changes:**
1. **Images removed**: PlaceCard no longer displays photos (photoUrls field exists but not rendered)
2. **Grid division**: Backend uses `IGridDivisionService` to split viewport into cells for parallel API calls
3. **Special configuration**: `GoogleMapsOptions` includes:
   - `MaxParallelRequests` (default: 10)
   - `GridCellSizeInDegrees` (default: 0.005)
   - `MaxGridCells` (default: 100)
4. **Distance calculation**: Client-side using Haversine formula, displayed in PlaceCard
5. **Review count sorting**: Backend sorts by `UserRatingsTotal` (most reviewed places first)

## Steps

1. **Backend Integration Tests Enhancement**
   - Review and enhance [tests/MapInsights.Api.Tests.Integration/Features/Places/](src/backend/tests/MapInsights.Api.Tests.Integration/Features/Places/)
   - Add integration tests for grid division:
     - Test small viewport (single cell) returns results
     - Test large viewport (multiple cells) aggregates results correctly
     - Test deduplication across cell boundaries
     - Test parallel request limiting respects MaxParallelRequests
     - Test MaxGridCells limit prevents excessive API calls
   - Add tests for edge cases:
     - Empty results from all cells
     - API errors in some cells (partial failure handling)
     - Overlapping results near cell boundaries
     - Very small viewport (zoom level 20+)
     - Very large viewport (zoom level 5-)
   - Verify configuration options work correctly
   - Run: `dotnet test --filter Category=Integration`

2. **Backend Unit Tests for Grid Division**
   - Create [tests/MapInsights.Infrastructure.Tests.Unit/Places/GridDivisionServiceTests.cs](src/backend/tests/MapInsights.Infrastructure.Tests.Unit/Places/GridDivisionServiceTests.cs):
     - Test divides viewport into correct number of cells
     - Test cell size calculation based on viewport size
     - Test respects MaxGridCells limit
     - Test cell bounds don't overlap
     - Test cell bounds cover entire viewport
     - Test edge cases: equator crossing, date line crossing, polar regions
   - Follow xUnit + FluentAssertions patterns
   - Run: `dotnet test --filter Category=Unit`

3. **Frontend E2E Test Suite**
   - Create [tests/e2e/places-discovery-full-flow.test.md](tests/e2e/places-discovery-full-flow.test.md):
     - Complete user journey test using Playwright CLI:
       1. Load application → verify map and filters render
       2. Change filters (place type, rating, limit) → verify store updates
       3. Click "Load Places" → verify loading state, then results appear
       4. Verify list shows correct count and sorted by reviews
       5. Click place in list → verify marker highlighted, card scrolls into view
       6. Click marker on map → verify list item selected and scrolled
       7. Expand place card → verify details shown (address, phone, hours)
       8. Click hide button → verify place removed from both list and map
       9. Change filters and reload → verify new results match criteria
       10. Reset filters → verify defaults restored
   - Document with screenshots for each step
   - Verify no console errors during flow
   - Check network tab shows correct API calls

4. **Performance Testing & Optimization**
   - Load testing with maximum results (50 places):
     - Measure marker render time
     - Verify smooth map interactions (pan, zoom)
     - Check list scrolling performance
     - Monitor memory usage during multiple searches
   - Backend performance:
     - Measure grid search with 25+ cells
     - Verify parallel requests work (check logs for concurrent calls)
     - Test API response time under load
     - Consider adding caching for repeated searches (future enhancement)
   - Frontend optimization checks:
     - Verify React Query cache prevents duplicate requests
     - Check Zustand devtools for unnecessary re-renders
     - Validate memoization in Map.tsx (useMemo for markers)
     - Test with React DevTools Profiler

5. **Error Handling & Edge Cases**
   - Test all error scenarios:
     - **Backend down**: Frontend shows error message, not crash
     - **API quota exceeded**: Backend logs error, returns 500 with message
     - **Invalid API key**: Backend fails gracefully with clear error
     - **Network timeout**: TanStack Query retries, then shows error
     - **Empty results**: List shows "No places found" message
     - **Invalid filter combinations**: Validation prevents invalid requests
   - Test edge cases:
     - Search in ocean/remote area (few/no results)
     - Search with all filters restrictive (rating 4.5+, single type)
     - Rapid filter changes (verify debouncing/cancellation)
     - Hide all places in list (empty state handling)
     - Browser back/forward navigation (state preservation)
   - Verify error messages are user-friendly, not technical

6. **Accessibility Audit**
   - Test keyboard navigation:
     - Tab through filters, buttons, list items
     - Enter/Space activate buttons
     - Arrow keys navigate within dropdowns/checkboxes
     - Escape deselects/collapses
   - Test screen reader compatibility:
     - All interactive elements have labels
     - ARIA attributes correct (aria-expanded, aria-selected, aria-label)
     - List announces count ("30 places found")
     - Loading states announced
   - Test high contrast mode (Windows)
   - Test with 200% browser zoom (text scaling)
   - Run Lighthouse accessibility audit (target: 95+ score)

7. **Responsive Design Testing**
   - Test on multiple viewport sizes:
     - **Desktop** (1920x1080): Sidebar 25%, map 75%
     - **Laptop** (1366x768): Verify no horizontal scroll
     - **Tablet** (768x1024): Adjust sidebar width or overlay
     - **Mobile** (375x667): Sidebar as bottom drawer or full screen
   - Test touch interactions on mobile:
     - Map pan and zoom gestures
     - Tap markers to select
     - Swipe to scroll list
     - Tap to expand/collapse cards
   - Test orientation changes (portrait ↔ landscape)
   - Consider mobile-specific UI adjustments (larger touch targets)

8. **Documentation Updates**
   - Update [README.md](README.md):
     - Add "Places Discovery" feature description
     - Document configuration options (backend GridCellSize, MaxParallelRequests)
     - Add screenshots of key features
     - Update setup instructions for Google Maps API key + Map ID
   - Create [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md):
     - Document grid division strategy
     - Explain state management (Zustand + TanStack Query)
     - Diagram: Frontend ↔ Backend API flow
     - Explain marker color scheme (yellow autocomplete, blue search, red selected)
   - Create [docs/API.md](docs/API.md):
     - Document `/api/places/search` endpoint
     - Request/response schemas
     - Error codes and messages
     - Configuration options impact on results
   - Update [FRONTEND_GUIDE.md](src/frontend/FRONTEND_GUIDE.md):
     - Add Places components documentation
     - State management patterns used
     - Testing guidelines for new features

9. **Production Readiness Checklist**
   - **Environment Variables**:
     - Verify `.env.example` has all required vars
     - Document VITE_API_BASE_URL, VITE_GOOGLE_MAPS_API_KEY, VITE_GOOGLE_MAPS_MAP_ID
     - Backend: Document GoogleMaps config in appsettings
   - **Build Verification**:
     - Run `npm run build` - succeeds with no warnings
     - Run `dotnet publish -c Release` - succeeds
     - Test production build locally: `npm run preview`
     - Verify API URLs configurable per environment
   - **Security**:
     - Verify no API keys committed to git
     - Check .gitignore includes .env.local, appsettings.Development.json
     - Validate CORS settings for production domains
     - Review for XSS vulnerabilities (user input sanitized)
   - **Performance**:
     - Lighthouse Performance score: target 90+
     - Bundle size check: `npm run build` reports
     - Backend: Consider rate limiting on API endpoint
   - **Monitoring**:
     - Ensure structured logging in place (Serilog)
     - Log key events: searches, errors, API quota usage
     - Consider adding application insights (future)

10. **Final Integration Test Matrix**
    - Create test matrix document covering:
      - **Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
      - **Operating Systems**: Windows, macOS, Linux
      - **Mobile**: iOS Safari, Android Chrome
    - Test critical paths on each platform:
      - Load places
      - Filter and search
      - Select from list
      - Select from map
      - Expand/hide cards
    - Document any platform-specific issues

11. **Known Limitations & Future Enhancements**
    - Document in README or separate file:
      - **Removed**: Photo display (photoUrls exist but not shown)
      - **Limitation**: Google Places API quota (2500 requests/day free tier)
      - **Limitation**: Grid search may miss places at cell boundaries (rare)
      - **Future**: Save/load search results (deferred from original plan)
      - **Future**: Export places to CSV/JSON
      - **Future**: Marker clustering for 100+ places
      - **Future**: Mobile-optimized bottom sheet UI
      - **Future**: Place details modal with photos
      - **Future**: User authentication for saved searches

12. **Deployment Guide**
    - Create [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md):
      - **Frontend**: Instructions for deploying to Vercel/Netlify/Azure Static Web Apps
      - **Backend**: Instructions for deploying to Azure App Service/AWS/Docker
      - Environment variable setup for each platform
      - CORS configuration for production
      - Google Maps API key restrictions (HTTP referrers, IP addresses)
      - Database setup (if added later)
    - Include CI/CD pipeline examples:
      - GitHub Actions workflow for build + test
      - Automated deployment on main branch merge

## Verification

- **Backend Tests**: `dotnet test` - all tests pass (unit + integration)
- **Frontend Tests**: `npm test` - all tests pass with >80% coverage
- **Type Check**: `npm run type-check` - zero errors
- **Build**: Both frontend and backend build without warnings
- **E2E Tests**: All Playwright scenarios pass
- **Lighthouse**: Performance 90+, Accessibility 95+, Best Practices 95+
- **Manual Testing**: Complete flow works on Chrome, Firefox, Safari, Edge
- **Mobile Testing**: Responsive UI works on iOS and Android
- **Documentation**: All docs updated and accurate

## Decisions

- **Photo display removed**: Simplifies UI, reduces API calls, improves load time (decision made during Phase 5)
- **Grid division strategy**: Enables comprehensive area coverage, handles API limits, parallelizes requests (implemented in Phase 2)
- **Review count sorting**: Prioritizes popular places, provides better user experience than distance-only
- **Client-side distance**: Avoids additional API calls, fast calculation, good enough accuracy for display
- **No marker clustering**: MVP scope, 50 places max managed well by browser, can add later if needed
- **No photo modal**: Deferred to keep Phase 7 scope manageable, can be added as enhancement
- **Backend configuration exposed**: Allows tuning for different deployment environments (rate limits, API quotas)
- **Structured logging**: Enables production monitoring and debugging
- **Comprehensive testing**: High confidence for production deployment
- **Documentation-first**: Clear setup and architecture docs for maintainability
