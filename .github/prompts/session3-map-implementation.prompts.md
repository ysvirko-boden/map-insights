# Session 3: Map Implementation

**Product Requirements Document (PRD) flow**

## Prompt 1: Implement map feature

```
Follow instructions in [prp-prd.prompt.md](file:///c%3A/Users/y.svirko/projects/map-insights/.github/prompts/prp-prd.prompt.md).

Current state of the app:
1. No backend
2. Frontend is just a Vite default template
3. No functionality implemented yet

Start implementing the frontend part. The core component of the app is the map.
First feature to implement:
- Show map using Google Maps JavaScript API


Feature details:
1. Use @vis.gl/react-google-maps
2. Initial map features: keep it simple, use defaults
3. Map position: component within a layout. Other UI elements alongside the map: header, footer, sidebar on the right; keep them simple placeholders for now
4. Default map location: use user's geolocation
5. Sidebar width: 25%
6. Header/Footer height: dynamic content-based sizing
7. Geolocation fallback: New York City
8. Default zoom level: 15 for neighborhood-level detail
9. Loading indicator: while geolocation resolves, show loading spinner in map area
```

## Prompt 2: Define E2E test scenario

```
Define an E2E test scenario for the implemented functionality.
Use playwright-cli skill to execute the E2E tests
```

## Prompt 3: Reflect and update instructions

```
Analyze and reflect on your current development session.
Did you encounter any problems? Was there anything in #file:copilot-instructions.md and #file:instructions that threw you off track?
Are there important notes you'd like to add or change in the instructions files?

Also, consider adding instructions about the E2E test flow with playwright-cli and remove the README you added in `tests/e2e/README.md`.

Update the instructions only if necessary. Be precise and concise. The goal is to help AI agents deliver better results in the future
```
