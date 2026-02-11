# Implementation Plan: Category Filters with Google Places API (New)

## Overview

This plan upgrades place type filtering from 10 hardcoded types to 10 traveler-friendly categories, each mapping to multiple Google Places API types (~40-50 total). Uses GoogleApi package's `GooglePlacesNew.Search.NearBySearchNew` for rectangle searches and server-side type filtering, providing better performance and user experience.

**Key Decisions:** 
- UI shows 10 semantic categories while backend maps to ~40-50 Google API types
- Use GoogleApi's `GooglePlacesNew.Search.NearBySearchNew` (no package change needed)
- Rectangle searches with type pre-filtering at API level
- Keep grid division strategy but use rectangles instead of circles
- Multiple category selection enabled
- Default state: All categories (no filter)

---

## Implementation Steps

### Step 1: Define Category Mapping (Shared Configuration)

Create category definitions as single source of truth.

#### Frontend: Create Category Type Definitions

**File:** `src/frontend/src/types/placeCategories.ts`

```typescript
/**
 * High-level place categories for traveler-friendly filtering
 */
export type PlaceCategory =
  | 'food_dining'
  | 'coffee_shops'
  | 'groceries'
  | 'attractions'
  | 'shopping'
  | 'nature_parks'
  | 'healthcare'
  | 'services'
  | 'transportation'
  | 'nightlife';

/**
 * Mapping of high-level categories to Google Places API type identifiers
 */
export const CATEGORY_MAPPINGS: Record<PlaceCategory, string[]> = {
  food_dining: ['restaurant', 'cafe', 'bar', 'bakery', 'meal_takeaway'],
  coffee_shops: ['cafe', 'coffee_shop'],
  groceries: ['supermarket', 'grocery_store', 'convenience_store'],
  attractions: [
    'tourist_attraction',
    'museum',
    'art_gallery',
    'landmark',
    'point_of_interest',
    'aquarium',
    'zoo',
  ],
  shopping: ['shopping_mall', 'store', 'clothing_store', 'department_store'],
  nature_parks: ['park', 'natural_feature', 'campground'],
  healthcare: ['pharmacy', 'hospital', 'doctor'],
  services: ['atm', 'bank', 'post_office', 'laundry'],
  transportation: [
    'gas_station',
    'parking',
    'transit_station',
    'bus_station',
    'train_station',
  ],
  nightlife: ['night_club', 'bar', 'casino', 'movie_theater'],
};

/**
 * Human-readable labels for categories
 */
export function getCategoryLabel(category: PlaceCategory): string {
  const labels: Record<PlaceCategory, string> = {
    food_dining: 'Food & Dining',
    coffee_shops: 'Coffee Shops',
    groceries: 'Groceries & Essentials',
    attractions: 'Attractions & Culture',
    shopping: 'Shopping',
    nature_parks: 'Nature & Parks',
    healthcare: 'Healthcare',
    services: 'Services',
    transportation: 'Transportation',
    nightlife: 'Nightlife & Entertainment',
  };
  return labels[category];
}

/**
 * Material icon identifiers for categories
 */
export function getCategoryIcon(category: PlaceCategory): string {
  const icons: Record<PlaceCategory, string> = {
    food_dining: 'restaurant',
    coffee_shops: 'local_cafe',
    groceries: 'local_grocery_store',
    attractions: 'attractions',
    shopping: 'shopping_bag',
    nature_parks: 'park',
    healthcare: 'local_pharmacy',
    services: 'room_service',
    transportation: 'directions_bus',
    nightlife: 'nightlife',
  };
  return icons[category];
}

/**
 * Description text for categories
 */
export function getCategoryDescription(category: PlaceCategory): string {
  const descriptions: Record<PlaceCategory, string> = {
    food_dining: 'Restaurants, cafes, bars, and bakeries',
    coffee_shops: 'Coffee shops and cafes',
    groceries: 'Supermarkets, grocery stores, and convenience stores',
    attractions: 'Museums, landmarks, tourist attractions, and points of interest',
    shopping: 'Shopping malls, stores, and retail locations',
    nature_parks: 'Parks, natural features, and campgrounds',
    healthcare: 'Pharmacies, hospitals, and medical services',
    services: 'ATMs, banks, post offices, and laundry services',
    transportation: 'Gas stations, parking, and transit stations',
    nightlife: 'Night clubs, bars, casinos, and entertainment venues',
  };
  return descriptions[category];
}

/**
 * All available categories for iteration
 */
export const ALL_CATEGORIES: PlaceCategory[] = [
  'food_dining',
  'coffee_shops',
  'groceries',
  'attractions',
  'shopping',
  'nature_parks',
  'healthcare',
  'services',
  'transportation',
  'nightlife',
];
```

