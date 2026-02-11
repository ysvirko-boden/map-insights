# Implementation Plan: Fix Places List View Issues

## Issues Summary

### Issue 1: Missing Places on Zoom Out
Google Places API doesn't return places for large areas. Solution: divide area into smaller grid cells and aggregate results.

### Issue 2: Sort by Review Count
Places should be ordered by highest review count (UserRatingsTotal descending).

---

## Implementation Strategy

### Phase 1: Configuration Setup

#### 1.1 Update GoogleMapsOptions (Infrastructure)
**File**: `MapInsights.Infrastructure/Places/GoogleMapsOptions.cs`

Add configuration properties:
```csharp
public class GoogleMapsOptions
{
    public required string ApiKey { get; set; }
    public int MaxParallelRequests { get; set; } = 10;
    public double GridCellSizeInDegrees { get; set; } = 0.005;
}
```

**Rationale**:
- `MaxParallelRequests`: Controls API throttling and prevents rate limit issues
- `GridCellSizeInDegrees`: Defines grid cell size (~0.005° ≈ 0.5km) to ensure comprehensive coverage

#### 1.2 Update appsettings.json
**File**: `MapInsights.Api/appsettings.json`

```json
{
  "GoogleMapsOptions": {
    "ApiKey": "",
    "MaxParallelRequests": 10,
    "GridCellSizeInDegrees": 0.005
  }
}
```

---

### Phase 2: Core Layer - Domain Logic

#### 2.1 Create Grid Cell Model (Core)
**File**: `MapInsights.Core/Places/GridCell.cs`

```csharp
namespace MapInsights.Core.Places
{
    public class GridCell
    {
        public required ViewportBounds Bounds { get; init; }
        public int RowIndex { get; init; }
        public int ColumnIndex { get; init; }
    }
}
```

#### 2.2 Create Grid Division Service Interface (Core)
**File**: `MapInsights.Core/Places/IGridDivisionService.cs`

```csharp
namespace MapInsights.Core.Places
{
    public interface IGridDivisionService
    {
        List<GridCell> DivideIntoGrid(ViewportBounds bounds, double cellSizeInDegrees);
    }
}
```

**Responsibility**: Calculate grid cells from viewport bounds.

---

### Phase 3: Infrastructure Layer - Grid Division Implementation

#### 3.1 Implement Grid Division Service (Infrastructure)
**File**: `MapInsights.Infrastructure/Places/GridDivisionService.cs`

```csharp
namespace MapInsights.Infrastructure.Places
{
    public class GridDivisionService : IGridDivisionService
    {
        public List<GridCell> DivideIntoGrid(ViewportBounds bounds, double cellSizeInDegrees)
        {
            var cells = new List<GridCell>();
            
            var rows = (int)Math.Ceiling((bounds.North - bounds.South) / cellSizeInDegrees);
            var columns = (int)Math.Ceiling((bounds.East - bounds.West) / cellSizeInDegrees);
            
            for (var row = 0; row < rows; row++)
            {
                for (var col = 0; col < columns; col++)
                {
                    var south = bounds.South + (row * cellSizeInDegrees);
                    var north = Math.Min(south + cellSizeInDegrees, bounds.North);
                    var west = bounds.West + (col * cellSizeInDegrees);
                    var east = Math.Min(west + cellSizeInDegrees, bounds.East);
                    
                    cells.Add(new GridCell
                    {
                        Bounds = new ViewportBounds
                        {
                            North = north,
                            South = south,
                            East = east,
                            West = west
                        },
                        RowIndex = row,
                        ColumnIndex = col
                    });
                }
            }
            
            return cells;
        }
    }
}
```

**Logic**:
- Calculate number of rows/columns needed
- Create grid cells with proper bounds
- Ensure cells don't exceed original bounds

---

### Phase 4: Infrastructure Layer - Update GooglePlacesService

#### 4.1 Refactor GooglePlacesService
**File**: `MapInsights.Infrastructure/Places/GooglePlacesService.cs`

**Changes Required**:

1. **Add IGridDivisionService dependency**:
```csharp
public class GooglePlacesService(
    IOptions<GoogleMapsOptions> options,
    IGridDivisionService gridDivisionService,
    ILogger<GooglePlacesService> logger) : IPlacesService
```

2. **Update SearchPlacesAsync method**:
```csharp
public async Task<PlaceSearchResult> SearchPlacesAsync(
    PlaceSearchCriteria criteria,
    CancellationToken cancellationToken)
{
    var gridCells = _gridDivisionService.DivideIntoGrid(
        criteria.Bounds, 
        _options.GridCellSizeInDegrees);
    
    _logger.LogInformation(
        "Divided search area into {CellCount} grid cells", 
        gridCells.Count);
    
    var allPlaces = new List<PlaceDetails>();
    var semaphore = new SemaphoreSlim(_options.MaxParallelRequests);
    
    var tasks = gridCells.Select(async cell =>
    {
        await semaphore.WaitAsync(cancellationToken);
        try
        {
            return await SearchSingleCellAsync(cell.Bounds, criteria, cancellationToken);
        }
        finally
        {
            semaphore.Release();
        }
    });
    
    var results = await Task.WhenAll(tasks);
    allPlaces.AddRange(results.SelectMany(r => r));
    
    var uniquePlaces = DeduplicatePlaces(allPlaces);
    var sortedPlaces = SortByReviewCount(uniquePlaces);
    var topPlaces = sortedPlaces.Take(criteria.MaxResults).ToList();
    
    _logger.LogInformation(
        "Found {TotalPlaces} unique places, returning top {RequestedCount} by review count",
        uniquePlaces.Count,
        criteria.MaxResults);
    
    return new PlaceSearchResult
    {
        Places = topPlaces,
        TotalCount = uniquePlaces.Count
    };
}
```

