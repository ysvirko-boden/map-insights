# Google Maps Integration Foundation

## Problem Statement

The Map Insights application needs a foundational map display capability before any map-based features (markers, search, data visualization) can be implemented. Without this core infrastructure, development of user-facing features cannot proceed.

## Evidence

- Codebase contains only Vite default template with no map functionality
- No backend exists yet - this is pure frontend foundation work
- Future features (markers, search) depend on this base layer

## Proposed Solution

Integrate Google Maps JavaScript API using @vis.gl/react-google-maps library within a flexible layout structure (header, footer, right sidebar) that can accommodate future UI additions. The map will center on user's geolocation with appropriate fallbacks.

## Key Hypothesis

We believe a properly architected map foundation with flexible layout will enable rapid development of map-based features.
We'll know we're right when developers can add markers, search, and other features without refactoring the core map setup.

## What We're NOT Building

- **Markers or POIs** - deferred to future feature
- **Search functionality** - deferred to future feature
- **Map controls customization** - using defaults for now
- **Backend integration** - frontend-only foundation
- **User authentication** - not needed for map display

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Map loads successfully | 100% of supported browsers | Manual testing |
| Geolocation accuracy | Within 100m or NYC fallback | Testing in multiple locations |
| Initial load performance | < 3s to interactive map | Browser DevTools |

## Open Questions

- [ ] Should we add map style/theme switching capability in the architecture?
- [ ] What level of error tracking do we need for map load failures?
- [ ] Should geolocation permission be requested on page load or on-demand?

---

## Users & Context

**Primary User**
- **Who**: Developers building map-based features on top of this foundation
- **Current behavior**: Cannot develop features - no map exists
- **Trigger**: Need to implement markers, search, or other map capabilities
- **Success state**: Can add map-related features without touching core map setup

**Secondary User**
- **Who**: End users viewing the map
- **Current behavior**: See empty Vite template
- **Trigger**: Open the application
- **Success state**: See interactive map centered on their location

**Job to Be Done**
When developers need to add map-based features, they want a stable map foundation, so they can focus on feature logic without infrastructure concerns.

**Non-Users**
This is not for applications needing non-Google map providers (Mapbox, OpenStreetMap) - architecture is Google Maps-specific.

---

## Solution Detail

### Core Capabilities (MoSCoW)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| Must | Google Maps display via @vis.gl/react-google-maps | Core requirement |
| Must | User geolocation with NYC fallback | Default center point |
| Must | Responsive layout (header, footer, sidebar, map) | UI structure foundation |
| Must | API key configuration via environment variables | Security best practice |
| Must | Loading indicator during geolocation | User feedback |
| Should | Geolocation error handling | User experience |
| Should | TypeScript type definitions for map props | Developer experience |
| Could | Custom map styling | Nice to have, using defaults for now |
| Won't | Map controls customization | Deferred - using defaults |
| Won't | Backend API integration | No backend exists yet |

### MVP Scope

1. Install @vis.gl/react-google-maps package
2. Create layout components (Header, Footer, Sidebar, AppLayout)
3. Create Map component with Google Maps integration
4. Implement useGeolocation hook with NYC fallback
5. Configure environment variables for API key
6. Add loading states and basic error handling

### User Flow

1. User opens application
2. Browser requests geolocation permission
3. Loading spinner displays in map area
4. Map loads centered on user location (or NYC if denied/failed)
5. Map is interactive with default controls

---

## Technical Approach

**Feasibility**: HIGH

**Architecture Notes**
- **Layout**: CSS Grid for main layout, Flexbox within components
- **State Management**: React hooks (useState, useEffect) for geolocation - no external state library needed
- **Component Structure**: 
  - `AppLayout` - main layout wrapper
  - `Header`, `Footer`, `Sidebar` - placeholder components
  - `Map` - Google Maps wrapper
  - `useGeolocation` - custom hook for location logic
- **Styling**: CSS modules or plain CSS following existing patterns
- **Environment**: Vite's `VITE_` prefix for env vars

**Technical Decisions**

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Map library | @vis.gl/react-google-maps | Modern React patterns, TypeScript support, maintained by Vis.gl |
| Layout approach | CSS Grid | Flexible for future resizable panels |
| Geolocation | Browser API | Native, no dependencies |
| State management | React hooks | Sufficient for this scope |

**Technical Risks**

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| API key exposure | Medium | Use environment variables, add to .gitignore |
| Geolocation permission denied | High | NYC fallback, clear error messages |
| Map load failures | Low | Error boundaries, fallback UI |
| Browser compatibility | Low | Modern browsers support all APIs used |

**Technical Specifications**
- Sidebar width: 25% of viewport
- Header/Footer height: Dynamic content-based
- Default zoom level: 15 (neighborhood detail)
- Fallback location: New York City (40.7128, -74.0060)