#### Backend: Create Category Enum and Mapping

**File:** `src/backend/src/MapInsights.Core/Places/PlaceCategories.cs`

```csharp
namespace MapInsights.Core.Places;

/// <summary>
/// High-level place categories for traveler-friendly filtering.
/// Each category maps to multiple Google Places API type identifiers.
/// </summary>
public enum PlaceCategory
{
    FoodDining,
    CoffeeShops,
    Groceries,
    Attractions,
    Shopping,
    NatureParks,
    Healthcare,
    Services,
    Transportation,
    Nightlife
}

/// <summary>
/// Maps high-level categories to Google Places API type identifiers
/// </summary>
public static class CategoryMappings
{
    private static readonly Dictionary<PlaceCategory, string[]> _mappings = new()
    {
        [PlaceCategory.FoodDining] = new[] { "restaurant", "cafe", "bar", "bakery", "meal_takeaway" },
        [PlaceCategory.CoffeeShops] = new[] { "cafe", "coffee_shop" },
        [PlaceCategory.Groceries] = new[] { "supermarket", "grocery_store", "convenience_store" },
        [PlaceCategory.Attractions] = new[] { "tourist_attraction", "museum", "art_gallery", "landmark", "point_of_interest", "aquarium", "zoo" },
        [PlaceCategory.Shopping] = new[] { "shopping_mall", "store", "clothing_store", "department_store" },
        [PlaceCategory.NatureParks] = new[] { "park", "natural_feature", "campground" },
        [PlaceCategory.Healthcare] = new[] { "pharmacy", "hospital", "doctor" },
        [PlaceCategory.Services] = new[] { "atm", "bank", "post_office", "laundry" },
        [PlaceCategory.Transportation] = new[] { "gas_station", "parking", "transit_station", "bus_station", "train_station" },
        [PlaceCategory.Nightlife] = new[] { "night_club", "bar", "casino", "movie_theater" }
    };

    /// <summary>
    /// Gets Google Places API types for a single category
    /// </summary>
    public static string[] GetGooglePlaceTypes(PlaceCategory category)
    {
        return _mappings.TryGetValue(category, out var types) ? types : Array.Empty<string>();
    }

    /// <summary>
    /// Gets all Google Places API types for multiple categories, flattened and deduplicated
    /// </summary>
    public static List<string> GetAllGooglePlaceTypes(IEnumerable<PlaceCategory> categories)
    {
        return categories
            .SelectMany(GetGooglePlaceTypes)
            .Distinct()
            .ToList();
    }

    /// <summary>
    /// Parses a category string to PlaceCategory enum (case-insensitive)
    /// </summary>
    public static PlaceCategory? ParseCategory(string categoryString)
    {
        if (string.IsNullOrWhiteSpace(categoryString))
            return null;

        return Enum.TryParse<PlaceCategory>(categoryString, ignoreCase: true, out var category)
            ? category
            : null;
    }
}
```

---

### Step 2: Update Type Definitions

#### Frontend: Update Places Types

**File:** `src/frontend/src/types/places.ts`

- Remove old `PlaceType` union (lines 18-28)
- Import and export `PlaceCategory` from `placeCategories.ts`
- Update `PlaceSearchFilters` interface

```typescript
// Remove this:
export type PlaceType =
  | 'restaurant'
  | 'hotel'
  | 'cafe'
  | 'museum'
  | 'park'
  | 'shopping_mall'
  | 'tourist_attraction'
  | 'bar'
  | 'gym'
  | 'gas_station';

// Add this:
export { PlaceCategory, ALL_CATEGORIES } from './placeCategories';

// Update interface:
export interface PlaceSearchFilters {
  categories: PlaceCategory[];  // Changed from placeTypes: PlaceType[]
  minimumRating: number | null;
  limit: number;
}
```

