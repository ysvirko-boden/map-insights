using MapInsights.Api.Features.Places.Models;
using MapInsights.Core.Places;

namespace MapInsights.Api.Features.Places.Mapping;

public static class PlacesMappingExtensions
{
    public static PlaceSearchCriteria ToSearchCriteria(this PlaceSearchRequest request)
    {
        List<PlaceCategory>? categories = null;
        List<string>? types = null;

        if (request.Categories?.Count > 0)
        {
            // Parse categories
            categories = request.Categories
                .Select(CategoryMappings.ParseCategory)
                .Where(c => c.HasValue)
                .Select(c => c!.Value)
                .ToList();

            // Expand to Google Places API types
            types = CategoryMappings.GetAllGooglePlaceTypes(categories);
        }

        return new PlaceSearchCriteria
        {
            Bounds = new Core.Places.ViewportBounds
            {
                North = request.ViewportBounds.North,
                South = request.ViewportBounds.South,
                East = request.ViewportBounds.East,
                West = request.ViewportBounds.West
            },
            Categories = categories,
            Types = types,
            MinRating = request.MinimumRating,
            MaxResults = request.Limit
        };
    }

    public static PlaceDetailsDto ToDto(this PlaceDetails domain)
    {
        return new PlaceDetailsDto
        {
            PlaceId = domain.PlaceId,
            Name = domain.Name,
            Type = domain.Type,
            Rating = domain.Rating,
            UserRatingsTotal = domain.UserRatingsTotal,
            FormattedAddress = domain.FormattedAddress,
            FormattedPhoneNumber = domain.FormattedPhoneNumber,
            OpeningHours = domain.OpeningHours != null
                ? new OpeningHoursDto
                {
                    OpenNow = domain.OpeningHours.OpenNow,
                    WeekdayText = domain.OpeningHours.WeekdayText
                }
                : null,
            Location = new LocationDto
            {
                Lat = domain.Location.Lat,
                Lng = domain.Location.Lng
            }
        };
    }

    public static PlaceSearchResponse ToResponse(this PlaceSearchResult result)
    {
        return new PlaceSearchResponse
        {
            Places = result.Places.Select(ToDto).ToList(),
            TotalCount = result.TotalCount
        };
    }
}
