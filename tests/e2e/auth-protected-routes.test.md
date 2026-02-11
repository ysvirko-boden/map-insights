# E2E Test: Authentication - Protected Routes

## Test Objective
Verify that unauthenticated users cannot access protected routes and are redirected to the login page.

## Prerequisites
- Frontend app running on http://localhost:3000 or http://localhost:5173
- Backend API running on http://localhost:5000
- User NOT authenticated (clear browser session/cookies)

## Test Steps

### 1. Clear Authentication State
- **Action**: 
  - Open browser DevTools (F12)
  - Go to Application tab → Storage
  - Clear all: Cookies, Local Storage, Session Storage, IndexedDB
  - Close DevTools
- **Expected**:
  - All browser storage cleared
  - No authentication tokens present

### 2. Attempt to Access Root Route
- **Action**: Navigate directly to http://localhost:3000/
- **Expected**:
  - Page immediately redirects to `/login`
  - URL changes from `/` to `/login`
  - Login page displays
  - map does NOT load

### 3. Verify Login Page Display
- **Action**: Observe the login page
- **Expected**:
  - "Map Insights" title visible
  - Sign In/Sign Up tabs visible
  - Email and Password fields visible
  - "Sign In" and "Continue with Google" buttons visible
  - No map or map-related components visible

### 4. Verify Direct Map Access Blocked
- **Action**: In browser address bar, type and press Enter:
  - `http://localhost:3000/` (or 5173)
- **Expected**:
  - URL immediately redirects to `/login`
  - User cannot stay on map route while unauthenticated

### 5. Sign In Successfully
- **Action**: 
  - Enter valid test credentials
  - Email: `test@example.com`
  - Password: `Test123456!`
  - Click "Sign In" button
- **Expected**:
  - Authentication succeeds
  - Redirect to `/` (map page)
  - Map loads successfully

### 6. Verify Access After Authentication
- **Action**: Now navigate to `/`
- **Expected**:
  - Map page loads without redirect
  - User remains on `/` route
  - User email displayed in header
  - Full application functionality available

### 7. Test Logout and Re-Protection
- **Action**: Click "Sign Out" button in header
- **Expected**:
  - User signed out
  - Redirect to `/login` page
  - URL changes to `/login`

### 8. Verify Protection Restored
- **Action**: Try to navigate to `/` again
- **Expected**:
  - Immediately redirected back to `/login`
  - Cannot access map without authentication

## API Protection Test

### 9. Verify API Returns 401 Without Auth
- **Action**: 
  - Open browser DevTools (F12)
  - Go to Console tab
  - Paste and execute:
    ```javascript
    fetch('http://localhost:5000/api/places/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        center: { lat: 40.7128, lng: -74.0060 }, 
        radius: 5000, 
        limit: 10 
      })
    }).then(r => r.status)
    ```
- **Expected**:
  - Response status: `401` (Unauthorized)
  - Request does NOT include Authorization header
  - API correctly rejects unauthenticated request

### 10. Verify Health Endpoint Remains Public
- **Action**: 
  - In browser Console, execute:
    ```javascript
    fetch('http://localhost:5000/api/health').then(r => r.json())
    ```
- **Expected**:
  - Response status: `200 OK`
  - Health check data returned
  - No authentication required for health endpoint

## Success Criteria
✅ Unauthenticated users redirected to `/login`  
✅ Direct access to `/` blocked when not authenticated  
✅ Login page displays correctly for unauth users  
✅ Sign in grants access to protected routes  
✅ Sign out removes access and redirects to login  
✅ API returns 401 for requests without auth token  
✅ Health check API remains public (no auth required)  
✅ Route protection persists after sign out  

## Failure Scenarios
❌ If user can access `/` without auth - **SECURITY ISSUE**  
❌ If API returns data without token - **SECURITY ISSUE**  
❌ If user not redirected after timeout - bad UX  

## Notes
- This is a critical security test
- Test must verify route protection and API protection separately
- Use playwright-cli skill for automated testing
- Screenshot should capture: redirect behavior, 401 response, successful login