#### Backend API: Update Request Model

**File:** `src/backend/src/MapInsights.Api/Features/Places/Models/PlaceSearchRequest.cs`

```csharp
/// <summary>
/// Request model for place search with high-level category filtering
/// </summary>
public class PlaceSearchRequest
{
    public ViewportBounds ViewportBounds { get; init; } = null!;
    
    /// <summary>
    /// High-level category filters (e.g., "food_dining", "coffee_shops").
    /// Leave empty for all place types.
    /// </summary>
    public List<string>? Categories { get; init; }  // Changed from PlaceTypes
    
    public double? MinimumRating { get; init; }
    public int Limit { get; init; } = 50;
}
```

#### Backend Core: Update Search Criteria

**File:** `src/backend/src/MapInsights.Core/Places/PlaceSearchCriteria.cs`

```csharp
public class PlaceSearchCriteria
{
    public ViewportBounds Bounds { get; init; } = null!;
    
    /// <summary>
    /// Google Places API type identifiers (expanded from categories)
    /// </summary>
    public List<string>? Types { get; init; }
    
    /// <summary>
    /// User-selected high-level categories (for reference)
    /// </summary>
    public List<PlaceCategory>? Categories { get; init; }
    
    public double? MinRating { get; init; }
    public int MaxResults { get; init; } = 50;
}
```

---

### Step 3: Update Validation Logic

**File:** `src/backend/src/MapInsights.Api/Features/Places/Validators/PlaceSearchRequestValidator.cs`

Replace hardcoded type validation with category validation:

```csharp
public class PlaceSearchRequestValidator : AbstractValidator<PlaceSearchRequest>
{
    private static readonly HashSet<string> _validCategories = new(StringComparer.OrdinalIgnoreCase)
    {
        "food_dining",
        "coffee_shops",
        "groceries",
        "attractions",
        "shopping",
        "nature_parks",
        "healthcare",
        "services",
        "transportation",
        "nightlife"
    };

    public PlaceSearchRequestValidator()
    {
        RuleFor(x => x.ViewportBounds)
            .NotNull()
            .SetValidator(new ViewportBoundsValidator());

        RuleFor(x => x.Categories)
            .Must(categories => categories == null || categories.All(c => _validCategories.Contains(c)))
            .WithMessage("One or more categories are invalid. Allowed categories: " + 
                string.Join(", ", _validCategories));

        RuleFor(x => x.MinimumRating)
            .InclusiveBetween(0.0, 5.0)
            .When(x => x.MinimumRating.HasValue);

        RuleFor(x => x.Limit)
            .InclusiveBetween(1, 100);
    }
}
```

---

### Step 4: Update Mapping Layer

**File:** `src/backend/src/MapInsights.Api/Features/Places/Mapping/PlacesMappingExtensions.cs`

Update `ToPlaceSearchCriteria()` to expand categories to Google API types:

```csharp
public static PlaceSearchCriteria ToPlaceSearchCriteria(this PlaceSearchRequest request)
{
    List<PlaceCategory>? categories = null;
    List<string>? types = null;

    if (request.Categories?.Count > 0)
    {
        // Parse categories
        categories = request.Categories
            .Select(CategoryMappings.ParseCategory)
            .Where(c => c.HasValue)
            .Select(c => c!.Value)
            .ToList();

        // Expand to Google Places API types
        types = CategoryMappings.GetAllGooglePlaceTypes(categories);
    }

    return new PlaceSearchCriteria
    {
        Bounds = new ViewportBounds
        {
            North = request.ViewportBounds.North,
            South = request.ViewportBounds.South,
            East = request.ViewportBounds.East,
            West = request.ViewportBounds.West
        },
        Categories = categories,
        Types = types,
        MinRating = request.MinimumRating,
        MaxResults = request.Limit
    };
}
```

---

### Step 5: Rewrite GooglePlacesService for New Places API

**File:** `src/backend/src/MapInsights.Infrastructure/Places/GooglePlacesService.cs`

Major rewrite to use `GooglePlacesNew.Search.NearBySearchNew`:

