# E2E Test: Authentication - Email/Password Sign In

## Test Objective
Verify that users can successfully sign in to the application using email and password credentials.

## Prerequisites
- Frontend app running on http://localhost:3000 or http://localhost:5173
- Backend API running on http://localhost:5000
- Firebase Authentication configured with email/password auth enabled
- Test user account already created in Firebase:
  - Email: test@example.com
  - Password: Test123456!

## Test Steps

### 1. Navigate to Application
- **Action**: Open browser and navigate to http://localhost:3000 (or 5173)
- **Expected**: App loads and automatically redirects to `/login` page
- **Verify**: 
  - URL changes to `/login`
  - Login page displays with "Map Insights" title
  - Two tabs visible: "Sign In" (active) and "Sign Up"
  - Email and Password input fields visible
  - "Sign In" button visible
  - "Continue with Google" button visible

### 2. Enter Valid Credentials
- **Action**: 
  - Click on email input field
  - Type: `test@example.com`
  - Click on password input field
  - Type: `Test123456!`
- **Expected**:
  - Email appears in email field
  - Password appears as masked (••••••••)
  - Sign In button remains enabled

### 3. Submit Sign In Form
- **Action**: Click "Sign In" button
- **Expected**:
  - Button text changes to "Loading..."
  - Button becomes disabled
  - No error messages appear

### 4. Verify Successful Authentication
- **Action**: Wait for authentication to complete
- **Expected**:
  - Page redirects to `/` (map page)
  - URL changes from `/login` to `/`
  - Map component loads successfully
  - Header shows user email: "test@example.com"
  - "Sign Out" button visible in header
  - Theme toggle button visible in header

### 5. Verify API Calls Include Auth Token
- **Action**: 
  - Open browser DevTools (F12)
  - Go to Network tab
  - Interact with map (trigger a places search)
- **Expected**:
  - API request to `/api/places/search` visible in Network tab
  - Request headers include: `Authorization: Bearer <firebase-token>`
  - Response status: 200 OK
  - Places data returned successfully

### 6. Verify Session Persistence
- **Action**: Refresh the browser page (F5)
- **Expected**:
  - User remains authenticated
  - Map page reloads (not redirected to login)
  - User email still displayed in header
  - Map state preserved

## Success Criteria
✅ User successfully authenticates with email/password  
✅ Redirect to map page occurs after sign in  
✅ User email displayed in header  
✅ API calls include Firebase auth token  
✅ Protected API endpoints return 200 (not 401)  
✅ Session persists across page refreshes  

## Failure Scenarios to Verify
❌ Empty email/password fields - form validation prevents submission  
❌ Invalid credentials - error message displayed: "Firebase: Error (auth/invalid-credential)."  
❌ Wrong password - error message displayed and user remains on login page  

## Notes
- Test can be automated using playwright-cli skill
- Screenshot should capture: login form, authenticated map view, network request with auth header
- Test user should be created in Firebase Console before running test
