# E2E Test: Network Request Categories Validation

**Test ID:** network-request-categories
**Date:** 2026-02-10
**Purpose:** Detailed validation of network requests and responses for category filtering

## Prerequisites
- Backend running at http://localhost:5000
- Frontend running at http://localhost:3000
- Valid Google Maps API key configured
- Browser DevTools accessible

## Test Steps

### 1. Navigate and Open DevTools Network Tab
```bash
playwright-cli open http://localhost:3000
playwright-cli snapshot
```
**Expected:** Application loads

**Manual Action:** Open browser DevTools Network tab (F12 → Network)

### 2. Select "Nature & Parks" Category
```bash
playwright-cli click [NATURE_PARKS_REF]
playwright-cli snapshot
```
**Expected:**
- Category button selected
- Network request initiated

### 3. Capture Network Request
```bash
playwright-cli network
```
**Expected:** POST request to `/api/places/search` visible

### 4. Inspect Request Payload
**Manual Check in DevTools:**
- Click on the `/api/places/search` request
- Go to "Payload" or "Request" tab
- Verify JSON structure:

```json
{
  "northEast": {
    "latitude": 47.xxxx,
    "longitude": -122.xxxx
  },
  "southWest": {
    "latitude": 47.xxxx,
    "longitude": -122.xxxx
  },
  "categories": ["nature_parks"]
}
```

**Validation Points:**
✅ `categories` field is array
✅ Contains `"nature_parks"` string
✅ northEast and southWest coordinates present
✅ No `placeTypes` field (old parameter name)

### 5. Inspect Response Body
**Manual Check in DevTools:**
- Go to "Response" tab
- Review returned places:

```json
{
  "places": [
    {
      "id": "xxx",
      "name": "Discovery Park",
      "types": ["park"],
      ...
    },
    {
      "id": "yyy",
      "name": "Green Lake Park",
      "types": ["park"],
      ...
    }
  ]
}
```

**Validation Points:**
✅ Response contains parks and natural features
✅ Place types include: "park", "natural_feature", "campground"
✅ No restaurants, stores, or other unrelated types
✅ All results relevant to "Nature & Parks" category

### 6. Verify Response Headers
```bash
playwright-cli eval "await fetch('/api/places/search', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({northEast: {latitude: 47.65, longitude: -122.3}, southWest: {latitude: 47.6, longitude: -122.35}, categories: ['nature_parks']})}).then(r => r.headers.get('content-type'))"
```
**Expected:** 
- Content-Type: application/json
- Proper CORS headers (if applicable)

### 7. Test Multiple Categories Request
```bash
# Add another category
playwright-cli click [ATTRACTIONS_REF]
playwright-cli snapshot
playwright-cli network
```

**Manual Check:**
Request payload should show:
```json
{
  ...,
  "categories": ["nature_parks", "attractions_culture"]
}
```

**Validation:**
✅ Array contains both categories
✅ Response includes places from both types
✅ Parks AND museums/tourist attractions present

### 8. Test Empty Categories (Reset)
```bash
# Click selected categories to deselect
playwright-cli click [NATURE_PARKS_REF]
playwright-cli click [ATTRACTIONS_REF]
playwright-cli snapshot
playwright-cli network
```

**Manual Check:**
Request payload should show:
```json
{
  ...,
  "categories": null
  // OR "categories": []
  // OR no categories field
}
```

**Validation:**
✅ Categories cleared or null/empty
✅ Response includes diverse place types
✅ No filtering applied

### 9. Validate Response Structure
```bash
playwright-cli eval "fetch('/api/places/search', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({northEast: {latitude: 47.65, longitude: -122.3}, southWest: {latitude: 47.6, longitude: -122.35}, categories: ['food_dining']})}).then(r => r.json()).then(data => ({hasPlaces: Array.isArray(data.places), firstPlaceHasTypes: data.places[0]?.types?.length > 0}))"
```
**Expected:**
```json
{
  "hasPlaces": true,
  "firstPlaceHasTypes": true
}
```

### 10. Check Error Handling
```bash
# Test invalid category
playwright-cli eval "fetch('/api/places/search', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({northEast: {latitude: 47.65, longitude: -122.3}, southWest: {latitude: 47.6, longitude: -122.35}, categories: ['invalid_category']})}).then(r => ({status: r.status, ok: r.ok}))"
```
**Expected:**
- Should handle gracefully (either ignore invalid or return error)
- No 500 server error
- Appropriate status code

### 11. Performance Check
```bash
playwright-cli network
```
**Manual Check:**
- Request/response times in Network tab
- Look for:
  - Request time < 500ms (typically)
  - Response size reasonable
  - No duplicate requests

### 12. Console Error Check
```bash
playwright-cli console
```
**Expected:**
- No error messages
- No warning messages
- Clean console log

## Network Request Summary Template

Document findings:

| Test Case | Request Categories | Response Count | Response Types | Status | Time |
|-----------|-------------------|----------------|----------------|--------|------|
| Single: Nature & Parks | `["nature_parks"]` | 15 | park, natural_feature | 200 | 320ms |
| Multiple: Food + Coffee | `["food_dining", "coffee_shops"]` | 28 | restaurant, cafe, bar | 200 | 410ms |
| All Categories | `null` or `[]` | 35 | diverse | 200 | 380ms |

## Success Criteria
✅ Request payload contains `categories` parameter (not `placeTypes`)
✅ Categories sent as array of strings
✅ Response contains only relevant place types
✅ Multiple categories send array with multiple values
✅ Empty/null categories return all types
✅ Response structure matches API contract
✅ No 4xx/5xx errors
✅ Reasonable response times (<1s)
✅ No console errors
✅ Proper HTTP headers

## Cleanup
```bash
playwright-cli close
```

## Notes
- Most detailed validation of API contract
- Confirms backend correctly interprets categories
- Validates response filtering works as expected
- Critical for verifying end-to-end data flow
- Documents actual API behavior for future reference