#### Update Usings

```csharp
using GoogleApi;
using GoogleApi.Entities.Common;
using GoogleApi.Entities.Common.Enums;
using GoogleApi.Entities.Places.Search.NearBy.Request.New;
using GoogleApi.Entities.Places.Search.NearBy.Response.New;
using MapInsights.Core.Places;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
```

#### Rewrite SearchSingleCellAsync Method

Replace circle-based search with rectangle-based search and add type filtering:

```csharp
private async Task<List<PlaceDetails>> SearchSingleCellAsync(
    Core.Places.ViewportBounds bounds,
    PlaceSearchCriteria criteria,
    CancellationToken cancellationToken)
{
    try
    {
        var request = new PlacesNearBySearchNewRequest
        {
            Key = _options.ApiKey,
            LocationRestriction = new LocationRestriction
            {
                Rectangle = new Rectangle
                {
                    Low = new LatLng
                    {
                        Latitude = bounds.South,
                        Longitude = bounds.West
                    },
                    High = new LatLng
                    {
                        Latitude = bounds.North,
                        Longitude = bounds.East
                    }
                }
            },
            MaxResultCount = 20 // Google Places API v1 limit
        };

        // Add type filtering at API level
        if (criteria.Types?.Count > 0)
        {
            request.IncludedTypes.AddRange(criteria.Types);
        }

        var response = await GooglePlacesNew.Search.NearBySearchNew.QueryAsync(request, cancellationToken);

        if (response.Status != Status.Ok && response.Status != Status.ZeroResults)
        {
            _logger.LogWarning(
                "Google Places API returned status: {Status} for cell N:{North} S:{South} E:{East} W:{West}",
                response.Status,
                bounds.North,
                bounds.South,
                bounds.East,
                bounds.West);
            return [];
        }

        return response.Results
            .Where(p => MatchesCriteria(p, criteria))
            .Select(MapToPlaceDetails)
            .ToList();
    }
    catch (Exception ex)
    {
        _logger.LogWarning(
            ex,
            "Error searching cell N:{North} S:{South} E:{East} W:{West}",
            bounds.North,
            bounds.South,
            bounds.East,
            bounds.West);
        return [];
    }
}
```

#### Simplify MatchesCriteria Method

Remove type filtering (now handled by API):

```csharp
private static bool MatchesCriteria(
    PlaceResult place,
    PlaceSearchCriteria criteria)
{
    // Type filtering now handled by Google API via IncludedTypes
    // Only apply rating filter here
    
    if (criteria.MinRating.HasValue)
    {
        if (!place.Rating.HasValue || place.Rating.Value < criteria.MinRating.Value)
        {
            return false;
        }
    }

    return true;
}
```

#### Update MapToPlaceDetails for New API Response

Adapt to new API response structure:

```csharp
private static PlaceDetails MapToPlaceDetails(PlaceResult place)
{
    // Note: New API may have different property names/structure
    // Adjust based on actual GoogleApi.Entities.Places.Search.NearBy.Response.New.PlaceResult
    
    var firstType = place.Types?.FirstOrDefault();
    var primaryType = firstType?.ToString().ToLowerInvariant() ?? "unknown";

    return new PlaceDetails
    {
        PlaceId = place.PlaceId ?? string.Empty,
        Name = place.Name ?? "Unnamed",
        Type = primaryType,
        Rating = place.Rating,
        UserRatingsTotal = place.UserRatingsTotal,
        FormattedAddress = place.Vicinity ?? place.FormattedAddress,
        FormattedPhoneNumber = null,
        OpeningHours = place.OpeningHours != null
            ? new Core.Places.OpeningHours
            {
                OpenNow = place.OpeningHours.OpenNow,
                WeekdayText = null
            }
            : null,
        Location = new Core.Places.Location
        {
            Lat = place.Geometry.Location.Latitude,
            Lng = place.Geometry.Location.Longitude
        }
    };
}
```

#### Remove CalculateRadius Method

No longer needed with rectangle searches - delete this method entirely.

---

### Step 6: Update Frontend Components

#### Delete Old Component

**File:** `src/frontend/src/components/Map/PlaceTypeSelect.tsx`
- Delete this file entirely

#### Create New Category Select Component

