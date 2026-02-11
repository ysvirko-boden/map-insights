# E2E Test: Theme Switching - Dark to Light

## Test Objective
Verify that users can manually switch from dark theme back to light theme.

## Prerequisites
- Application is running at http://localhost:5173 (or configured URL)
- Dark theme is currently active

## Test Steps

1. **Open Application with Dark Theme**
   - Navigate to the application URL
   - If not in dark mode, click Dark theme button first
   - Verify dark theme is active

2. **Verify Initial Dark Theme**
   - Check that the page background is dark colored
   - Verify the header and sidebar backgrounds are dark
   - Check that text is light colored
   - Verify Dark button is active

3. **Click Light Theme Button**
   - Find the theme toggle in the header
   - Click the Light theme button (☀️)
   - Wait for theme transition

4. **Verify Light Theme Applied**
   - Check that the page background is now light colored
   - Verify the header background is light
   - Verify the sidebar background is light
   - Check that text is now dark colored
   - Verify the Light button is now active
   - Verify the Dark button is no longer active

5. **Verify Component Theming**
   - Check that PlaceCard components have light background
   - Verify input fields have light background and dark text
   - Check that buttons reflect light theme colors
   - Verify borders are appropriately colored for light theme

6. **Check Data Attribute**
   - Inspect the `<html>` element
   - Verify `data-theme="light"` attribute is set

7. **Verify Persistence**
   - Refresh the page
   - Verify light theme persists after reload
   - Check that Light button is still active

## Expected Results
- Theme switches smoothly from dark to light
- All UI components update to light theme colors
- Theme preference is saved and persists across page reloads
- No visual glitches during transition
- All text remains readable with proper contrast

## Pass/Fail Criteria
- ✅ Pass: All verifications succeed, light theme applies correctly
- ❌ Fail: Any component fails to update, or theme doesn't persist
