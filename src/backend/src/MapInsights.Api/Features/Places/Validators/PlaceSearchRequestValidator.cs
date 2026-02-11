using FluentValidation;
using MapInsights.Api.Features.Places.Models;

namespace MapInsights.Api.Features.Places.Validators;

public class PlaceSearchRequestValidator : AbstractValidator<PlaceSearchRequest>
{
    private static readonly HashSet<string> _validCategories = new(StringComparer.OrdinalIgnoreCase)
    {
        "food_dining",
        "coffee_shops",
        "groceries",
        "attractions",
        "shopping",
        "nature_parks",
        "healthcare",
        "services",
        "transportation",
        "nightlife"
    };

    private static readonly HashSet<int> _allowedLimits = [10, 30, 50];

    public PlaceSearchRequestValidator()
    {
        RuleFor(x => x.ViewportBounds)
            .NotNull()
            .WithMessage("ViewportBounds is required");

        RuleFor(x => x.ViewportBounds.North)
            .GreaterThan(x => x.ViewportBounds.South)
            .WithMessage("North must be greater than South");

        RuleFor(x => x.ViewportBounds.East)
            .NotEqual(x => x.ViewportBounds.West)
            .WithMessage("East must not equal West");

        RuleFor(x => x.Limit)
            .Must(limit => _allowedLimits.Contains(limit))
            .WithMessage("Limit must be 10, 30, or 50");

        RuleFor(x => x.MinimumRating)
            .InclusiveBetween(0.0, 5.0)
            .When(x => x.MinimumRating.HasValue)
            .WithMessage("MinimumRating must be between 0.0 and 5.0");

        RuleForEach(x => x.Categories)
            .Must(category => _validCategories.Contains(category))
            .WithMessage("'{PropertyValue}' is not a valid category. Allowed categories: " +
                string.Join(", ", _validCategories))
            .When(x => x.Categories != null);
    }
}
