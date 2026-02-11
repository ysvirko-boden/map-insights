namespace MapInsights.Api.Features.Places.Models;

/// <summary>
/// Request model for place search with high-level category filtering
/// </summary>
public class PlaceSearchRequest
{
    public required ViewportBounds ViewportBounds { get; init; }
    
    /// <summary>
    /// High-level category filters (e.g., "food_dining", "coffee_shops").
    /// Leave empty for all place types.
    /// </summary>
    public List<string>? Categories { get; init; }
    
    public double? MinimumRating { get; init; }
    public int Limit { get; init; } = 30;
}

public class ViewportBounds
{
    public required double North { get; init; }
    public required double South { get; init; }
    public required double East { get; init; }
    public required double West { get; init; }
}