**File:** `src/frontend/src/components/Map/PlaceCategorySelect.tsx`

```typescript
import { useState } from 'react';
import { PlaceCategory, ALL_CATEGORIES, getCategoryLabel, getCategoryIcon } from '../../types/placeCategories';

interface PlaceCategorySelectProps {
  selectedCategories: PlaceCategory[];
  onChange: (categories: PlaceCategory[]) => void;
}

export function PlaceCategorySelect({ selectedCategories, onChange }: PlaceCategorySelectProps) {
  const handleCategoryToggle = (category: PlaceCategory) => {
    const isSelected = selectedCategories.includes(category);
    
    if (isSelected) {
      onChange(selectedCategories.filter(c => c !== category));
    } else {
      onChange([...selectedCategories, category]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const isAllSelected = selectedCategories.length === 0;

  return (
    <div className="place-category-select">
      <div className="category-header">
        <h3>Place Categories</h3>
        {selectedCategories.length > 0 && (
          <button onClick={handleClearAll} className="clear-button">
            All Categories
          </button>
        )}
      </div>
      
      <div className="category-buttons">
        {ALL_CATEGORIES.map(category => {
          const isSelected = selectedCategories.includes(category);
          
          return (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className={`category-button ${isSelected ? 'selected' : ''} ${isAllSelected ? 'all-active' : ''}`}
              aria-pressed={isSelected}
            >
              <span className="material-icons">{getCategoryIcon(category)}</span>
              <span className="category-label">{getCategoryLabel(category)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

#### Update Filters Container

**File:** `src/frontend/src/components/Map/PlacesFilters.tsx`

Replace `PlaceTypeSelect` with `PlaceCategorySelect`:

```typescript
// Update import
import { PlaceCategorySelect } from './PlaceCategorySelect';

// In component, replace:
<PlaceTypeSelect
  selectedTypes={filters.placeTypes}
  onChange={handlePlaceTypesChange}
/>

// With:
<PlaceCategorySelect
  selectedCategories={filters.categories}
  onChange={handleCategoriesChange}
/>

// Update handler:
const handleCategoriesChange = (categories: PlaceCategory[]) => {
  setFilters({ ...filters, categories });
};
```

#### Update Utilities

**File:** `src/frontend/src/utils/places.ts`

Remove old `getPlaceTypeLabel()` and `getPlaceTypeIcon()` functions, import from placeCategories instead:

```typescript
// Remove these functions (lines 11-46)
// Import from placeCategories.ts instead:
export { getCategoryLabel, getCategoryIcon, getCategoryDescription } from '../types/placeCategories';

// Keep other utility functions unchanged
```

---

### Step 7: Update State Management

**File:** `src/frontend/src/store/placesStore.ts`

Update store to use categories:

```typescript
interface PlacesState {
  places: Place[];
  filters: {
    categories: PlaceCategory[];  // Changed from placeTypes: PlaceType[]
    minimumRating: number | null;
    limit: number;
  };
  // ... other state
}

