# E2E Test: Theme Map Integration

## Test Objective
Verify that Google Maps styling updates correctly when theme changes, using theme-specific Map IDs.

## Prerequisites
- Application is running at http://localhost:5173 (or configured URL)
- Google Maps API key is configured
- Theme-specific Map IDs are configured:
  - `VITE_GOOGLE_MAPS_MAP_ID_LIGHT`
  - `VITE_GOOGLE_MAPS_MAP_ID_DARK`
- Map IDs are created and styled in Google Cloud Console

## Test Steps

### Part 1: Initial Map in Light Theme

1. **Open Application**
   - Navigate to application URL
   - Wait for map to load completely

2. **Set to Light Theme**
   - Click Light theme button
   - Wait for theme to apply

3. **Verify Light Map Styling**
   - Check map background appears in light colors
   - Verify roads are dark colored on light background
   - Check water bodies use light/blue styling
   - Verify labels are dark colored for readability
   - Inspect map POI icons use light theme colors

### Part 2: Switch to Dark Theme

4. **Change to Dark Theme**
   - Click Dark theme button
   - Wait for theme transition

5. **Verify Dark Map Styling**
   - Check map background appears in dark colors
   - Verify roads are light colored on dark background
   - Check water bodies use dark/desaturated styling
   - Verify labels are light colored for readability
   - Inspect map POI icons use dark theme colors

6. **Verify Map Markers**
   - Check that custom markers are still visible
   - Verify marker colors contrast with dark map background
   - Check that selected markers are distinguishable

### Part 3: Theme Toggle Multiple Times

7. **Toggle Between Themes**
   - Switch to Light theme
   - Wait and observe map styling update
   - Switch to Dark theme
   - Wait and observe map styling update
   - Repeat 2-3 times

8. **Verify Consistent Updates**
   - Confirm map updates each time theme changes
   - Check for no flickering or glitches
   - Verify map doesn't reload/reset position
   - Confirm map controls remain functional

### Part 4: System Mode Integration

9. **Switch to System Mode**
   - Click System theme button
   - Verify map matches system preference

10. **Change System Preference**
    - Toggle OS color scheme (or use DevTools emulation)
    - Verify map updates automatically
    - Check map styling matches new system preference

### Part 5: Map Functionality

11. **Test Map Interactions**
    - Pan the map
    - Zoom in and out
    - Click on markers
    - Search for places
    - Verify all functionality works in both themes

12. **Verify No Errors**
    - Check browser console for errors
    - Look for any Map ID related errors
    - Verify no "invalid map id" messages

## Expected Results
- Map styling changes when theme is switched
- Light theme shows light map colors
- Dark theme shows dark map colors
- Map updates smoothly without reload
- Custom markers remain visible in both themes
- Map position and zoom are preserved during theme change
- All map interactions work correctly in both themes
- No console errors related to Map IDs

## Pass/Fail Criteria
- ✅ Pass: Map styling updates correctly for both themes
- ❌ Fail: Map doesn't update, incorrect styling, or errors occur

## Fallback Behavior
If theme-specific Map IDs are not configured:
- Map should still function with default Map ID
- Theme changes should not break the map
- Console may show info about missing Map IDs (acceptable)

## Notes
- Creating styled Map IDs in Google Cloud Console:
  1. Go to: https://console.cloud.google.com/google/maps-apis/studio/maps
  2. Create two Map IDs: one for light theme, one for dark theme
  3. Customize styling for each theme
  4. Add Map IDs to `.env` file
- Map styling changes may take 1-2 seconds to apply
- Test with both satellite and normal map views if applicable
