# Plan: Place Details Enhancement with Copy-to-Clipboard

**TL;DR:** Enhance the place item expanded view in [PlaceCard.tsx](src/frontend/src/components/Map/PlaceCard.tsx) to display three additional fields (Type, Coordinates, Google Maps link) and add copy-to-clipboard buttons for all detail rows. All required data (`type`, `location`) is already available in the `PlaceDetails` interface, so this is a frontend-only enhancement following existing patterns.

## Requirements

1. The place item expand view should have additional data:
   - Type: e.g. "Grocery store"
   - Coordinates: 54.72411821346215, 25.319736408173853
   - [optional link] "Open in Google Maps" - the link should open a new tab with the selected place in Google Maps
   - Example link: `https://www.google.com/maps/place/?q=place_id:PLACE_ID`

2. Each line/label should have "copy to clipboard" button

## Implementation Steps

### 1. Create reusable CopyButton component

**Location**: [src/frontend/src/components/common/CopyButton/](src/frontend/src/components/common/CopyButton/)

**Files to create**:
- `CopyButton.tsx` - Main component
- `CopyButton.css` - Styling
- `CopyButton.test.tsx` - Tests

**Component specs**:
- Props: `textToCopy: string`, `ariaLabel?: string`
- Use `navigator.clipboard.writeText()` API
- Include visual feedback (temporary "Copied!" state or icon change for ~2 seconds)
- Icon-only button, positioned on right side of detail rows
- Mock `navigator.clipboard` in tests: `Object.assign(navigator, { clipboard: { writeText: vi.fn() } })`

### 2. Update PlaceCard component

**Location**: [src/frontend/src/components/Map/PlaceCard.tsx](src/frontend/src/components/Map/PlaceCard.tsx)

**Changes in expanded section**:

Add three new detail rows after phone but before opening hours:
1. **Type row**: Display `place.type` with label "Type:" and `CopyButton`
2. **Coordinates row**: Display `${place.location.lat}, ${place.location.lng}` with label "Coordinates:" and `CopyButton`
3. **Google Maps link row**: 
   - Create link: `<a href="https://www.google.com/maps/place/?q=place_id:${place.placeId}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>`
   - Add label "Link:" and `CopyButton` (copy the URL)

Add `CopyButton` to existing detail rows:
- Address row (copy `place.formattedAddress`)
- Phone row (copy `place.formattedPhoneNumber`)
- Opening hours status row (copy the status text like "Open" or "Closed")

**Row structure**:
```tsx
<div className="place-card-detail-row">
  <span className="place-card-detail-label">Label:</span> 
  value content 
  <CopyButton textToCopy={value} />
</div>
```

**Important**: Add `stopPropagation` to Google Maps link like the existing phone link pattern

### 3. Update PlaceCard styles

**Location**: [src/frontend/src/components/Map/PlaceCard.css](src/frontend/src/components/Map/PlaceCard.css)

**Changes**:
- Add `.place-card-maps-link` class for Google Maps link (similar to `.place-card-phone-link`)
- Ensure `.place-card-detail-row` supports flex layout to position copy buttons on the right
- Add hover states for the Google Maps link
- Ensure proper spacing between value text and copy button
- Consider mobile responsive layout (copy button should not wrap awkwardly)

### 4. Update PlaceCard tests

**Location**: [src/frontend/src/components/Map/PlaceCard.test.tsx](src/frontend/src/components/Map/PlaceCard.test.tsx)

**Test coverage**:
- Type is displayed when card is expanded: check for "Type:" label and `mockPlace.type` value
- Coordinates are displayed with correct format: check for "Coordinates:" and `${lat}, ${lng}`
- Google Maps link exists with correct href and `target="_blank"` attributes
- Google Maps link includes `rel="noopener noreferrer"` for security
- Copy buttons render for all detail rows (count should match number of copyable fields)
- Copy button interaction using fireEvent.click and verify `navigator.clipboard.writeText` was called with correct values
- Clicking Google Maps link calls `stopPropagation` to prevent card collapse

### 5. Manual verification testing

**Steps**:
1. Run frontend dev server: `cd src/frontend && npm run dev`
2. Search for places to populate the list
3. Expand a place card and verify all new fields display correctly
4. Click each copy button and paste to verify clipboard functionality works
5. Click "Open in Google Maps" link and verify it opens correct place in new tab
6. Test on mobile viewport to ensure copy buttons don't break layout
7. Test with places that have missing data (nulls) to ensure graceful handling

## Verification

**Automated**:
- Run tests: `cd src/frontend && npm test PlaceCard`
- Check test coverage: `npm run test:coverage`
- Lint check: `npm run lint`

**Manual**: Follow manual verification testing steps above

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Google Maps URL format** | Using `place_id` parameter: `https://www.google.com/maps/place/?q=place_id:{placeId}` | Simplicity and reliability over coordinate-based URLs |
| **Copy scope** | All detail fields get copy buttons (address, phone, type, coordinates, opening status, maps link) | Maximum user convenience |
| **Coordinate display** | Comma-separated with full precision: `54.72411821346215, 25.319736408173853` | Standard format matching Google Maps |
| **Component structure** | Create reusable `CopyButton` component | Follows existing common component patterns rather than inline implementation |
| **Browser compatibility** | Modern `navigator.clipboard.writeText()` API | Supported in all modern browsers since 2018; no legacy fallback needed |

## Technical Context

**Existing Implementation**:
- Place item component: [PlaceCard.tsx](src/frontend/src/components/Map/PlaceCard.tsx)
- Current expanded view shows: name, rating, reviews, distance, address, phone (clickable tel:), opening hours
- Styling: [PlaceCard.css](src/frontend/src/components/Map/PlaceCard.css) using CSS modules pattern
- Data structure: [places.ts](src/frontend/src/types/places.ts) - `PlaceDetails` interface
- Tests: [PlaceCard.test.tsx](src/frontend/src/components/Map/PlaceCard.test.tsx)

**Available Data**:
- `place.type`: e.g., "restaurant", "cafe"
- `place.location`: `{ lat: number; lng: number }`
- `place.placeId`: unique identifier for Google Maps

**Existing Link Pattern**:
```tsx
<a
  href={`tel:${place.formattedPhoneNumber}`}
  className="place-card-phone-link"
  onClick={(e) => e.stopPropagation()}
>
  {place.formattedPhoneNumber}
</a>
```

## Implementation Order

1. CopyButton component (independent, reusable)
2. PlaceCard component updates (uses CopyButton)
3. PlaceCard styles updates (visual polish)
4. PlaceCard tests updates (test coverage)
5. Manual verification (end-to-end validation)
