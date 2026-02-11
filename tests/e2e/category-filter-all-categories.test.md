# E2E Test: All Categories (No Filter)

**Test ID:** category-filter-all-categories
**Date:** 2026-02-10
**Purpose:** Verify that with no category selected, all place types are shown

## Prerequisites
- Backend running at http://localhost:5000
- Frontend running at http://localhost:3000
- Valid Google Maps API key configured

## Test Steps

### 1. Navigate to Application (Fresh Load)
```bash
playwright-cli open http://localhost:3000
playwright-cli snapshot
```
**Expected:** 
- Application loads with map centered on default location
- Category filter buttons all in unselected state
- Places list shows diverse results

### 2. Verify Initial State
```bash
playwright-cli screenshot
playwright-cli eval "document.querySelectorAll('[data-category-button].selected').length"
```
**Expected:**
- Result should be 0 (no categories selected)
- All category buttons have default styling
- No active filter indication

### 3. Verify Diverse Place Types
```bash
playwright-cli snapshot
playwright-cli eval "Array.from(document.querySelectorAll('[data-place-type]')).map(el => el.dataset.placeType)"
```
**Expected:**
- Results include variety of place types:
  - Restaurants (food & dining)
  - Parks (nature)
  - Museums (attractions)
  - Stores (shopping)
  - Gas stations (transportation)
  - etc.
- At least 3-4 different category types visible

### 4. Verify Network Request (Initial Load)
```bash
playwright-cli network
```
**Expected:**
- POST request to `/api/places/search`
- Request payload shows:
  - `"categories": null` OR
  - `"categories": []` OR
  - No categories field present
- Response includes diverse place types

### 5. Count Initial Results
```bash
playwright-cli eval "document.querySelectorAll('[data-place-item]').length"
```
**Expected:**
- Significant number of results (e.g., 10-20+ places)
- More results than any single category filter would show

### 6. Verify Map Markers
```bash
playwright-cli snapshot
```
**Expected:**
- Multiple markers visible on map
- Markers represent different place types
- No filtering applied to markers

### 7. Check Console for Errors
```bash
playwright-cli console
```
**Expected:**
- No errors or warnings
- Clean console log

## Success Criteria
✅ Initial load shows no categories selected
✅ Results include diverse place types from multiple categories
✅ Network request confirms no category filtering
✅ More results shown than single-category filter
✅ No console errors
✅ Map displays unfiltered markers

## Cleanup
```bash
playwright-cli close
```

## Notes
- Tests default state (no filtering)
- Verifies backend returns all types when categories not specified
- Establishes baseline for comparison with filtered results
- Important for ensuring "show all" functionality works