// Update initial state:
const usePlacesStore = create<PlacesState>((set) => ({
  places: [],
  filters: {
    categories: [],  // Empty = all categories
    minimumRating: null,
    limit: 50,
  },
  // ... other initial state
  
  setFilters: (filters) => set({ filters }),
  
  resetFilters: () => set({
    filters: {
      categories: [],
      minimumRating: null,
      limit: 50,
    }
  }),
}));
```

---

### Step 8: Update API Service Layer

#### Frontend Service

**File:** `src/frontend/src/services/placesService.ts`

Update request payload:

```typescript
export const placesService = {
  async searchPlaces(params: {
    viewportBounds: ViewportBounds;
    categories: string[] | null;  // Changed from placeTypes
    minimumRating: number | null;
    limit: number;
  }): Promise<PlaceSearchResponse> {
    const response = await apiClient.post<PlaceSearchResponse>(
      '/api/places/search',
      {
        viewportBounds: params.viewportBounds,
        categories: params.categories,  // Changed from placeTypes
        minimumRating: params.minimumRating,
        limit: params.limit,
      }
    );
    return response.data;
  },
};
```

#### Frontend Hook

**File:** `src/frontend/src/hooks/usePlacesSearch.ts`

Update query key and parameters:

```typescript
export function usePlacesSearch(filters: PlaceSearchFilters, viewportBounds: ViewportBounds) {
  return useQuery({
    queryKey: [
      'places',
      viewportBounds,
      filters.categories,  // Changed from filters.placeTypes
      filters.minimumRating,
      filters.limit,
    ],
    queryFn: async () => {
      return await placesService.searchPlaces({
        viewportBounds,
        categories: filters.categories.length > 0 ? filters.categories : null,
        minimumRating: filters.minimumRating,
        limit: filters.limit,
      });
    },
    enabled: !!viewportBounds,
  });
}
```

---

### Step 9: Update Tests

#### Backend Tests

**Validator Tests:**
- File: `src/backend/tests/MapInsights.Api.Tests.Unit/Features/Places/PlaceSearchRequestValidatorTests.cs`
- Test valid category values
- Test invalid category values
- Test case-insensitivity
- Test null/empty categories

**Mapping Tests:**
- Test category-to-types expansion
- Test multiple categories produce correct combined type list
- Test deduplication of overlapping types (e.g., "bar" in both food_dining and nightlife)

**Service Tests:**
- Mock `GooglePlacesNew` API
- Test rectangle construction from bounds
- Test type inclusion in API requests
- Test response mapping

#### Frontend Tests

**Component Tests:**
- File: `src/frontend/src/components/Map/PlaceCategorySelect.test.tsx`
- Test rendering all 10 categories
- Test single category selection
- Test multiple category selection
- Test "All Categories" (clear) functionality
- Test visual state changes

**Store Tests:**
- Test category filter state management
- Test filter reset with categories
- Test filter persistence

**Hook Tests:**
- Test query with categories parameter
- Test query key generation includes categories
- Test empty categories = null in request

---

### Step 10: Update API Documentation

#### HTTP File

**File:** `src/backend/src/MapInsights.Api/MapInsights.Api.http`

Update example requests:

```http
### Search Places with Categories
POST {{baseUrl}}/api/places/search
Content-Type: application/json

{
  "viewportBounds": {
    "north": 40.7589,
    "south": 40.7489,
    "east": -73.9789,
    "west": -73.9889
  },
  "categories": ["food_dining", "coffee_shops"],
  "minimumRating": 4.0,
  "limit": 20
}

### Search All Categories
POST {{baseUrl}}/api/places/search
Content-Type: application/json

{
  "viewportBounds": {
    "north": 40.7589,
    "south": 40.7489,
    "east": -73.9789,
    "west": -73.9889
  },
  "categories": [],
  "minimumRating": null,
  "limit": 50
}
```

#### Bruno Collection

**File:** `bruno/MapInsights.Api - v1/PlacesEndpoints/SearchPlaces.bru`

Update request body with categories parameter and add examples for different traveler scenarios.

---

## Verification

### 1. Automated Testing

```bash
# Backend
cd src/backend
dotnet test

# Frontend  
cd src/frontend
npm test
npm run type-check
```

### 2. E2E Testing with Playwright

#### Prerequisites
```bash
# Start backend (terminal 1)
cd src/backend/src/MapInsights.Api
dotnet run

