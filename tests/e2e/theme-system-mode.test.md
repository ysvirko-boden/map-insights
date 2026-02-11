# E2E Test: Theme System Mode

## Test Objective
Verify that system mode correctly detects and applies the operating system's color scheme preference.

## Prerequisites
- Application is running at http://localhost:5173 (or configured URL)
- Browser/OS supports color scheme detection
- Ability to change OS color scheme preference

## Test Steps

### Part 1: System Light Mode

1. **Set OS to Light Mode**
   - Configure OS/browser to light color scheme
   - Verify system preference is set to light

2. **Open Application**
   - Navigate to the application URL
   - Wait for page to load

3. **Click System Theme Button**
   - Find the theme toggle in header
   - Click the System theme button (💻)
   - Wait for theme to apply

4. **Verify Light Theme Applied**
   - Check that page uses light theme colors
   - Verify System button is active
   - Check `data-theme="light"` on `<html>` element

### Part 2: System Dark Mode

5. **Change OS to Dark Mode**
   - Configure OS/browser to dark color scheme
   - Do not refresh the page initially

6. **Verify Automatic Theme Update**
   - Observe that theme automatically switches to dark
   - Verify page uses dark theme colors
   - System button should remain active
   - Check `data-theme="dark"` on `<html>` element

### Part 3: System Light Mode Again

7. **Change OS Back to Light Mode**
   - Configure OS/browser to light color scheme
   - Do not refresh the page

8. **Verify Automatic Theme Update**
   - Observe that theme automatically switches to light
   - Verify page uses light theme colors
   - System button should remain active

### Part 4: Persistence

9. **Refresh Page**
   - Reload the application
   - Verify System mode is still active
   - Verify theme matches OS preference

## Expected Results
- System mode detects OS color scheme preference
- Theme automatically updates when OS preference changes
- No manual intervention needed after setting to System mode
- System mode preference persists across page reloads
- Theme matches OS preference on initial load

## Pass/Fail Criteria
- ✅ Pass: System mode correctly follows OS preference and updates dynamically
- ❌ Fail: Theme doesn't follow OS preference or doesn't update automatically

## Notes
- May need to use browser DevTools to emulate color scheme if OS changes are difficult
- In Chrome DevTools: More Tools → Rendering → Emulate CSS media feature prefers-color-scheme
