# E2E Test Scenario: Google Maps Integration

## Test Overview
This end-to-end test validates the core Google Maps functionality including:
- Application loads successfully
- Layout renders correctly (Header, Footer, Sidebar, Map)
- Map initializes with Google Maps API
- Geolocation functionality (or fallback to NYC)
- Loading indicators appear and disappear

## Test Scenarios

### Scenario 1: Application Loads with Map (Happy Path)
**Given:** User opens the application
**When:** The page loads
**Then:**
1. Header displays "Map Insights"
2. Footer displays copyright with current year
3. Sidebar is visible on the right (25% width)
4. Map container is present
5. Loading indicator appears initially
6. Map loads and displays (either user location or NYC)
7. Map is interactive (controls visible)

### Scenario 2: Geolocation Permission Denied
**Given:** User opens the application
**When:** Geolocation permission is denied
**Then:**
1. Map falls back to NYC coordinates (40.7128, -74.006)
2. Warning notification shows "Location permission denied. Using default location."
3. Map is still functional and interactive

### Scenario 3: Layout Responsiveness
**Given:** Application is loaded
**When:** User views the page
**Then:**
1. Header takes full width
2. Main content area splits: Map (75%) + Sidebar (25%)
3. Footer takes full width
4. All elements are properly aligned

## Execution Steps

### Step 1: Navigate to Application
```bash
playwright-cli open http://localhost:3000
```

### Step 2: Wait for Initial Load and Take Snapshot
```bash
# Wait a moment for page to render
# Take snapshot to see the structure
playwright-cli snapshot
```

### Step 3: Verify Layout Elements
- Check for header with "Map Insights"
- Check for sidebar with "Sidebar" heading
- Check for footer with copyright
- Check for map container

### Step 4: Grant Geolocation Permission (Optional)
```bash
playwright-cli run-code "async page => await page.context().grantPermissions(['geolocation'])"
```

### Step 5: Wait for Map to Load
```bash
# Wait 3-5 seconds for map initialization
# Take snapshot to verify map loaded
playwright-cli snapshot
```

### Step 6: Verify Map Interactivity
- Check if map controls are visible
- Verify map tiles have loaded
- Check console for errors

### Step 7: Test Without Geolocation (Fallback)
```bash
# Open in new session without geolocation
playwright-cli --session=no-geo config --headed
playwright-cli --session=no-geo open http://localhost:3000
# Should see NYC fallback location
playwright-cli --session=no-geo snapshot
```

### Step 8: Take Screenshots for Documentation
```bash
playwright-cli screenshot
```

## Expected Results

1. ✅ Application loads without errors
2. ✅ All layout components render correctly
3. ✅ Map initializes and displays Google Maps
4. ✅ Loading indicator appears and disappears
5. ✅ Geolocation works or falls back to NYC
6. ✅ No console errors (except expected geolocation warnings)
7. ✅ Map is interactive with visible controls

## Success Criteria

- Page loads in < 5 seconds
- All UI elements are visible and properly positioned
- Map displays with correct zoom level (15)
- No JavaScript errors in console (except geolocation permissions)
- Map tiles load successfully
- User can see either their location or NYC on the map

## Error Scenarios to Handle

1. **API Key Missing/Invalid**
   - Expected: Error message "Error: Google Maps API key is not configured"

2. **Network Failure**
   - Expected: Map fails to load, error message displayed

3. **Geolocation Timeout**
   - Expected: Falls back to NYC, shows timeout message

---

**Test Status:** Ready for Execution
**Execution Date:** 2026-02-04
**Application URL:** http://localhost:3000
