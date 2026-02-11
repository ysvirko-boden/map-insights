# E2E Test: Rectangle Search Verification

**Test ID:** rectangle-search-verification
**Date:** 2026-02-10
**Purpose:** Verify backend uses rectangle search (not radius) with type filtering

## Prerequisites
- Backend running at http://localhost:5000 with console logging enabled
- Frontend running at http://localhost:3000
- Valid Google Maps API key configured
- Access to backend console/logs

## Test Steps

### 1. Navigate to Application
```bash
playwright-cli open http://localhost:3000
playwright-cli snapshot
```
**Expected:** Application loads with map visible

### 2. Capture Initial Map Viewport
```bash
playwright-cli screenshot
playwright-cli eval "window.map?.getBounds()?.toJSON()"
```
**Expected:**
- Map bounds captured (north, south, east, west coordinates)
- Default viewport established

### 3. Pan Map to New Location
```bash
# Drag map to move viewport
playwright-cli drag [MAP_CENTER_REF] [NEW_LOCATION_REF]
playwright-cli snapshot
```
**Expected:**
- Map viewport shifts to new location
- New bounds calculated

### 4. Select "Nature & Parks" Category
```bash
playwright-cli click [NATURE_PARKS_REF]
playwright-cli snapshot
```
**Expected:**
- Category selected
- Search triggered with new viewport bounds

### 5. Check Network Request Structure
```bash
playwright-cli network
```
**Expected:**
- POST request to `/api/places/search`
- Request payload includes:
  ```json
  {
    "northEast": { "latitude": XX, "longitude": XX },
    "southWest": { "latitude": XX, "longitude": XX },
    "categories": ["nature_parks"]
  }
  ```
- NO radius or center point fields (rectangle search)

### 6. Verify Backend Logs (Manual Check)
**Check backend console output for:**
```
Expected log patterns:
- "GooglePlacesNew API called"
- Rectangle bounds: N/S/E/W coordinates
- Included types: ["park", "natural_feature", "campground"]
- NO mention of "radius" or "circle" search
```

**Action:** Review backend console/terminal
```bash
# In backend terminal, look for log output showing:
# - SearchNearbPlaces with LocationRestriction.Rectangle
# - IncludedTypes parameter with park-related types
```

### 7. Zoom Map (Change Scale)
```bash
playwright-cli mousewheel 0 -500
playwright-cli snapshot
```
**Expected:**
- Map zooms in/out
- Viewport bounds change
- New search triggered automatically

### 8. Verify Search Triggered on Zoom
```bash
playwright-cli network
```
**Expected:**
- New POST request to `/api/places/search`
- Updated bounds reflecting new zoom level
- Same category filter maintained

### 9. Multi-Category Rectangle Search
```bash
# Select additional category
playwright-cli click [FOOD_DINING_REF]
playwright-cli snapshot
playwright-cli network
```
**Expected:**
- Request includes both categories
- Rectangle bounds still used (not radius)
- Included types expanded to cover both categories

### 10. Capture Final Network Request
```bash
playwright-cli screenshot
```
**Expected:** Screenshot showing network tab with rectangle search parameters

## Backend Log Verification Checklist

Review backend console for these indicators:

✅ GooglePlacesNew.SearchNearby API method called
✅ LocationRestriction uses Rectangle (not Circle)
✅ North/South/East/West coordinates present in logs
✅ IncludedTypes parameter populated with category mappings
✅ NO radius parameter in logs
✅ Type filtering happens at API level (not post-processing)

Example expected log output:
```
[INFO] Places Search Request:
  Location: Rectangle(N: 47.65, S: 47.60, E: -122.30, W: -122.35)
  Categories: ["nature_parks"]
  IncludedTypes: ["park", "natural_feature", "campground"]
  Using GooglePlacesNew API (rectangle search)
```

## Success Criteria
✅ Backend uses GooglePlacesNew.SearchNearby API
✅ Search uses rectangle bounds (not radius/circle)
✅ Request includes northEast and southWest coordinates
✅ IncludedTypes parameter populated with category mappings
✅ Backend logs confirm rectangle search with type filtering
✅ Type filtering occurs at Google API level (not post-fetch)
✅ Map pan/zoom triggers new searches with updated bounds
✅ No console errors in browser or backend

## Cleanup
```bash
playwright-cli close
```

## Notes
- This test verifies the core architecture change to rectangle search
- Backend logs are critical validation - must manually review
- Proves type filtering happens at API level, not after fetching
- Rectangle search is more efficient than radius for viewport-based queries
- Validates the Category → Google Types mapping is passed to API
