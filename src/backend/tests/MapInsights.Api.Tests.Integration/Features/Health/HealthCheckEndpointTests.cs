using System.Net;
using System.Net.Http.Json;
using MapInsights.Api.Features.Health.Models;

namespace MapInsights.Api.Tests.Integration.Features.Health
{
    public class HealthCheckEndpointTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;

        public HealthCheckEndpointTests(WebApplicationFactory<Program> factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task HealthCheckEndpoint_ReturnsOkStatus()
        {
            // arrange
            const string endpoint = "/api/health";

            // act
            var response = await _client.GetAsync(endpoint);

            // assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }

        [Fact]
        public async Task HealthCheckEndpoint_ReturnsHealthyStatus()
        {
            // arrange
            const string endpoint = "/api/health";

            // act
            var response = await _client.GetFromJsonAsync<HealthCheckResponse>(endpoint);

            // assert
            response.Should().NotBeNull();
            response!.Status.Should().Be("Healthy");
        }

        [Fact]
        public async Task HealthCheckEndpoint_ReturnsUtcTimestamp()
        {
            // arrange
            const string endpoint = "/api/health";
            var before = DateTime.UtcNow;

            // act
            var response = await _client.GetFromJsonAsync<HealthCheckResponse>(endpoint);
            var after = DateTime.UtcNow;

            // assert
            response.Should().NotBeNull();
            response!.Timestamp.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
        }
    }
}
