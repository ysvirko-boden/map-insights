namespace MapInsights.Core.Places
{
    public class PlaceSearchResult
    {
        public List<PlaceDetails> Places { get; init; } = [];
        public int TotalCount { get; init; }
    }
}