---

## Implementation Phases

<!--
  STATUS: pending | in-progress | complete
  PARALLEL: phases that can run concurrently (e.g., "with 3" or "-")
  DEPENDS: phases that must complete first (e.g., "1, 2" or "-")
  PRP: link to generated plan file once created
-->

| # | Phase | Description | Status | Parallel | Depends | PRP Plan |
|---|-------|-------------|--------|----------|---------|----------|
| 1 | Setup & Dependencies | Install packages, configure environment | complete | - | - | - |
| 2 | Layout Components | Create Header, Footer, Sidebar, AppLayout | complete | with 3 | 1 | - |
| 3 | Geolocation Hook | Implement useGeolocation custom hook | complete | with 2 | 1 | - |
| 4 | Map Component | Integrate Google Maps with geolocation | complete | - | 2, 3 | - |
| 5 | Testing & Polish | Add tests, loading states, error handling | complete | - | 4 | - |

### Phase Details

**Phase 1: Setup & Dependencies**
- **Goal**: Install required packages and configure environment
- **Scope**: 
  - Install @vis.gl/react-google-maps
  - Create .env.local with API key
  - Add .env.local to .gitignore
  - Update type definitions if needed
- **Success signal**: Package installed, env configured, no build errors

**Phase 2: Layout Components**
- **Goal**: Create UI structure for the application
- **Scope**:
  - AppLayout component with CSS Grid (header, footer, sidebar, main)
  - Header placeholder component
  - Footer placeholder component
  - Sidebar placeholder component (25% width)
- **Success signal**: Layout renders with correct proportions

**Phase 3: Geolocation Hook**
- **Goal**: Abstract geolocation logic into reusable hook
- **Scope**:
  - useGeolocation hook with loading, error, coordinates states
  - NYC fallback logic
  - Browser API integration
  - TypeScript types
- **Success signal**: Hook returns coordinates with proper loading states

**Phase 4: Map Component**
- **Goal**: Display Google Maps centered on user location
- **Scope**:
  - Map component using @vis.gl/react-google-maps
  - Integration with useGeolocation hook
  - Zoom level 15
  - Loading spinner
  - Basic error handling
- **Success signal**: Map displays and centers on user location

**Phase 5: Testing & Polish**
- **Goal**: Ensure quality and proper error handling
- **Scope**:
  - Unit tests for useGeolocation hook
  - Component tests for Map and Layout
  - Error boundary for map failures
  - Loading indicators
  - Basic accessibility checks
- **Success signal**: >80% test coverage, passes all tests

### Parallelism Notes

Phases 2 and 3 can run in parallel as they are independent - layout components don't depend on geolocation logic. Once both complete, Phase 4 integrates them together.

---

## Decisions Log

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Map library | @vis.gl/react-google-maps | google-maps-react, @react-google-maps/api | Modern, TypeScript support, React 18+ compatible |
| Geolocation timing | On page load | On-demand/button click | Better UX - map ready immediately |
| Layout approach | CSS Grid | Flexbox only, CSS-in-JS | Better for 2D layout with future resizing |
| State management | React hooks | Zustand, Context | Overkill for this scope, hooks sufficient |
| Sidebar position | Right side | Left side | Conventional for info panels |

---

## Research Summary

**Market Context**
- Google Maps JavaScript API is industry standard for web mapping
- @vis.gl/react-google-maps is the recommended modern wrapper (2024+)
- Geolocation with fallback is standard pattern for map-based apps

**Technical Context**
- Existing project uses Vite + React 19 + TypeScript (strict mode)
- Testing infrastructure already set up (Vitest + Testing Library)
- Component patterns follow functional components with hooks
- Path aliases configured for imports

---

*Generated: 2026-02-04*
*Status: COMPLETE*
*Implementation Date: 2026-02-04*

## Implementation Summary

**All phases completed successfully:**

✅ **Phase 1**: Installed @vis.gl/react-google-maps v1.7.1, configured environment variables, API key secured in .env.local  
✅ **Phase 2**: Created responsive layout with CSS Grid - Header, Footer, Sidebar (25% width), AppLayout  
✅ **Phase 3**: Implemented useGeolocation hook with NYC fallback, comprehensive error handling  
✅ **Phase 4**: Integrated Google Maps with @vis.gl/react-google-maps, loading indicators, error states  
✅ **Phase 5**: Achieved 96.56% test coverage (37 passing tests), TypeScript strict mode compliance

**Live Application:**
- Dev server: http://localhost:3000
- Map displays with user geolocation (fallback: NYC)
- All tests passing
- Type-safe implementation
- Production-ready foundation for future features (markers, search)
