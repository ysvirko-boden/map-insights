namespace MapInsights.Api.Features.Health.Models
{
    public class HealthCheckResponse
    {
        public string Status { get; set; } = "Healthy";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
