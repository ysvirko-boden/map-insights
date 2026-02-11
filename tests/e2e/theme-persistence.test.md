# E2E Test: Theme Persistence

## Test Objective
Verify that theme preference is saved to localStorage and persists across page reloads, browser restarts, and new tabs.

## Prerequisites
- Application is running at http://localhost:5173 (or configured URL)
- Clear browser localStorage before test
- Browser allows localStorage access

## Test Steps

### Part 1: Basic Persistence

1. **Open Application**
   - Navigate to application URL
   - Wait for page to load
   - Note default theme (should be System mode)

2. **Change to Light Theme**
   - Click Light theme button
   - Verify light theme is applied

3. **Check localStorage**
   - Open browser DevTools → Application/Storage → localStorage
   - Verify `theme-preference` key exists
   - Verify value is `"light"`

4. **Refresh Page**
   - Reload the page
   - Verify light theme is still active
   - Verify Light button is still highlighted

### Part 2: Multiple Theme Changes

5. **Switch to Dark Theme**
   - Click Dark theme button
   - Check localStorage value is now `"dark"`

6. **Refresh Page**
   - Reload the page
   - Verify dark theme persists
   - Verify Dark button is active

7. **Switch to System Mode**
   - Click System theme button
   - Check localStorage value is now `"system"`

8. **Refresh Page**
   - Reload the page
   - Verify system mode persists
   - Verify System button is active
   - Verify theme matches OS preference

### Part 3: New Tab Persistence

9. **Open New Tab**
   - Open application in a new browser tab
   - Wait for page to load

10. **Verify Theme Persists**
    - Verify theme matches the preference set in first tab
    - Verify correct button is active
    - Check localStorage has same value

### Part 4: Browser Restart (Optional)

11. **Close All Browser Windows**
    - Close all application tabs
    - Close entire browser

12. **Reopen Browser**
    - Launch browser again
    - Navigate to application URL

13. **Verify Theme Persists**
    - Verify theme preference is restored
    - Verify correct theme button is active
    - Check localStorage still has the value

### Part 5: Clear Storage

14. **Clear localStorage**
    - Open DevTools → Application → localStorage
    - Clear all data or remove `theme-preference` key

15. **Refresh Page**
    - Reload the page
    - Verify theme resets to default (System mode)
    - Verify System button is active

## Expected Results
- Theme preference is saved to localStorage immediately
- localStorage key is `theme-preference`
- Theme persists across page reloads
- Theme persists across new tabs
- Theme persists across browser restarts (if browser preserves localStorage)
- Clearing localStorage resets to default theme
- No console errors related to localStorage access

## Pass/Fail Criteria
- ✅ Pass: Theme preference persists in all scenarios
- ❌ Fail: Theme doesn't persist or localStorage isn't updated correctly

## Notes
- localStorage is domain-specific
- Private/Incognito mode may have different localStorage behavior
- Check browser console for any localStorage-related errors
