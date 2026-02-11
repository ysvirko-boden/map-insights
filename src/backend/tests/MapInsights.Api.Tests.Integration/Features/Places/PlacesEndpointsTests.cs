using System.Net;
using System.Net.Http.Json;
using MapInsights.Api.Features.Places.Models;
using MapInsights.Core.Places;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using ApiModels = MapInsights.Api.Features.Places.Models;

namespace MapInsights.Api.Tests.Integration.Features.Places
{
    public class PlacesEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public PlacesEndpointsTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task SearchPlaces_ValidRequest_ReturnsOkWithPlaces()
        {
            // arrange
            var mockService = new Mock<IPlacesService>();
            var expectedResult = new PlaceSearchResult
            {
                Places =
                [
                    new PlaceDetails
                    {
                        PlaceId = "place1",
                        Name = "Test Restaurant",
                        Type = "restaurant",
                        Rating = 4.5,
                        Location = new Core.Places.Location { Lat = 40.7128, Lng = -74.0060 }
                    }
                ],
                TotalCount = 1
            };

            mockService
                .Setup(s => s.SearchPlacesAsync(It.IsAny<PlaceSearchCriteria>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expectedResult);

            var client = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IPlacesService));
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }
                    services.AddScoped(_ => mockService.Object);
                });
            }).CreateClient();

            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ApiModels.ViewportBounds
                {
                    North = 40.8,
                    South = 40.6,
                    East = -73.9,
                    West = -74.1
                },
                Limit = 30
            };

            // act
            var response = await client.PostAsJsonAsync("/api/places/search", request);

            // assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<PlaceSearchResponse>();
            result.Should().NotBeNull();
            result!.Places.Should().HaveCount(1);
            result.TotalCount.Should().Be(1);
            result.Places[0].PlaceId.Should().Be("place1");
            result.Places[0].Name.Should().Be("Test Restaurant");
        }

        [Fact]
        public async Task SearchPlaces_InvalidBounds_ReturnsBadRequest()
        {
            // arrange
            var client = _factory.CreateClient();
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ApiModels.ViewportBounds
                {
                    North = 40.0,
                    South = 41.0,
                    East = -74.0,
                    West = -75.0
                },
                Limit = 30
            };

            // act
            var response = await client.PostAsJsonAsync("/api/places/search", request);

            // assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task SearchPlaces_InvalidLimit_ReturnsBadRequest()
        {
            // arrange
            var client = _factory.CreateClient();
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ApiModels.ViewportBounds
                {
                    North = 40.8,
                    South = 40.6,
                    East = -73.9,
                    West = -74.1
                },
                Limit = 100
            };

            // act
            var response = await client.PostAsJsonAsync("/api/places/search", request);

            // assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task SearchPlaces_ServiceException_ReturnsInternalServerError()
        {
            // arrange
            var mockService = new Mock<IPlacesService>();
            mockService
                .Setup(s => s.SearchPlacesAsync(It.IsAny<PlaceSearchCriteria>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Infrastructure.Places.PlacesServiceException("Test error"));

            var client = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(IPlacesService));
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }
                    services.AddScoped(_ => mockService.Object);
                });
            }).CreateClient();

            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ApiModels.ViewportBounds
                {
                    North = 40.8,
                    South = 40.6,
                    East = -73.9,
                    West = -74.1
                },
                Limit = 30
            };

            // act
            var response = await client.PostAsJsonAsync("/api/places/search", request);

            // assert
            response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
        }
    }
}
