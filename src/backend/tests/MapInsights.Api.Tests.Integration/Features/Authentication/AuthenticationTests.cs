using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using MapInsights.Api.Features.Places.Models;
using Microsoft.AspNetCore.Mvc.Testing;

namespace MapInsights.Api.Tests.Integration.Features.Authentication;

public class AuthenticationTests(WebApplicationFactory<Program> factory) 
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task HealthEndpoint_WithoutAuthentication_ReturnsOk()
    {
        // Act
        var response = await _client.GetAsync("/api/health");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task PlacesSearchEndpoint_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var request = new PlaceSearchRequest
        {
            Center = new() { Lat = 40.7128, Lng = -74.0060 },
            Radius = 5000,
            Limit = 10
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/places/search", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task PlacesSearchEndpoint_WithInvalidToken_ReturnsUnauthorized()
    {
        // Arrange
        var request = new PlaceSearchRequest
        {
            Center = new() { Lat = 40.7128, Lng = -74.0060 },
            Radius = 5000,
            Limit = 10
        };

        _client.DefaultRequestHeaders.Add("Authorization", "Bearer invalid_token_12345");

        // Act
        var response = await _client.PostAsJsonAsync("/api/places/search", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task PlacesSearchEndpoint_WithMalformedAuthHeader_ReturnsUnauthorized()
    {
        // Arrange
        var request = new PlaceSearchRequest
        {
            Center = new() { Lat = 40.7128, Lng = -74.0060 },
            Radius = 5000,
            Limit = 10
        };

        _client.DefaultRequestHeaders.Add("Authorization", "InvalidFormat");

        // Act
        var response = await _client.PostAsJsonAsync("/api/places/search", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task PlacesSearchEndpoint_WithoutAuthorizationHeader_ReturnsUnauthorized()
    {
        // Arrange
        var request = new PlaceSearchRequest
        {
            Center = new() { Lat = 40.7128, Lng = -74.0060 },
            Radius = 5000,
            Limit = 10
        };

        // Ensure no Authorization header
        _client.DefaultRequestHeaders.Remove("Authorization");

        // Act
        var response = await _client.PostAsJsonAsync("/api/places/search", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
