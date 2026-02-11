# E2E Test: Multiple Category Selection

**Test ID:** category-filter-multiple-selection
**Date:** 2026-02-10
**Purpose:** Verify that selecting multiple categories combines filters correctly

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
**Expected:** Application loads with all category buttons in unselected state

### 2. Select First Category: "Food & Dining"
```bash
# Click on "Food & Dining" button
playwright-cli click [FOOD_DINING_REF]
playwright-cli snapshot
```
**Expected:** 
- "Food & Dining" button shows selected state
- Places list shows food-related results

### 3. Select Second Category: "Coffee Shops"
```bash
# Click on "Coffee Shops" button
playwright-cli click [COFFEE_SHOPS_REF]
playwright-cli snapshot
```
**Expected:**
- Both "Food & Dining" AND "Coffee Shops" buttons are selected
- Places list shows combined results (restaurants, cafes, coffee shops)
- More places visible than with single category

### 4. Verify Both Buttons Selected
```bash
playwright-cli screenshot
```
**Expected:**
- Two category buttons show selected state
- Other category buttons remain unselected
- Clear visual indication of active filters

### 5. Verify Combined Results
```bash
playwright-cli eval "document.querySelectorAll('[data-place-item]').length"
playwright-cli snapshot
```
**Expected:**
- Results include types from both categories
- Cafes appear (common to both categories)
- Restaurants and bars appear (from Food & Dining)
- Coffee shops appear (from Coffee Shops category)

### 6. Verify Network Request
```bash
playwright-cli network
```
**Expected:**
- POST request to `/api/places/search`
- Request payload contains: `"categories": ["food_dining", "coffee_shops"]`
- Response includes places matching either category

### 7. Deselect One Category
```bash
# Click "Food & Dining" again to deselect
playwright-cli click [FOOD_DINING_REF]
playwright-cli snapshot
```
**Expected:**
- Only "Coffee Shops" button remains selected
- Results filter to show only coffee shops
- Network request updates to single category

## Success Criteria
✅ Multiple categories can be selected simultaneously
✅ All selected buttons show selected state
✅ Results include places from all selected categories
✅ Network request includes array of both categories
✅ Deselecting a category updates results immediately
✅ No console errors

## Cleanup
```bash
playwright-cli close
```

## Notes
- Tests multi-select functionality with category union (OR logic)
- Verifies that categories are additive, not exclusive
- Confirms UI and API both handle multiple selections correctly
