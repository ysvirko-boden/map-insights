# E2E Test Report: Authentication - Protected Routes

## Test Date
February 11, 2026

## Test Environment
- Frontend: http://localhost:3003
- Browser: Chromium (via playwright-cli)
- Test Tool: playwright-cli skill

## Test Objective
Verify that unauthenticated users cannot access protected routes and are redirected to the login page.

## Test Execution

### Test 1: Initial Access to Protected Route

**Action**: Navigate to http://localhost:3003/ (root URL) without authentication

**Expected Result**: 
- Redirect to `/login` page
- Login form displayed
- Map does NOT load

**Actual Result**: ✅ **PASSED**
- Page automatically redirected to http://localhost:3003/login
- Login page displayed correctly with:
  - "Map Insights" title
  - "Sign In" and "Sign Up" tabs
  - Email and Password input fields
  - "Sign In" button
  - "Continue with Google" button
- No map components visible

**Screenshot**: `.playwright-cli\page-2026-02-11T11-48-49-640Z.png`

### Test 2: Protected Route After Sign-Out

**Pre-condition**: User was authenticated, then signed out by clearing all browser storage (localStorage, sessionStorage, IndexedDB)

**Action**: Navigate to http://localhost:3003/ after clearing authentication

**Expected Result**:
- Redirect to `/login` page
- User cannot access map route
- Route protection re-enabled

**Actual Result**: ✅ **PASSED**
- After clearing IndexedDB (Firebase auth storage), page redirected to `/login`
- URL remained at http://localhost:3003/login
- Protected route correctly blocked unauthenticated access

**Screenshot**: `.playwright-cli\page-2026-02-11T11-54-55-757Z.png`

## Success Criteria

✅ Unauthenticated user redirected to login page  
✅ Cannot access protected routes without authentication  
✅ Login page displays correctly  
✅ Route protection persists after sign-out  

## Issues Discovered

### MapControl Component Error
**Severity**: High  
**Description**: Recurring JavaScript error preventing map from loading:
```
TypeError: Cannot read properties of undefined (reading 'indexOf')
at MapControl.tsx:18:40
```

**Impact**: 
- Map page shows error boundary instead of map
- Error occurs when map component attempts to mount
- Prevents normal navigation flow on authenticated pages

**Root Cause**: Error in MapControl component cleanup/mount logic, potentially related to Google Maps API initialization

**Related**: Google Maps API error also present (RefererNotAllowedMapError) - API key configuration issue

## Recommendations

1. **Fix MapControl Error**: Investigate line 18 of MapControl.tsx and add null checks before accessing properties
2. **Fix Google Maps API Key**: Update Firebase/Google Cloud console to allow http://localhost:3003 as authorized domain
3. **Add Error Recovery**: Improve error boundary to allow retry/navigation after errors

## Overall Result

**STATUS**: ✅ **PASSED (with issues noted)**

Protected routes functionality works correctly - unauthenticated users are properly redirected to login page. However, map loading errors prevent normal use of authenticated pages after successful sign-in.
