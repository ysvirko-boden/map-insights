# E2E Test: Category Filter Reset

**Test ID:** category-filter-reset
**Date:** 2026-02-10
**Purpose:** Verify that resetting filters returns to showing all categories

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
**Expected:** Application loads with no categories selected

### 2. Select "Attractions & Culture" Category
```bash
# Click on "Attractions & Culture" button
playwright-cli click [ATTRACTIONS_REF]
playwright-cli snapshot
```
**Expected:**
- "Attractions & Culture" button shows selected state
- Results filter to museums, tourist attractions, landmarks
- Network request includes `"categories": ["attractions_culture"]`

### 3. Verify Filtered State
```bash
playwright-cli screenshot
playwright-cli eval "document.querySelectorAll('[data-place-item]').length"
```
**Expected:**
- Fewer results than initial "all categories" view
- Only attraction/culture-related places visible
- At least one category button is selected

### 4. Option A: Click Reset/Clear Button (if exists)
```bash
# Look for reset/clear/all button in snapshot
playwright-cli click [RESET_BUTTON_REF]
playwright-cli snapshot
```
**Expected:**
- All category buttons return to unselected state
- Results expand to show all place types
- Visual indication that filter is cleared

### 5. Option B: Click Selected Category Again to Deselect
```bash
# If no dedicated reset button, click selected category to toggle off
playwright-cli click [ATTRACTIONS_REF]
playwright-cli snapshot
```
**Expected:**
- "Attractions & Culture" button returns to unselected state
- Results expand to show all place types

### 6. Verify All Categories Unselected
```bash
playwright-cli screenshot
playwright-cli eval "document.querySelectorAll('[data-category-button].selected').length"
```
**Expected:**
- Result is 0 (no selected categories)
- All buttons show default styling

### 7. Verify Results Show All Types Again
```bash
playwright-cli snapshot
playwright-cli eval "Array.from(document.querySelectorAll('[data-place-type]')).map(el => el.dataset.placeType)"
```
**Expected:**
- Diverse place types visible again
- Similar variety to initial load
- More results than filtered view

### 8. Verify Network Request After Reset
```bash
playwright-cli network
```
**Expected:**
- POST request to `/api/places/search`
- Request payload shows no categories or empty array
- Response includes diverse place types

### 9. Test Multiple Selection Reset
```bash
# Select multiple categories
playwright-cli click [FOOD_DINING_REF]
playwright-cli click [SHOPPING_REF]
playwright-cli snapshot

# Then reset
playwright-cli click [RESET_BUTTON_REF]
playwright-cli snapshot
```
**Expected:**
- Both category selections cleared
- All categories unselected
- Results show all types

## Success Criteria
✅ Reset functionality exists (button or toggle)
✅ All selected categories clear when reset triggered
✅ Results update to show all place types
✅ Visual state returns to "no filter" appearance
✅ Network request reflects cleared filter
✅ Works for single and multiple selections
✅ No console errors

## Cleanup
```bash
playwright-cli close
```

## Notes
- Critical for user experience - easy way to clear filters
- Tests both single and multiple selection reset
- Verifies UI, state, and API all sync on reset
- May be implemented as dedicated button or category re-click
