# E2E Test: Authentication - Sign Out Flow

## Test Objective
Verify that authenticated users can successfully sign out of the application and that all authentication state is properly cleared.

## Prerequisites
- Frontend app running on http://localhost:3000 or http://localhost:5173
- Backend API running on http://localhost:5000
- Test user account in Firebase:
  - Email: test@example.com
  - Password: Test123456!

## Test Steps

### 1. Sign In to Application
- **Action**: 
  - Navigate to http://localhost:3000 (or 5173)
  - App redirects to `/login`
  - Enter email: `test@example.com`
  - Enter password: `Test123456!`
  - Click "Sign In" button
- **Expected**:
  - Authentication succeeds
  - Redirect to `/` (map page)
  - User email visible in header: "test@example.com"
  - "Sign Out" button visible in header

### 2. Verify Authenticated State
- **Action**: 
  - Open browser DevTools (F12)
  - Go to Application tab → IndexedDB
  - Expand firebaseLocalStorageDb database
- **Expected**:
  - Firebase auth token stored in IndexedDB
  - User object contains email and uid
  - Authentication state is "signed-in"

### 3. Interact with Protected Features
- **Action**: 
  - Interact with map (pan, zoom, search places)
  - Open Network tab in DevTools
  - Observe API requests
- **Expected**:
  - API requests to `/api/places/search` succeed
  - Requests include `Authorization: Bearer <token>` header
  - Response status: 200 OK
  - Full map functionality available

### 4. Click Sign Out Button
- **Action**: 
  - Look at header bar
  - Click "Sign Out" button
- **Expected**:
  - Button may show brief loading state
  - No error messages appear

### 5. Verify Redirect to Login
- **Action**: Wait for sign out to complete
- **Expected**:
  - Page redirects to `/login`
  - URL changes from `/` to `/login`
  - Login form displays
  - User email NO LONGER visible in any UI element
  - "Sign Out" button no longer visible

### 6. Verify Authentication State Cleared
- **Action**: 
  - Open browser DevTools (F12)
  - Go to Application tab → IndexedDB
  - Inspect firebaseLocalStorageDb database
- **Expected**:
  - Firebase auth token removed or invalidated
  - User object is null or empty
  - No active authentication session

### 7. Verify Cannot Access Protected Routes
- **Action**: 
  - In browser address bar, type: `http://localhost:3000/`
  - Press Enter
- **Expected**:
  - Immediately redirects back to `/login`
  - Cannot access map route
  - Route protection re-enabled after sign out

### 8. Verify API Returns 401 After Sign Out
- **Action**: 
  - Open browser Console in DevTools
  - Execute:
    ```javascript
    fetch('http://localhost:5000/api/places/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        center: { lat: 40.7128, lng: -74.0060 }, 
        radius: 5000,
        limit: 10 
      })
    }).then(r => console.log('Status:', r.status))
    ```
- **Expected**:
  - Console logs: `Status: 401`
  - API rejects request (no auth token)
  - Unauthorized error returned

### 9. Verify Can Sign In Again
- **Action**: 
  - Still on `/login` page
  - Enter same credentials:
    - Email: `test@example.com`
    - Password: `Test123456!`
  - Click "Sign In" button
- **Expected**:
  - Authentication succeeds again
  - Redirect to `/` (map page)
  - User email displayed in header
  - Full functionality restored

### 10. Verify Session Does Not Persist After Sign Out
- **Action**: 
  - Sign out again
  - Close browser completely
  - Reopen browser
  - Navigate to http://localhost:3000
- **Expected**:
  - App redirects to `/login`
  - User must sign in again
  - Previous session NOT restored after explicit sign out

## Success Criteria
✅ Sign Out button successfully ends user session  
✅ Redirect to `/login` occurs after sign out  
✅ User email/info removed from UI  
✅ Authentication state cleared from browser storage  
✅ Protected routes become inaccessible after sign out  
✅ API requests return 401 after sign out  
✅ User can sign in again after signing out  
✅ Session does not persist after explicit sign out  

## Failure Scenarios
❌ If user remains authenticated after sign out - **CRITICAL BUG**  
❌ If API still accepts requests after sign out - **SECURITY ISSUE**  
❌ If user can access map after sign out - **SECURITY ISSUE**  
❌ If sign out fails silently - bad UX  

## Notes
- Test can be automated using playwright-cli skill
- Critical security test - verify complete session termination
- Screenshot should capture: authenticated state, sign out button click, login page after sign out
- Test both immediate effects and persistence across browser restart