3. **Add SearchSingleCellAsync method** (extracted from current SearchPlacesAsync):
```csharp
private async Task<List<PlaceDetails>> SearchSingleCellAsync(
    ViewportBounds bounds,
    PlaceSearchCriteria criteria,
    CancellationToken cancellationToken)
{
    // Current search logic
    var centerLat = (bounds.North + bounds.South) / 2;
    var centerLng = (bounds.East + bounds.West) / 2;
    var radius = CalculateRadius(bounds);
    
    var request = new PlacesNearBySearchRequest
    {
        Key = _options.ApiKey,
        Location = new Coordinate(centerLat, centerLng),
        Radius = radius
    };
    
    var response = await GooglePlaces.Search.NearBySearch.QueryAsync(request, cancellationToken);
    
    if (response.Status != Status.Ok)
    {
        _logger.LogWarning(
            "Google Places API returned status: {Status} for cell N:{North} S:{South}",
            response.Status,
            bounds.North,
            bounds.South);
        return [];
    }
    
    return response.Results
        .Where(p => MatchesCriteria(p, criteria))
        .Select(MapToPlaceDetails)
        .ToList();
}
```

4. **Add DeduplicatePlaces method**:
```csharp
private static List<PlaceDetails> DeduplicatePlaces(List<PlaceDetails> places)
{
    return places
        .GroupBy(p => p.PlaceId)
        .Select(g => g.First())
        .ToList();
}
```

5. **Add SortByReviewCount method**:
```csharp
private static List<PlaceDetails> SortByReviewCount(List<PlaceDetails> places)
{
    return places
        .OrderByDescending(p => p.UserRatingsTotal ?? 0)
        .ThenByDescending(p => p.Rating ?? 0)
        .ToList();
}
```

**Key Design Decisions**:
- **SemaphoreSlim**: Throttles parallel requests to respect `MaxParallelRequests`
- **Deduplication**: Uses PlaceId to remove duplicates (same place in multiple cells)
- **Sorting**: Primary by UserRatingsTotal (review count), secondary by Rating
- **Error Handling**: Individual cell failures don't stop entire search; they return empty lists

---

### Phase 5: Update Dependency Injection

#### 5.1 Update DependencyInjection.cs
**File**: `MapInsights.Infrastructure/Places/DependencyInjection.cs`

Add GridDivisionService registration:
```csharp
public static IServiceCollection AddPlacesService(
    this IServiceCollection services,
    IConfiguration configuration)
{
    services.Configure<GoogleMapsOptions>(
        configuration.GetSection(nameof(GoogleMapsOptions)));
    
    services.AddScoped<IGridDivisionService, GridDivisionService>();
    services.AddScoped<IPlacesService, GooglePlacesService>();
    
    return services;
}
```

---

### Phase 6: Testing Strategy

#### 6.1 Unit Tests for GridDivisionService
**File**: `MapInsights.Infrastructure.Tests.Unit/Places/GridDivisionServiceTests.cs`

Test cases:
- Small area (1 cell)
- Medium area (4 cells in 2x2 grid)
- Large area (multiple cells)
- Edge case: Exact multiple of cell size
- Boundary validation

#### 6.2 Unit Tests for GooglePlacesService
**File**: `MapInsights.Infrastructure.Tests.Unit/Places/GooglePlacesServiceTests.cs`

Test cases:
- Deduplication logic
- Sorting by review count
- Sorting with null UserRatingsTotal
- Parallel request throttling
- Empty results handling

#### 6.3 Integration Tests
**File**: `MapInsights.Api.Tests.Integration/Features/Places/SearchEndpointTests.cs`

Test scenarios:
- Search large area returns results
- Results are sorted by review count
- MaxResults limit is respected
- Duplicate places are removed

---

## Implementation Order

1. **Configuration** (Phase 1)
   - Update GoogleMapsOptions
   - Update appsettings.json

2. **Core Domain** (Phase 2)
   - Create GridCell model
   - Create IGridDivisionService interface

3. **Infrastructure** (Phase 3)
   - Implement GridDivisionService
   - Write unit tests for GridDivisionService

4. **Service Update** (Phase 4)
   - Refactor GooglePlacesService
   - Add grid-based search logic
   - Add sorting and deduplication
   - Write unit tests

5. **Dependency Injection** (Phase 5)
   - Update DI registration

6. **Integration Testing** (Phase 6)
   - Run all tests
   - Validate end-to-end behavior

7. **Final Validation**
   - Run `dotnet test` in src/backend
   - Verify frontend interaction

---

## Expected Outcomes

### Issue 1 Resolution
- Large areas divided into manageable grid cells
- Multiple API calls made in parallel (max 10)
- All available places retrieved
- No empty results on zoom out

### Issue 2 Resolution
- Places sorted by UserRatingsTotal (descending)
- Secondary sort by Rating (descending)
- Most reviewed places appear first
- Limit respected (top N by review count)

### Performance Considerations
- Grid cell size of 0.005° balances coverage vs API calls
- MaxParallelRequests of 10 prevents rate limiting
- SemaphoreSlim ensures controlled concurrency
- Deduplication minimizes redundant data

### Configuration Flexibility
- Grid cell size adjustable via appsettings.json
- Parallel request limit configurable
- Easy to tune based on API limits and performance needs