# Start frontend (terminal 2)
cd src/frontend
npm run dev
```

#### Test Scenario Files

Create and execute these test scenarios using playwright-cli skill:

**Test 1: Single Category Selection**
- File: `tests/e2e/category-filter-single-selection.test.md`
- Navigate to app
- Click "Food & Dining" category
- Verify results contain restaurants, cafes, bars
- Verify category button shows selected state
- Verify network request includes `"categories": ["food_dining"]`

**Test 2: Multiple Category Selection**
- File: `tests/e2e/category-filter-multiple-selection.test.md`
- Navigate to app
- Click "Food & Dining" + "Coffee Shops"
- Verify both buttons selected
- Verify results include combined place types
- Verify network request includes both categories

**Test 3: All Categories (No Filter)**
- File: `tests/e2e/category-filter-all-categories.test.md`
- Navigate to app
- Verify no categories selected initially
- Verify diverse place types in results
- Verify network request includes empty/null categories

**Test 4: Category Filter Reset**
- File: `tests/e2e/category-filter-reset.test.md`
- Select "Attractions & Culture"
- Click "Reset" or "All Categories" button
- Verify all categories return to unselected state
- Verify results show all place types

**Test 5: Rectangle Search Verification**
- File: `tests/e2e/rectangle-search-verification.test.md`
- Navigate to app
- Pan/zoom map to change viewport
- Select any category
- Check backend logs for rectangle searches (not radius)
- Verify logs show N/S/E/W bounds with included types

**Test 6: Network Request Validation**
- File: `tests/e2e/network-request-categories.test.md`
- Open DevTools Network tab
- Select "Nature & Parks"
- Inspect POST request to `/api/places/search`
- Verify payload contains `"categories": ["nature_parks"]`
- Verify response includes parks, natural features

#### Execute Tests
```bash
# Use playwright-cli skill to run each scenario
playwright-cli test tests/e2e/category-filter-single-selection.test.md
playwright-cli test tests/e2e/category-filter-multiple-selection.test.md
playwright-cli test tests/e2e/category-filter-all-categories.test.md
playwright-cli test tests/e2e/category-filter-reset.test.md
playwright-cli test tests/e2e/rectangle-search-verification.test.md
playwright-cli test tests/e2e/network-request-categories.test.md
```

#### Post-E2E Validation
- Review screenshots from all test reports
- Verify backend logs show rectangle searches with type filtering
- Confirm no API errors in browser console
- Validate category mappings produce correct results
- Check performance improvement (fewer irrelevant results)

### 3. Manual Testing

User performs manual validation of:
- User experience with category selection UI
- Visual feedback and responsiveness
- Edge cases and exploratory scenarios
- Cross-browser compatibility
- Mobile responsiveness of category filters
- Category button styling and interactions

---

## Success Criteria

✅ All 10 categories display in UI with proper labels and icons  
✅ Multiple category selection works correctly  
✅ Empty selection shows all place types  
✅ Backend expands categories to ~40-50 Google API types  
✅ GooglePlacesNew API uses rectangle searches  
✅ Type filtering happens at API level (not post-fetch)  
✅ All automated tests pass  
✅ E2E tests verify end-to-end functionality  
✅ Backend logs confirm rectangle searches with included types  
✅ API documentation updated with category examples  
✅ No breaking changes unaccounted for  

---

## Rollback Plan

If issues arise:

1. **Frontend rollback:** Revert changes to:
   - `src/frontend/src/types/places.ts`
   - `src/frontend/src/store/placesStore.ts`
   - `src/frontend/src/components/Map/PlaceCategorySelect.tsx`
   - Restore `PlaceTypeSelect.tsx`

2. **Backend rollback:** Revert changes to:
   - `src/backend/src/MapInsights.Infrastructure/Places/GooglePlacesService.cs`
   - `src/backend/src/MapInsights.Api/Features/Places/` validation and mapping

3. **API contract:** Revert API request model to use `placeTypes` instead of `categories`

---

## Notes

- **No NuGet package changes required** - GoogleApi package already includes GooglePlacesNew
- **Breaking change:** API parameter renamed from `placeTypes` to `categories`
- **Performance improvement:** Rectangle searches + pre-filtering reduce API quota usage
- **UX improvement:** 10 simple categories map to comprehensive type coverage
- **Maintainability:** Category mappings are centralized and documented
- **Scalability:** Easy to add new categories or adjust type mappings

---

## Category → Google Types Reference

| Category | Google Places API Types |
|----------|------------------------|
| Food & Dining | restaurant, cafe, bar, bakery, meal_takeaway |
| Coffee Shops | cafe, coffee_shop |
| Groceries & Essentials | supermarket, grocery_store, convenience_store |
| Attractions & Culture | tourist_attraction, museum, art_gallery, landmark, point_of_interest, aquarium, zoo |
| Shopping | shopping_mall, store, clothing_store, department_store |
| Nature & Parks | park, natural_feature, campground |
| Healthcare | pharmacy, hospital, doctor |
| Services | atm, bank, post_office, laundry |
| Transportation | gas_station, parking, transit_station, bus_station, train_station |
| Nightlife & Entertainment | night_club, bar, casino, movie_theater |
