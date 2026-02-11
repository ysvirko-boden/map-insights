using MapInsights.Api.Features.Places.Mapping;
using MapInsights.Api.Features.Places.Models;
using MapInsights.Core.Places;
using ApiModels = MapInsights.Api.Features.Places.Models;

namespace MapInsights.Api.Tests.Unit.Features.Places.Mapping
{
    public class PlacesMappingExtensionsTests
    {
        [Fact]
        public void ToSearchCriteria_ValidRequest_MapsAllProperties()
        {
            // arrange
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ApiModels.ViewportBounds
                {
                    North = 42.5,
                    South = 41.3,
                    East = -73.2,
                    West = -74.8
                },
                Categories = ["food_dining", "coffee_shops"],
                MinimumRating = 4.0,
                Limit = 50
            };

            // act
            var result = request.ToSearchCriteria();

            // assert
            result.Should().NotBeNull();
            result.Bounds.North.Should().Be(42.5);
            result.Bounds.South.Should().Be(41.3);
            result.Bounds.East.Should().Be(-73.2);
            result.Bounds.West.Should().Be(-74.8);
            // Categories expand to multiple Google place types
            result.Types.Should().NotBeNullOrEmpty();
            result.Types.Should().Contain("restaurant");
            result.Types.Should().Contain("cafe");
            result.MinRating.Should().Be(4.0);
            result.MaxResults.Should().Be(50);
        }

        [Fact]
        public void ToSearchCriteria_NullOptionalProperties_MapsCorrectly()
        {
            // arrange
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ApiModels.ViewportBounds
                {
                    North = 40.0,
                    South = 39.0,
                    East = -74.0,
                    West = -75.0
                },
                Categories = null,
                MinimumRating = null,
                Limit = 30
            };

            // act
            var result = request.ToSearchCriteria();

            // assert
            result.Types.Should().BeNull();
            result.MinRating.Should().BeNull();
            result.MaxResults.Should().Be(30);
        }

        [Fact]
        public void ToDto_ValidPlaceDetails_MapsAllProperties()
        {
            // arrange
            var domain = new PlaceDetails
            {
                PlaceId = "place123",
                Name = "Test Restaurant",
                Type = "restaurant",
                Rating = 4.5,
                UserRatingsTotal = 100,
                FormattedAddress = "123 Main St",
                FormattedPhoneNumber = "+1234567890",
                OpeningHours = new Core.Places.OpeningHours
                {
                    OpenNow = true,
                    WeekdayText = ["Monday: 9:00 AM - 5:00 PM"]
                },
                Location = new Core.Places.Location
                {
                    Lat = 40.7128,
                    Lng = -74.0060
                }
            };

            // act
            var result = domain.ToDto();

            // assert
            result.Should().NotBeNull();
            result.PlaceId.Should().Be("place123");
            result.Name.Should().Be("Test Restaurant");
            result.Type.Should().Be("restaurant");
            result.Rating.Should().Be(4.5);
            result.UserRatingsTotal.Should().Be(100);
            result.FormattedAddress.Should().Be("123 Main St");
            result.FormattedPhoneNumber.Should().Be("+1234567890");
            result.OpeningHours.Should().NotBeNull();
            result.OpeningHours!.OpenNow.Should().Be(true);
            result.OpeningHours!.WeekdayText.Should().BeEquivalentTo(["Monday: 9:00 AM - 5:00 PM"]);
            result.Location.Lat.Should().Be(40.7128);
            result.Location.Lng.Should().Be(-74.0060);
        }

        [Fact]
        public void ToDto_NullOptionalProperties_MapsCorrectly()
        {
            // arrange
            var domain = new PlaceDetails
            {
                PlaceId = "place456",
                Name = "Test Place",
                Type = "cafe",
                Rating = null,
                UserRatingsTotal = null,
                FormattedAddress = null,
                FormattedPhoneNumber = null,
                OpeningHours = null,
                Location = new Core.Places.Location
                {
                    Lat = 40.0,
                    Lng = -74.0
                }
            };

            // act
            var result = domain.ToDto();

            // assert
            result.Rating.Should().BeNull();
            result.UserRatingsTotal.Should().BeNull();
            result.FormattedAddress.Should().BeNull();
            result.FormattedPhoneNumber.Should().BeNull();
            result.OpeningHours.Should().BeNull();
        }

        [Fact]
        public void ToResponse_ValidResult_MapsAllProperties()
        {
            // arrange
            var result = new PlaceSearchResult
            {
                Places =
                [
                    new PlaceDetails
                    {
                        PlaceId = "place1",
                        Name = "Place 1",
                        Type = "restaurant",
                        Location = new Core.Places.Location { Lat = 40.0, Lng = -74.0 }
                    },
                    new PlaceDetails
                    {
                        PlaceId = "place2",
                        Name = "Place 2",
                        Type = "cafe",
                        Location = new Core.Places.Location { Lat = 41.0, Lng = -73.0 }
                    }
                ],
                TotalCount = 2
            };

            // act
            var response = result.ToResponse();

            // assert
            response.Should().NotBeNull();
            response.Places.Should().HaveCount(2);
            response.TotalCount.Should().Be(2);
            response.Places[0].PlaceId.Should().Be("place1");
            response.Places[0].Name.Should().Be("Place 1");
            response.Places[1].PlaceId.Should().Be("place2");
            response.Places[1].Name.Should().Be("Place 2");
        }

        [Fact]
        public void ToResponse_EmptyResult_ReturnsEmptyResponse()
        {
            // arrange
            var result = new PlaceSearchResult
            {
                Places = [],
                TotalCount = 0
            };

            // act
            var response = result.ToResponse();

            // assert
            response.Places.Should().BeEmpty();
            response.TotalCount.Should().Be(0);
        }
    }
}
