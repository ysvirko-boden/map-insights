using FluentValidation.TestHelper;
using MapInsights.Api.Features.Places.Models;
using MapInsights.Api.Features.Places.Validators;

namespace MapInsights.Api.Tests.Unit.Features.Places.Validators
{
    public class PlaceSearchRequestValidatorTests
    {
        private readonly PlaceSearchRequestValidator _validator = new();

        [Fact]
        public void Validate_ValidRequest_ShouldPassValidation()
        {
            // arrange
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ViewportBounds
                {
                    North = 40.0,
                    South = 39.0,
                    East = -74.0,
                    West = -75.0
                },
                Limit = 30
            };

            // act
            var result = _validator.TestValidate(request);

            // assert
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Fact]
        public void Validate_NorthLessThanOrEqualToSouth_ShouldFailValidation()
        {
            // arrange
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ViewportBounds
                {
                    North = 39.0,
                    South = 40.0,
                    East = -74.0,
                    West = -75.0
                },
                Limit = 30
            };

            // act
            var result = _validator.TestValidate(request);

            // assert
            result.ShouldHaveValidationErrorFor(x => x.ViewportBounds.North)
                .WithErrorMessage("North must be greater than South");
        }

        [Theory]
        [InlineData(5)]
        [InlineData(20)]
        [InlineData(100)]
        public void Validate_InvalidLimit_ShouldFailValidation(int invalidLimit)
        {
            // arrange
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ViewportBounds
                {
                    North = 40.0,
                    South = 39.0,
                    East = -74.0,
                    West = -75.0
                },
                Limit = invalidLimit
            };

            // act
            var result = _validator.TestValidate(request);

            // assert
            result.ShouldHaveValidationErrorFor(x => x.Limit)
                .WithErrorMessage("Limit must be 10, 30, or 50");
        }

        [Theory]
        [InlineData(-1.0)]
        [InlineData(5.5)]
        [InlineData(10.0)]
        public void Validate_InvalidMinimumRating_ShouldFailValidation(double invalidRating)
        {
            // arrange
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ViewportBounds
                {
                    North = 40.0,
                    South = 39.0,
                    East = -74.0,
                    West = -75.0
                },
                Limit = 30,
                MinimumRating = invalidRating
            };

            // act
            var result = _validator.TestValidate(request);

            // assert
            result.ShouldHaveValidationErrorFor(x => x.MinimumRating)
                .WithErrorMessage("MinimumRating must be between 0.0 and 5.0");
        }

        [Fact]
        public void Validate_InvalidPlaceType_ShouldFailValidation()
        {
            // arrange
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ViewportBounds
                {
                    North = 40.0,
                    South = 39.0,
                    East = -74.0,
                    West = -75.0
                },
                Limit = 30,
                Categories = ["invalid_type"]
            };

            // act
            var result = _validator.TestValidate(request);

            // assert
            result.ShouldHaveValidationErrorFor("Categories[0]");
        }

        [Fact]
        public void Validate_ValidPlaceTypes_ShouldPassValidation()
        {
            // arrange
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ViewportBounds
                {
                    North = 40.0,
                    South = 39.0,
                    East = -74.0,
                    West = -75.0
                },
                Limit = 30,
                Categories = ["food_dining", "coffee_shops", "attractions"]
            };

            // act
            var result = _validator.TestValidate(request);

            // assert
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Fact]
        public void Validate_NullOptionalProperties_ShouldPassValidation()
        {
            // arrange
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ViewportBounds
                {
                    North = 40.0,
                    South = 39.0,
                    East = -74.0,
                    West = -75.0
                },
                Limit = 30,
                Categories = null,
                MinimumRating = null
            };

            // act
            var result = _validator.TestValidate(request);

            // assert
            result.ShouldNotHaveAnyValidationErrors();
        }

        [Fact]
        public void Validate_EastEqualsWest_ShouldFailValidation()
        {
            // arrange
            var request = new PlaceSearchRequest
            {
                ViewportBounds = new ViewportBounds
                {
                    North = 40.0,
                    South = 39.0,
                    East = -75.0,
                    West = -75.0
                },
                Limit = 30
            };

            // act
            var result = _validator.TestValidate(request);

            // assert
            result.ShouldHaveValidationErrorFor(x => x.ViewportBounds.East)
                .WithErrorMessage("East must not equal West");
        }
    }
}
