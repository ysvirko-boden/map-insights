namespace MapInsights.Core.Places
{
    public class PlaceDetails
    {
        public required string PlaceId { get; init; }
        public required string Name { get; init; }
        public required string Type { get; init; }
        public double? Rating { get; init; }
        public int? UserRatingsTotal { get; init; }
        public string? FormattedAddress { get; init; }
        public string? FormattedPhoneNumber { get; init; }
        public OpeningHours? OpeningHours { get; init; }
        public required Location Location { get; init; }
    }

    public class Location
    {
        public required double Lat { get; init; }
        public required double Lng { get; init; }
    }

    public class OpeningHours
    {
        public bool? OpenNow { get; init; }
        public List<string>? WeekdayText { get; init; }
    }
}
