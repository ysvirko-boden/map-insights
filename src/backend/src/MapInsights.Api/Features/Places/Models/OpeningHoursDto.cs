namespace MapInsights.Api.Features.Places.Models
{
    public class OpeningHoursDto
    {
        public bool? OpenNow { get; init; }
        public List<string>? WeekdayText { get; init; }
    }
}
