using FluentValidation;
using MapInsights.Api.Features.Places.Mapping;
using MapInsights.Api.Features.Places.Models;
using MapInsights.Core.Places;
using MapInsights.Infrastructure.Places;
using Microsoft.AspNetCore.Mvc;

namespace MapInsights.Api.Features.Places
{
    public static class PlacesEndpoints
    {
        public static IEndpointRouteBuilder MapPlacesEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapPost("/api/places/search", SearchPlaces)
                .WithName("SearchPlaces")
                .RequireAuthorization();

            return endpoints;
        }

        private static async Task<IResult> SearchPlaces(
            [FromBody] PlaceSearchRequest request,
            [FromServices] IValidator<PlaceSearchRequest> validator,
            [FromServices] IPlacesService placesService,
            [FromServices] ILogger<PlaceSearchRequest> logger,
            CancellationToken cancellationToken)
        {
            var validationResult = await validator.ValidateAsync(request, cancellationToken);
            if (!validationResult.IsValid)
            {
                logger.LogWarning("Invalid place search request: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));
                return Results.BadRequest(validationResult.Errors);
            }

            try
            {
                logger.LogInformation("Searching places with limit: {Limit}", request.Limit);

                var criteria = request.ToSearchCriteria();
                var result = await placesService.SearchPlacesAsync(criteria, cancellationToken);
                var response = result.ToResponse();

                logger.LogInformation("Place search completed successfully with {Count} results", response.TotalCount);

                return Results.Ok(response);
            }
            catch (PlacesServiceException ex)
            {
                logger.LogError(ex, "Places service error occurred");
                return Results.Problem(
                    title: "Places search failed",
                    detail: "An error occurred while searching for places",
                    statusCode: StatusCodes.Status500InternalServerError);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error during place search");
                return Results.Problem(
                    title: "Internal server error",
                    detail: "An unexpected error occurred",
                    statusCode: StatusCodes.Status500InternalServerError);
            }
        }
    }
}
