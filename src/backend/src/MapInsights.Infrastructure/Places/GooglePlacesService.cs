using GoogleApi;
using GoogleApi.Entities.Common;
using GoogleApi.Entities.Common.Enums;
using GoogleApi.Entities.PlacesNew.Search.NearBy.Request;
using GoogleApi.Entities.PlacesNew.Search.NearBy.Response;
using GoogleApi.Entities.PlacesNew.Common;
using GoogleApi.Entities.PlacesNew.Common.Enums;
using MapInsights.Core.Places;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MapInsights.Infrastructure.Places;

public class GooglePlacesService(
    IOptions<GoogleMapsOptions> options,
    IGridDivisionService gridDivisionService,
    IMemoryCache memoryCache,
    ILogger<GooglePlacesService> logger) : IPlacesService
{
    private readonly GoogleMapsOptions _options = options.Value;
    private readonly IGridDivisionService _gridDivisionService = gridDivisionService;
    private readonly IMemoryCache _memoryCache = memoryCache;
    private readonly ILogger<GooglePlacesService> _logger = logger;

    public async Task<PlaceSearchResult> SearchPlacesAsync(
        PlaceSearchCriteria criteria,
        CancellationToken cancellationToken)
    {
        // Generate cache key based on search criteria
        var cacheKey = GenerateCacheKey(criteria);

        // Try to get cached result
        if (_memoryCache.TryGetValue<PlaceSearchResult>(cacheKey, out var cachedResult))
        {
            _logger.LogInformation(
                "Cache hit for search criteria (bounds N:{North} S:{South} E:{East} W:{West})",
                criteria.Bounds.North,
                criteria.Bounds.South,
                criteria.Bounds.East,
                criteria.Bounds.West);
            return cachedResult!;
        }

        _logger.LogInformation(
            "Cache miss - executing search for criteria (bounds N:{North} S:{South} E:{East} W:{West})",
            criteria.Bounds.North,
            criteria.Bounds.South,
            criteria.Bounds.East,
            criteria.Bounds.West);

        try
        {
            var cellSize = CalculateOptimalCellSize(criteria.Bounds);

            var gridCells = _gridDivisionService.DivideIntoGrid(
                criteria.Bounds,
                cellSize);

            _logger.LogInformation(
                "Divided search area into {CellCount} grid cells (bounds N:{North} S:{South} E:{East} W:{West}, cell size: {CellSize}°)",
                gridCells.Count,
                criteria.Bounds.North,
                criteria.Bounds.South,
                criteria.Bounds.East,
                criteria.Bounds.West,
                cellSize);

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

            var result = new PlaceSearchResult
            {
                Places = topPlaces,
                TotalCount = uniquePlaces.Count
            };

            // Cache the result for 5 minutes
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
                SlidingExpiration = TimeSpan.FromMinutes(2)
            };
            _memoryCache.Set(cacheKey, result, cacheOptions);

            _logger.LogInformation("Cached search result with key: {CacheKey}", cacheKey);

            return result;
        }
        catch (Exception ex) when (ex is not PlacesServiceException)
        {
            _logger.LogError(ex, "Error searching places");
            throw new PlacesServiceException("Failed to search places", ex);
        }
    }

    private async Task<List<PlaceDetails>> SearchSingleCellAsync(
        Core.Places.ViewportBounds bounds,
        PlaceSearchCriteria criteria,
        CancellationToken cancellationToken)
    {
        try
        {
            var centerLat = (bounds.North + bounds.South) / 2;
            var centerLng = (bounds.East + bounds.West) / 2;
            var radius = CalculateRadius(bounds);

            var request = new PlacesNewNearBySearchRequest
            {
                Key = _options.ApiKey,
                LocationRestriction = new WithinCirle
                {
                    Circle = new Circle
                    {
                        Center = new LatLng
                        {
                            Latitude = centerLat,
                            Longitude = centerLng
                        },
                        Radius = (int)radius
                    }
                },
                MaxResultCount = 20 // Google Places API v1 limit
            };

            // Add type filtering at API level (API-level filtering as requested)
            if (criteria.Types?.Count > 0)
            {                var includedTypes = ConvertToPlaceLocationTypes(criteria.Types);
                request.IncludedTypes = includedTypes;
            }

            var response = await GooglePlacesNew.Search.NearBySearch.QueryAsync(request, cancellationToken);

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

            return response.Places
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

    private static List<PlaceDetails> DeduplicatePlaces(List<PlaceDetails> places)
    {
        return places
            .GroupBy(p => p.PlaceId)
            .Select(g => g.First())
            .ToList();
    }

    private static List<PlaceDetails> SortByReviewCount(List<PlaceDetails> places)
    {
        return places
            .OrderByDescending(p => p.UserRatingsTotal ?? 0)
            .ThenByDescending(p => p.Rating ?? 0)
            .ToList();
    }

    private double CalculateOptimalCellSize(Core.Places.ViewportBounds bounds)
    {
        var latDiff = bounds.North - bounds.South;
        var lngDiff = bounds.East - bounds.West;

        var configuredCellSize = _options.GridCellSizeInDegrees;

        var rows = (int)Math.Ceiling(latDiff / configuredCellSize);
        var columns = (int)Math.Ceiling(lngDiff / configuredCellSize);
        var totalCells = rows * columns;

        if (totalCells <= _options.MaxGridCells)
        {
            return configuredCellSize;
        }

        var targetDimension = Math.Sqrt(_options.MaxGridCells);
        var cellSizeFromLat = latDiff / targetDimension;
        var cellSizeFromLng = lngDiff / targetDimension;

        var adjustedCellSize = Math.Max(cellSizeFromLat, cellSizeFromLng);

        _logger.LogInformation(
            "Adjusted cell size from {ConfiguredSize}° to {AdjustedSize}° to limit grid to ~{MaxCells} cells (area: {LatDiff}° x {LngDiff}°)",
            configuredCellSize,
            adjustedCellSize,
            _options.MaxGridCells,
            latDiff,
            lngDiff);

        return adjustedCellSize;
    }

    private static double CalculateRadius(Core.Places.ViewportBounds bounds)
    {
        var latDiff = Math.Abs(bounds.North - bounds.South);
        var lngDiff = Math.Abs(bounds.East - bounds.West);
        var maxDiff = Math.Max(latDiff, lngDiff);
        return maxDiff * 111000 / 2;
    }

    /// <summary>
    /// Converts string types to PlaceLocationTypeA enum values
    /// </summary>
    private static List<PlaceLocationTypeA> ConvertToPlaceLocationTypes(List<string> types)
    {
        var result = new List<PlaceLocationTypeA>();
        var typeMapping = GetTypeMappings();

        foreach (var type in types)
        {
            if (typeMapping.TryGetValue(type.ToLowerInvariant(), out var enumValue))
            {
                result.Add(enumValue);
            }
        }

        return result.Distinct().ToList();
    }

    /// <summary>
    /// Maps string type names to PlaceLocationTypeA enum values
    /// </summary>
    private static Dictionary<string, PlaceLocationTypeA> GetTypeMappings()
    {
        return new Dictionary<string, PlaceLocationTypeA>(StringComparer.OrdinalIgnoreCase)
        {
            // Food & Dining
            ["restaurant"] = PlaceLocationTypeA.Restaurant,
            ["cafe"] = PlaceLocationTypeA.Cafe,
            ["bar"] = PlaceLocationTypeA.Bar,
            ["bakery"] = PlaceLocationTypeA.Bakery,
            ["meal_takeaway"] = PlaceLocationTypeA.MealTakeaway,
            
            // Coffee Shops
            ["coffee_shop"] = PlaceLocationTypeA.CoffeeShop,
            
            // Groceries
            ["supermarket"] = PlaceLocationTypeA.Supermarket,
            ["grocery_store"] = PlaceLocationTypeA.GroceryStore,
            ["convenience_store"] = PlaceLocationTypeA.ConvenienceStore,
            
            // Attractions
            ["tourist_attraction"] = PlaceLocationTypeA.TouristAttraction,
            ["museum"] = PlaceLocationTypeA.Museum,
            ["art_gallery"] = PlaceLocationTypeA.ArtGallery,
            ["landmark"] = PlaceLocationTypeA.HistoricalLandmark,
            ["point_of_interest"] = PlaceLocationTypeA.TouristAttraction,
            ["aquarium"] = PlaceLocationTypeA.Aquarium,
            ["zoo"] = PlaceLocationTypeA.Zoo,
            ["amusement_park"] = PlaceLocationTypeA.AmusementPark,
            
            // Shopping
            ["shopping_mall"] = PlaceLocationTypeA.ShoppingMall,
            ["store"] = PlaceLocationTypeA.Store,
            ["clothing_store"] = PlaceLocationTypeA.ClothingStore,
            ["department_store"] = PlaceLocationTypeA.DepartmentStore,
            
            // Nature & Parks
            ["park"] = PlaceLocationTypeA.Park,
            ["natural_feature"] = PlaceLocationTypeA.NationalPark,
            ["campground"] = PlaceLocationTypeA.Campground,
            ["beach"] = PlaceLocationTypeA.Beach,
            
            // Healthcare
            ["pharmacy"] = PlaceLocationTypeA.Pharmacy,
            ["hospital"] = PlaceLocationTypeA.Hospital,
            ["doctor"] = PlaceLocationTypeA.Doctor,
            
            // Services
            ["atm"] = PlaceLocationTypeA.ATM,
            ["bank"] = PlaceLocationTypeA.Bank,
            ["post_office"] = PlaceLocationTypeA.PostOffice,
            ["laundry"] = PlaceLocationTypeA.Laundry,
            
            // Transportation
            ["gas_station"] = PlaceLocationTypeA.GasStation,
            ["parking"] = PlaceLocationTypeA.Parking,
            ["transit_station"] = PlaceLocationTypeA.TransitStation,
            ["bus_station"] = PlaceLocationTypeA.BusStation,
            ["train_station"] = PlaceLocationTypeA.TrainStation,
            
            // Nightlife
            ["night_club"] = PlaceLocationTypeA.NightClub,
            ["casino"] = PlaceLocationTypeA.Casino,
            ["movie_theater"] = PlaceLocationTypeA.MovieTheater
        };
    }

    private static bool MatchesCriteria(
        Place place,
        PlaceSearchCriteria criteria)
    {
        // Type filtering now handled by API via IncludedTypes
        // Only apply rating filter here
        
        if (criteria.MinRating.HasValue)
        {
            if (!place.Rating.HasValue || (double)place.Rating.Value < criteria.MinRating.Value)
            {
                return false;
            }
        }

        return true;
    }

    private static PlaceDetails MapToPlaceDetails(Place place)
    {
        var firstType = place.Types?.FirstOrDefault();
        var primaryType = firstType?.ToString().ToLowerInvariant() ?? "unknown";

        return new PlaceDetails
        {
            PlaceId = place.Id ?? string.Empty,
            Name = place.DisplayName?.Text ?? "Unnamed",
            Type = primaryType,
            Rating = (double?)place.Rating,
            UserRatingsTotal = place.UserRatingCount,
            FormattedAddress = place.FormattedAddress ?? place.ShortFormattedAddress,
            FormattedPhoneNumber = place.NationalPhoneNumber ?? place.InternationalPhoneNumber,
            OpeningHours = place.CurrentOpeningHours != null || place.RegularOpeningHours != null
                ? new Core.Places.OpeningHours
                {
                    OpenNow = place.CurrentOpeningHours?.OpenNow ?? place.RegularOpeningHours?.OpenNow,
                    WeekdayText = place.RegularOpeningHours?.WeekdayDescriptions?.ToList()
                }
                : null,
            Location = new Core.Places.Location
            {
                Lat = place.Location.Latitude,
                Lng = place.Location.Longitude
            }
        };
    }

    /// <summary>
    /// Generates a cache key based on search criteria
    /// </summary>
    private static string GenerateCacheKey(PlaceSearchCriteria criteria)
    {
        var typesKey = criteria.Types != null && criteria.Types.Count > 0
            ? string.Join(",", criteria.Types.OrderBy(t => t))
            : "all";

        var ratingKey = criteria.MinRating?.ToString("F1") ?? "any";

        // Round coordinates to 4 decimal places (~11 meters precision) for better cache hits
        var north = Math.Round(criteria.Bounds.North, 4);
        var south = Math.Round(criteria.Bounds.South, 4);
        var east = Math.Round(criteria.Bounds.East, 4);
        var west = Math.Round(criteria.Bounds.West, 4);

        return $"places:n{north}:s{south}:e{east}:w{west}:t{typesKey}:r{ratingKey}:max{criteria.MaxResults}";
    }
}

public class PlacesServiceException : Exception
{
    public PlacesServiceException(string message) : base(message)
    {
    }

    public PlacesServiceException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
