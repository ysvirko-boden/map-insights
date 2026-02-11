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
        [PlaceCategory.FoodDining] = ["restaurant", "cafe", "bar", "bakery", "meal_takeaway"],
        [PlaceCategory.CoffeeShops] = ["cafe", "coffee_shop"],
        [PlaceCategory.Groceries] = ["supermarket", "grocery_store", "convenience_store"],
        [PlaceCategory.Attractions] = ["tourist_attraction", "museum", "art_gallery", "landmark", "point_of_interest", "aquarium", "zoo", "amusement_park", "beach"],
        [PlaceCategory.Shopping] = ["shopping_mall", "store", "clothing_store", "department_store"],
        [PlaceCategory.NatureParks] = ["park", "natural_feature", "campground", "beach"],
        [PlaceCategory.Healthcare] = ["pharmacy", "hospital", "doctor"],
        [PlaceCategory.Services] = ["atm", "bank", "post_office", "laundry"],
        [PlaceCategory.Transportation] = ["gas_station", "parking", "transit_station", "bus_station", "train_station"],
        [PlaceCategory.Nightlife] = ["night_club", "bar", "casino", "movie_theater"]
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
    /// Parses a category string to PlaceCategory enum (case-insensitive, handles underscore_case)
    /// </summary>
    public static PlaceCategory? ParseCategory(string categoryString)
    {
        if (string.IsNullOrWhiteSpace(categoryString))
            return null;

        // Try direct parsing first (handles PascalCase)
        if (Enum.TryParse<PlaceCategory>(categoryString, ignoreCase: true, out var category))
            return category;

        // Convert underscore_case to PascalCase (e.g., "food_dining" -> "FoodDining")
        var pascalCase = string.Join("", categoryString.Split('_')
            .Select(word => char.ToUpperInvariant(word[0]) + word.Substring(1).ToLowerInvariant()));

        return Enum.TryParse<PlaceCategory>(pascalCase, ignoreCase: false, out category)
            ? category
            : null;
    }
}
