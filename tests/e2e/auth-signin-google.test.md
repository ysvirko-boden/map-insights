# E2E Test: Authentication - Google OAuth Sign In

## Test Objective
Verify that users can successfully sign in using Google OAuth provider.

## Prerequisites
- Frontend app running on http://localhost:3000 or http://localhost:5173
- Backend API running on http://localhost:5000
- Firebase Authentication configured with Google auth provider enabled
- Test Google account credentials available
- Browser not in incognito mode (for session persistence)

## Test Steps

### 1. Navigate to Login Page
- **Action**: Open browser and navigate to http://localhost:3000 (or 5173)
- **Expected**: App redirects to `/login` page
- **Verify**: 
  - "Continue with Google" button visible
  - Google logo visible in button

### 2. Click Google Sign-In Button
- **Action**: Click "Continue with Google" button
- **Expected**:
  - Button shows loading state (disabled)
  - Google OAuth popup window opens
  - URL in popup is `accounts.google.com/...`

### 3. Complete Google Sign-In
- **Action**: In Google popup:
  - Select test Google account or sign in
  - Grant permissions if prompted
- **Expected**:
  - Google popup shows account selection
  - Permissions screen may appear (first time only)
  - Popup closes automatically after successful auth

### 4. Verify Successful Authentication
- **Action**: Wait for popup to close and return to app
- **Expected**:
  - Main window redirects to `/` (map page)
  - URL changes from `/login` to `/`
  - Map component loads successfully
  - Header displays Google account email
  - "Sign Out" button visible in header

### 5. Verify API Authorization
- **Action**: 
  - Open browser DevTools (F12)
  - Go to Network tab
  - Interact with map (trigger places search)
- **Expected**:
  - API request includes `Authorization: Bearer <firebase-token>`
  - Response status: 200 OK
  - Google-authenticated user has API access

### 6. Verify Session Persistence
- **Action**: Refresh the browser page (F5)
- **Expected**:
  - User remains authenticated
  - Map page reloads without redirect to login
  - Google account email still displayed in header

## Success Criteria
✅ Google OAuth popup opens on button click  
✅ User successfully authenticates via Google  
✅ Popup closes automatically after auth  
✅ Redirect to map page occurs  
✅ Google account email displayed in header  
✅ API calls include Firebase auth token  
✅ Session persists across refreshes  

## Failure Scenarios to Verify
❌ User closes popup without authenticating - remains on login page, no error  
❌ User denies permissions - error displayed, remains on login page  
❌ Network error during OAuth - error message displayed  

## Known Limitations
- Popup blockers may prevent OAuth window from opening
- Test requires actual Google account (can't be fully mocked)
- First-time users see Google permissions screen
- Automated testing with playwright may require special OAuth handling

## Notes
- Test can be partially automated using playwright-cli skill
- OAuth flow may require manual user interaction
- Screenshot should capture: Google sign-in popup, authenticated map view
- Consider using Firebase Auth Emulator for fully automated tests
