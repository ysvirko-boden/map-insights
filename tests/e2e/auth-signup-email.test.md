# E2E Test: Authentication - Email/Password Sign Up

## Test Objective
Verify that new users can successfully create an account and sign up using email and password.

## Prerequisites
- Frontend app running on http://localhost:3000 or http://localhost:5173
- Backend API running on http://localhost:5000
- Firebase Authentication configured with email/password auth enabled
- Use a unique test email that doesn't exist yet (e.g., `newuser${Date.now()}@example.com`)

## Test Steps

### 1. Navigate to Login Page
- **Action**: Open browser and navigate to http://localhost:3000 (or 5173)
- **Expected**: App redirects to `/login` page
- **Verify**: 
  - URL is `/login`
  - "Sign In" tab is active by default

### 2. Switch to Sign Up Tab
- **Action**: Click "Sign Up" tab button
- **Expected**:
  - "Sign Up" tab becomes active (highlighted)
  - "Sign In" tab becomes inactive
  - Form fields still visible (Email, Password)
  - Button text changes to "Sign Up"

### 3. Enter New User Credentials
- **Action**: 
  - Click on email input field
  - Type: `newuser@testdomain.com` (or unique email)
  - Click on password input field
  - Type: `NewPass123456!` (minimum 6 characters required)
- **Expected**:
  - Email appears in email field
  - Password appears as masked
  - "Sign Up" button remains enabled

### 4. Submit Sign Up Form
- **Action**: Click "Sign Up" button
- **Expected**:
  - Button text changes to "Loading..."
  - Button becomes disabled
  - No error messages appear (if email is unique)

### 5. Verify Account Creation and Auto Sign-In
- **Action**: Wait for account creation to complete
- **Expected**:
  - New account created in Firebase
  - User automatically signed in
  - Page redirects to `/` (map page)
  - URL changes from `/login` to `/`
  - Map component loads successfully

### 6. Verify New User in Header
- **Action**: Look at header bar
- **Expected**:
  - User email displayed: "newuser@testdomain.com"
  - "Sign Out" button visible
  - Theme toggle button visible

### 7. Verify API Access
- **Action**: 
  - Open browser DevTools (F12)
  - Go to Network tab
  - Trigger a places search on the map
- **Expected**:
  - API request to `/api/places/search` includes auth token
  - Response status: 200 OK
  - New user can access protected API endpoints

## Success Criteria
✅ User successfully creates new account with email/password  
✅ Account creation triggers automatic sign-in  
✅ Redirect to map page occurs after sign up  
✅ New user email displayed in header  
✅ New user can access protected API endpoints  

## Failure Scenarios to Verify
❌ Existing email - error message: "Firebase: Error (auth/email-already-in-use)."  
❌ Password too short (< 6 chars) - HTML5 validation prevents submission  
❌ Invalid email format - HTML5 validation prevents submission  
❌ Empty email/password - form validation prevents submission  

## Cleanup
After test completion, delete the test user from Firebase Console to avoid accumulation of test accounts.

## Notes
- Test can be automated using playwright-cli skill
- Use timestamp-based email to ensure uniqueness: `test${Date.now()}@example.com`
- Screenshot should capture: sign up form filled, successful redirect to map
