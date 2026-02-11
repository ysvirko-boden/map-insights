# E2E Test: Theme Switching - Light to Dark

## Test Objective
Verify that users can manually switch from light theme to dark theme using the theme toggle.

## Prerequisites
- Application is running at http://localhost:5173 (or configured URL)
- Browser is in light mode (default state)

## Test Steps

1. **Open Application**
   - Navigate to the application URL
   - Wait for page to load completely

2. **Verify Initial Light Theme**
   - Check that the page background is light colored (white/light gray)
   - Verify the header background is light
   - Verify the sidebar background is light
   - Check that text is dark colored for contrast

3. **Locate Theme Toggle**
   - Find the theme toggle buttons in the header (top-right corner)
   - Verify three buttons are visible: Light (☀️), Dark (🌙), System (💻)
   - Verify Light button is currently active (highlighted)

4. **Click Dark Theme Button**
   - Click the Dark theme button (🌙)
   - Wait for theme transition

5. **Verify Dark Theme Applied**
   - Check that the page background is now dark colored (#1a1a1a or similar)
   - Verify the header background is dark
   - Verify the sidebar background is dark (#242424 or similar)
   - Check that text is now light colored for contrast
   - Verify the Dark button is now active (highlighted)
   - Verify the Light button is no longer active

6. **Verify Component Theming**
   - Check that PlaceCard components have dark background
   - Verify input fields have dark background and light text
   - Check that buttons reflect dark theme colors
   - Verify borders are appropriately colored for dark theme

7. **Check Data Attribute**
   - Inspect the `<html>` element
   - Verify `data-theme="dark"` attribute is set

8. **Verify Persistence**
   - Refresh the page
   - Verify dark theme persists after reload
   - Check that Dark button is still active

## Expected Results
- Theme switches smoothly from light to dark
- All UI components update to dark theme colors
- Theme preference is saved and persists across page reloads
- No visual glitches or flashing during theme transition
- All text remains readable with proper contrast

## Pass/Fail Criteria
- ✅ Pass: All verifications succeed, dark theme applies correctly
- ❌ Fail: Any component fails to update, or theme doesn't persist
