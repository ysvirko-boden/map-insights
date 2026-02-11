# E2E Test Plan: Map Multiple Markers Integration
## Feature: Phase 6 - Map Integration with Multiple Markers
## Test Date: February 6, 2026
## Testing Tool: Playwright CLI

---

## Test Objectives

Verify the complete integration between map markers and places list:
1. **Multiple Marker Rendering**: Blue markers appear for all search results
2. **Marker-to-List Synchronization**: Clicking a marker highlights the corresponding card in the list
3. **List-to-Marker Synchronization**: Clicking a list item highlights the marker on the map (red, larger)
4. **Hidden Places Filtering**: Hidden places don't show markers on the map
5. **Dual Marker System**: Autocomplete (yellow) and search (blue) markers coexist
6. **Viewport Bounds Tracking**: Map bounds update correctly on pan/zoom

---

## Test Scenarios

### Scenario 1: Multiple Markers Render on Search
**User Story**: As a user, I want to see markers on the map for all places in my search results

**Steps**:
1. Open application
2. Click "Load Places" button
3. Wait for search results to load
4. Verify multiple blue markers appear on the map
5. Count markers and compare to sidebar list count

**Expected Results**:
- Blue markers rendered for each place in results
- Marker count matches places list count
- Markers positioned at correct locations
- No duplicate markers

---

### Scenario 2: Marker Click Selects Place in List
**User Story**: As a user, when I click a marker on the map, I want to see the details of that place in the sidebar

**Steps**:
1. Load places (from Scenario 1)
2. Click on a blue marker on the map
3. Verify the marker turns red and larger
4. Verify corresponding place card is highlighted in sidebar
5. Verify place card scrolls into view if needed

**Expected Results**:
- Clicked marker changes to red color
- Marker scales to 1.2x size
- Place card in sidebar has highlighted class
- Place card is visible in viewport (scrolled into view)
- Only one marker is red at a time

---

### Scenario 3: List Click Highlights Marker
**User Story**: As a user, when I click a place in the sidebar, I want to see which marker on the map represents that place

**Steps**:
1. Load places
2. Click on a place card in the sidebar
3. Verify the corresponding marker on map turns red
4. Verify marker scales larger
5. Verify map does NOT pan or zoom (per requirements)

**Expected Results**:
- Marker turns red
- Marker scales to 1.2x
- Map stays at current position (no pan)
- Map stays at current zoom level (no zoom)
- Previously selected marker returns to blue

---

### Scenario 4: Hidden Places Remove Markers
**User Story**: As a user, when I hide a place from the list, I don't want to see its marker on the map

**Steps**:
1. Load places
2. Count initial markers on map
3. Expand a place card and click "Hide" button
4. Verify place card is removed from list
5. Verify corresponding marker is removed from map
6. Count remaining markers

**Expected Results**:
- Marker disappears from map instantly
- Marker count decreases by 1
- Other markers remain visible
- Place card is removed from sidebar
- No errors in console

---

### Scenario 5: Autocomplete and Search Markers Coexist
**User Story**: As a user, I want to use both autocomplete search and area search simultaneously

**Steps**:
1. Use autocomplete search input to find a specific place
2. Verify yellow marker appears for autocomplete result
3. Click "Load Places" to search current area
4. Verify blue markers appear for area search results
5. Verify both yellow and blue markers are visible simultaneously

**Expected Results**:
- Yellow marker for autocomplete place
- Multiple blue markers for area search
- All markers visible at same time
- Markers don't overlap/conflict
- Each marker has correct color

---

### Scenario 6: Marker Selection State Management
**User Story**: As a user, I want clear visual feedback about which place is currently selected

**Steps**:
1. Load places
2. Click marker A → verify it turns red
3. Click marker B → verify B turns red and A returns to blue
4. Click a place card in sidebar → verify correct marker turns red
5. Click another place card → verify selection updates correctly

**Expected Results**:
- Only one marker is red at a time
- Previously selected marker returns to blue
- Selected marker is always 1.2x larger
- Blue markers are normal size
- Visual state consistent between map and list

---

### Scenario 7: Viewport Bounds Tracking
**User Story**: As a user, when I pan or zoom the map, the system should track the new bounds for future searches

**Steps**:
1. Load initial places
2. Note current search results
3. Pan map to a different area
4. Click "Load Places" again
5. Verify new results are for the new map area
6. Verify markers update to show new results

**Expected Results**:
- Map bounds tracked after pan
- New search uses updated bounds
- Old markers are replaced with new ones
- Results change based on map position
- No duplicate API calls during pan (debouncing works)

---

### Scenario 8: Performance with Many Markers
**User Story**: As a user, I want smooth interaction even with maximum number of markers (50)

**Steps**:
1. Set limit to 50 places in filters
2. Load places
3. Verify 50 markers render
4. Click through several markers
5. Pan and zoom map
6. Verify interactions remain smooth

**Expected Results**:
- All 50 markers render without lag
- Marker clicks respond instantly
- Map pan/zoom is smooth
- No performance degradation
- No browser freezing

---

## Test Data Requirements

- **Location**: New York City area (default geolocation)
- **Place Types**: Mixed (restaurants, cafes, hotels, etc.)
- **Expected Results**: 10-50 places depending on filter settings
- **Backend Running**: http://localhost:5000
- **Frontend Running**: http://localhost:3000

---

## Known Constraints

1. **Browser**: Chromium via Playwright
2. **API**: Google Places API must be configured
3. **Backend**: Must be running before tests
4. **Frontend**: Must be running before tests
5. **Network**: Internet connection required for Google Maps

---

## Success Criteria

- ✅ All 8 scenarios pass
- ✅ No console errors during execution
- ✅ Performance remains smooth with max markers
- ✅ Visual state consistent between map and list
- ✅ No memory leaks or resource issues

---

## Test Execution Notes

This test plan will be executed using Playwright CLI with manual observation and screenshot capture for verification.
