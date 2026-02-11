namespace MapInsights.Core.Places;

public class PlaceSearchCriteria
{
    public required ViewportBounds Bounds { get; init; }
    
    /// <summary>
    /// Google Places API type identifiers (expanded from categories)
    /// </summary>
    public List<string>? Types { get; init; }
    
    /// <summary>
    /// User-selected high-level categories (for reference)
    /// </summary>
    public List<PlaceCategory>? Categories { get; init; }
    
    public double? MinRating { get; init; }
    public int MaxResults { get; init; }
}

public class ViewportBounds
{
    public required double North { get; init; }
    public required double South { get; init; }
    public required double East { get; init; }
    public required double West { get; init; }
}
