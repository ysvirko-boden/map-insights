using MapInsights.Api.Features.Health.Models;

namespace MapInsights.Api.Features.Health
{
    public static class HealthEndpoints
    {
        public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/health", () =>
            {
                return new HealthCheckResponse
                {
                    Status = "Healthy",
                    Timestamp = DateTime.UtcNow
                };
            })
            .WithName("HealthCheck");

            return endpoints;
        }
    }
}
