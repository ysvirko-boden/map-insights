namespace MapInsights.Api.Features.Places.Models
{
    public class PlaceSearchResponse
    {
        public List<PlaceDetailsDto> Places { get; init; } = [];
        public int TotalCount { get; init; }
    }
}
