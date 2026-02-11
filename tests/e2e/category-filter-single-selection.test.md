# E2E Test: Single Category Selection

**Test ID:** category-filter-single-selection
**Date:** 2026-02-10
**Purpose:** Verify that selecting a single category filters places correctly

## Prerequisites
- Backend running at http://localhost:5000
- Frontend running at http://localhost:3000
- Valid Google Maps API key configured

## Test Steps

### 1. Navigate to Application
```bash
playwright-cli open http://localhost:3000
playwright-cli snapshot
```
**Expected:** Application loads with map and category filter buttons visible

### 2. Select "Food & Dining" Category
```bash
# Click on "Food & Dining" button - will need to identify element ref from snapshot
playwright-cli click [ELEMENT_REF]
playwright-cli snapshot
```
**Expected:** 
- "Food & Dining" button shows selected state (different styling/color)
- Places list updates to show only food-related places
- Map markers update to show filtered results

### 3. Verify Results Content
```bash
playwright-cli snapshot
playwright-cli eval "document.querySelectorAll('[data-place-type]').length > 0"
```
**Expected:**
- Results contain restaurants, cafes, bars, bakeries
- Each result has appropriate place type indicator
- No non-food places appear in results

### 4. Verify Network Request
```bash
playwright-cli network
```
**Expected:**
- POST request to `/api/places/search` is visible
- Request payload contains: `"categories": ["food_dining"]`
- Response includes only food-related places

### 5. Verify Button State
```bash
playwright-cli screenshot
```
**Expected:**
- "Food & Dining" button is visually distinct (selected state)
- Other category buttons remain unselected
- Clear visual indication of active filter

## Success Criteria
✅ Category button changes to selected state when clicked
✅ Places list filters to show only relevant results
✅ Network request includes correct category parameter
✅ Map updates with filtered markers
✅ No console errors
✅ Response contains only food & dining establishments

## Cleanup
```bash
playwright-cli close
```

## Notes
- This test verifies single category selection functionality
- Checks both frontend UI state and backend API request
- Validates category-to-type mapping works correctly
