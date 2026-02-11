using MapInsights.Core.Places;
using MapInsights.Infrastructure.Places;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MapInsights.Infrastructure.Tests.Unit.Places
{
    public class GooglePlacesServiceCachingTests
    {
        private readonly Mock<IGridDivisionService> _gridDivisionService = new();
        private readonly Mock<ILogger<GooglePlacesService>> _logger = new();
        private readonly IMemoryCache _memoryCache;
        private readonly GoogleMapsOptions _options;
        private readonly GooglePlacesService _cut;

        private const string TestApiKey = "test-api-key-123";

        private readonly PlaceSearchCriteria _testCriteria = new()
        {
            Bounds = new ViewportBounds
            {
                North = 40.7580,
                South = 40.7480,
                East = -73.9855,
                West = -73.9955
            },
            Types = ["restaurant", "cafe"],
            MinRating = 4.0,
            MaxResults = 20
        };

        public GooglePlacesServiceCachingTests()
        {
            _memoryCache = new MemoryCache(new MemoryCacheOptions());
            _options = new GoogleMapsOptions
            {
                ApiKey = TestApiKey,
                MaxParallelRequests = 10,
                GridCellSizeInDegrees = 0.005,
                MaxGridCells = 20
            };

            _cut = new GooglePlacesService(
                Options.Create(_options),
                _gridDivisionService.Object,
                _memoryCache,
                _logger.Object);
        }

        [Fact]
        public async Task SearchPlacesAsync_WhenCalledFirstTime_CacheMissAndStoresResult()
        {
            // arrange
            var gridCells = new List<GridCell>
            {
                new() { Bounds = _testCriteria.Bounds }
            };

            _gridDivisionService
                .Setup(x => x.DivideIntoGrid(_testCriteria.Bounds, It.IsAny<double>()))
                .Returns(gridCells);

            // act
            var result = await _cut.SearchPlacesAsync(_testCriteria, CancellationToken.None);

            // assert
            result.Should().NotBeNull();
            result.Places.Should().NotBeNull();
        }

        [Fact]
        public async Task SearchPlacesAsync_WhenCalledTwiceWithSameCriteria_ReturnsCachedResult()
        {
            // arrange
            var expectedResult = new PlaceSearchResult
            {
                Places = new List<PlaceDetails>
                {
                    new()
                    {
                        PlaceId = "place-1",
                        Name = "Test Restaurant",
                        Type = "restaurant",
                        Rating = 4.5,
                        UserRatingsTotal = 100,
                        Location = new Location { Lat = 40.7530, Lng = -73.9905 }
                    }
                },
                TotalCount = 1
            };

            var cacheKey = GenerateCacheKey(_testCriteria);
            _memoryCache.Set(cacheKey, expectedResult, TimeSpan.FromMinutes(5));

            // act
            var result = await _cut.SearchPlacesAsync(_testCriteria, CancellationToken.None);

            // assert
            result.Should().BeEquivalentTo(expectedResult);
            _gridDivisionService.Verify(
                x => x.DivideIntoGrid(It.IsAny<ViewportBounds>(), It.IsAny<double>()),
                Times.Never,
                "API should not be called when result is cached");
        }

        [Theory]
        [InlineData(40.7580, 40.7480, -73.9855, -73.9955, 4.5)]
        [InlineData(41.0000, 40.9000, -74.0000, -74.1000, 4.0)]
        [InlineData(40.7580, 40.7480, -73.9855, -73.9955, 3.5)]
        public async Task SearchPlacesAsync_WithDifferentCriteria_UsesDifferentCacheKeys(
            double north, double south, double east, double west, double minRating)
        {
            // arrange
            var criteria1 = new PlaceSearchCriteria
            {
                Bounds = new ViewportBounds { North = north, South = south, East = east, West = west },
                Types = ["restaurant"],
                MinRating = minRating,
                MaxResults = 20
            };

            var criteria2 = new PlaceSearchCriteria
            {
                Bounds = new ViewportBounds { North = 40.7580, South = 40.7480, East = -73.9855, West = -73.9955 },
                Types = ["restaurant"],
                MinRating = 4.0,
                MaxResults = 20
            };

            var key1 = GenerateCacheKey(criteria1);
            var key2 = GenerateCacheKey(criteria2);

            // assert
            key1.Should().NotBe(key2, "Different criteria should generate different cache keys");
        }

        [Fact]
        public void GenerateCacheKey_WithSameBoundsRounded_GeneratesSameKey()
        {
            // arrange
            var criteria1 = new PlaceSearchCriteria
            {
                Bounds = new ViewportBounds { North = 40.758012, South = 40.748013, East = -73.985514, West = -73.995515 },
                Types = ["restaurant"],
                MinRating = 4.0,
                MaxResults = 20
            };

            var criteria2 = new PlaceSearchCriteria
            {
                Bounds = new ViewportBounds { North = 40.758019, South = 40.748018, East = -73.985517, West = -73.995519 },
                Types = ["restaurant"],
                MinRating = 4.0,
                MaxResults = 20
            };

            // act
            var key1 = GenerateCacheKey(criteria1);
            var key2 = GenerateCacheKey(criteria2);

            // assert
            key1.Should().Be(key2, "Bounds rounded to 4 decimal places should generate same cache key");
        }

        [Fact]
        public void GenerateCacheKey_WithDifferentTypes_GeneratesDifferentKeys()
        {
            // arrange
            var criteria1 = new PlaceSearchCriteria
            {
                Bounds = _testCriteria.Bounds,
                Types = ["restaurant", "cafe"],
                MinRating = 4.0,
                MaxResults = 20
            };

            var criteria2 = new PlaceSearchCriteria
            {
                Bounds = _testCriteria.Bounds,
                Types = ["bar"],
                MinRating = 4.0,
                MaxResults = 20
            };

            // act
            var key1 = GenerateCacheKey(criteria1);
            var key2 = GenerateCacheKey(criteria2);

            // assert
            key1.Should().NotBe(key2);
        }

        [Fact]
        public void GenerateCacheKey_WithNullTypes_GeneratesValidKey()
        {
            // arrange
            var criteria = new PlaceSearchCriteria
            {
                Bounds = _testCriteria.Bounds,
                Types = null,
                MinRating = 4.0,
                MaxResults = 20
            };

            // act
            var key = GenerateCacheKey(criteria);

            // assert
            key.Should().Contain("tall");
            key.Should().NotBeNullOrWhiteSpace();
        }

        [Fact]
        public void GenerateCacheKey_WithEmptyTypes_GeneratesValidKey()
        {
            // arrange
            var criteria = new PlaceSearchCriteria
            {
                Bounds = _testCriteria.Bounds,
                Types = [],
                MinRating = 4.0,
                MaxResults = 20
            };

            // act
            var key = GenerateCacheKey(criteria);

            // assert
            key.Should().Contain("tall");
            key.Should().NotBeNullOrWhiteSpace();
        }

        [Fact]
        public void GenerateCacheKey_WithNullMinRating_GeneratesValidKey()
        {
            // arrange
            var criteria = new PlaceSearchCriteria
            {
                Bounds = _testCriteria.Bounds,
                Types = ["restaurant"],
                MinRating = null,
                MaxResults = 20
            };

            // act
            var key = GenerateCacheKey(criteria);

            // assert
            key.Should().Contain("rany");
            key.Should().NotBeNullOrWhiteSpace();
        }

        [Fact]
        public void GenerateCacheKey_WithDifferentMaxResults_GeneratesDifferentKeys()
        {
            // arrange
            var criteria1 = new PlaceSearchCriteria
            {
                Bounds = _testCriteria.Bounds,
                Types = ["restaurant"],
                MinRating = 4.0,
                MaxResults = 20
            };

            var criteria2 = new PlaceSearchCriteria
            {
                Bounds = _testCriteria.Bounds,
                Types = ["restaurant"],
                MinRating = 4.0,
                MaxResults = 50
            };

            // act
            var key1 = GenerateCacheKey(criteria1);
            var key2 = GenerateCacheKey(criteria2);

            // assert
            key1.Should().NotBe(key2);
        }

        [Fact]
        public void GenerateCacheKey_OrdersTypesAlphabetically()
        {
            // arrange
            var criteria1 = new PlaceSearchCriteria
            {
                Bounds = _testCriteria.Bounds,
                Types = ["restaurant", "cafe", "bar"],
                MinRating = 4.0,
                MaxResults = 20
            };

            var criteria2 = new PlaceSearchCriteria
            {
                Bounds = _testCriteria.Bounds,
                Types = ["bar", "cafe", "restaurant"],
                MinRating = 4.0,
                MaxResults = 20
            };

            // act
            var key1 = GenerateCacheKey(criteria1);
            var key2 = GenerateCacheKey(criteria2);

            // assert
            key1.Should().Be(key2, "Types should be sorted alphabetically for consistent cache keys");
        }

        private static string GenerateCacheKey(PlaceSearchCriteria criteria)
        {
            var typesKey = criteria.Types != null && criteria.Types.Count > 0
                ? string.Join(",", criteria.Types.OrderBy(t => t))
                : "all";

            var ratingKey = criteria.MinRating?.ToString("F1") ?? "any";

            var north = Math.Round(criteria.Bounds.North, 4);
            var south = Math.Round(criteria.Bounds.South, 4);
            var east = Math.Round(criteria.Bounds.East, 4);
            var west = Math.Round(criteria.Bounds.West, 4);

            return $"places:n{north}:s{south}:e{east}:w{west}:t{typesKey}:r{ratingKey}:max{criteria.MaxResults}";
        }
    }
}
