namespace MapInsights.Api.Features.Places.Models
{
    public class PlaceDetailsDto
    {
        public required string PlaceId { get; init; }
        public required string Name { get; init; }
        public required string Type { get; init; }
        public double? Rating { get; init; }
        public int? UserRatingsTotal { get; init; }
        public string? FormattedAddress { get; init; }
        public string? FormattedPhoneNumber { get; init; }
        public OpeningHoursDto? OpeningHours { get; init; }
        public required LocationDto Location { get; init; }
    }

    public class LocationDto
    {
        public required double Lat { get; init; }
        public required double Lng { get; init; }
    }
}
