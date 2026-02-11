# Plan: Phase 2 - Backend API Places Search

Build secure backend endpoints for places discovery using Google Places API. The backend will accept viewport bounds and filter parameters, call Google Places API (via GoogleApi NuGet package), and return filtered, limited results. This follows the vertical slice architecture with feature-based organization across Api, Core, and Infrastructure layers.

## Steps

1. **Create Places feature structure in API layer**
   - Create `src/backend/src/MapInsights.Api/Features/Places/` folder
   - Create subfolders: `Models/`, `Validators/`, `Mapping/`
   - This follows the existing Health feature pattern seen in [Features/Health](src/backend/src/MapInsights.Api/Features/Health)

2. **Define API request/response DTOs**
   - Create [Features/Places/Models/PlaceSearchRequest.cs](src/backend/src/MapInsights.Api/Features/Places/Models/PlaceSearchRequest.cs):
     - `ViewportBounds` property with `North`, `South`, `East`, `West` (all `double`)
     - `PlaceTypes` property (`List<string>?`) - curated subset: restaurant, hotel, cafe, museum, park, shopping_mall, tourist_attraction, bar, gym, gas_station
     - `MinimumRating` property (`double?`) - nullable, range 0.0-5.0
     - `Limit` property (`int`) - choices: 10, 30, 50 (default 30)
   - Create [Features/Places/Models/PlaceDetailsDto.cs](src/backend/src/MapInsights.Api/Features/Places/Models/PlaceDetailsDto.cs):
     - `PlaceId` (`string`, required)
     - `Name` (`string`, required)
     - `Type` (`string`, required) - primary place type
     - `Rating` (`double?`)
     - `UserRatingsTotal` (`int?`) - review count
     - `PhotoUrls` (`List<string>`) - up to 3 photo URLs
     - `FormattedAddress` (`string?`)
     - `FormattedPhoneNumber` (`string?`)
     - `OpeningHours` (`OpeningHoursDto?`) - nested object
     - `Location` property with `Lat` and `Lng` (`double`)
   - Create [Features/Places/Models/OpeningHoursDto.cs](src/backend/src/MapInsights.Api/Features/Places/Models/OpeningHoursDto.cs):
     - `OpenNow` (`bool?`)
     - `WeekdayText` (`List<string>?`) - formatted hours by day
   - Create [Features/Places/Models/PlaceSearchResponse.cs](src/backend/src/MapInsights.Api/Features/Places/Models/PlaceSearchResponse.cs):
     - `Places` (`List<PlaceDetailsDto>`)
     - `TotalCount` (`int`)

3. **Add request validation with FluentValidation**
   - Add NuGet package `FluentValidation.DependencyInjectionExtensions` to [MapInsights.Api.csproj](src/backend/src/MapInsights.Api/MapInsights.Api.csproj)
   - Create [Features/Places/Validators/PlaceSearchRequestValidator.cs](src/backend/src/MapInsights.Api/Features/Places/Validators/PlaceSearchRequestValidator.cs):
     - Validate ViewportBounds: North > South, East != West (considering wrap-around)
     - Validate Limit: must be 10, 30, or 50
     - Validate MinimumRating: if provided, must be 0.0-5.0
     - Validate PlaceTypes: if provided, must be from curated list
   - Register validators in DI: `builder.Services.AddValidatorsFromAssemblyContaining<PlaceSearchRequestValidator>()`

4. **Create service interface in Core layer**
   - Create [src/backend/src/MapInsights.Core/Places/IPlacesService.cs](src/backend/src/MapInsights.Core/Places/IPlacesService.cs):
     - Interface method: `Task<PlaceSearchResult> SearchPlacesAsync(PlaceSearchCriteria criteria, CancellationToken cancellationToken)`
   - Create [src/backend/src/MapInsights.Core/Places/PlaceSearchCriteria.cs](src/backend/src/MapInsights.Core/Places/PlaceSearchCriteria.cs):
     - Same properties as API request DTO but domain-focused (not HTTP-specific)
     - Bounds, Types, MinRating, MaxResults
   - Create [src/backend/src/MapInsights.Core/Places/PlaceSearchResult.cs](src/backend/src/MapInsights.Core/Places/PlaceSearchResult.cs):
     - `Places` (`List<PlaceDetails>`)
     - `TotalCount` (`int`)
   - Create [src/backend/src/MapInsights.Core/Places/PlaceDetails.cs](src/backend/src/MapInsights.Core/Places/PlaceDetails.cs):
     - Core domain model matching the API DTO structure
     - This separates API concerns from domain logic

5. **Implement Google Places service in Infrastructure**
   - Add `GoogleApi` package reference to [MapInsights.Infrastructure.csproj](src/backend/src/MapInsights.Infrastructure/MapInsights.Infrastructure.csproj) if not already present
   - Create [src/backend/src/MapInsights.Infrastructure/Places/GooglePlacesService.cs](src/backend/src/MapInsights.Infrastructure/Places/GooglePlacesService.cs):
     - Implement `IPlacesService` interface from Core
     - Inject `IOptions<GoogleMapsOptions>` for API key
     - Use `GoogleApi.GooglePlaces` client for Nearby Search API
     - Map Google API response to Core `PlaceDetails` models
     - Apply filters: type matching, rating threshold
     - Limit results to requested count
     - Handle Google API errors with try-catch, log errors, throw custom exceptions
   - Update [DependencyInjection.cs](src/backend/src/MapInsights.Infrastructure/Places/DependencyInjection.cs):
     - Register `IPlacesService` as scoped: `services.AddScoped<IPlacesService, GooglePlacesService>()`

6. **Create mapping between API DTOs and Core models**
   - Create [Features/Places/Mapping/PlacesMappingExtensions.cs](src/backend/src/MapInsights.Api/Features/Places/Mapping/PlacesMappingExtensions.cs):
     - Extension method: `ToSearchCriteria(this PlaceSearchRequest request)` → `PlaceSearchCriteria`
     - Extension method: `ToDto(this PlaceDetails domain)` → `PlaceDetailsDto`
     - Extension method: `ToResponse(this PlaceSearchResult result)` → `PlaceSearchResponse`
   - Keep mapping logic simple and declarative

7. **Create Places API endpoint**
   - Create [Features/Places/PlacesEndpoints.cs](src/backend/src/MapInsights.Api/Features/Places/PlacesEndpoints.cs):
     - Static extension method: `MapPlacesEndpoints(this IEndpointRouteBuilder endpoints)`
     - Define `POST /api/places/search` endpoint
     - Accept `PlaceSearchRequest` from body
     - Inject `IValidator<PlaceSearchRequest>` and validate request
     - Return `400 BadRequest` with validation errors if invalid
     - Inject `IPlacesService` and call `SearchPlacesAsync`
     - Map result to `PlaceSearchResponse` using mapping extensions
     - Return `200 OK` with response
     - Add `WithName("SearchPlaces")` for OpenAPI
     - Add proper error handling with try-catch, return `500 InternalServerError` on exceptions
     - Log request/response/errors using `ILogger`
   - Register endpoint in [Program.cs](src/backend/src/MapInsights.Api/Program.cs): `app.MapPlacesEndpoints()`

8. **Write unit tests for GooglePlacesService**
   - Create [tests/MapInsights.Core.Tests.Unit/Places/](src/backend/tests/MapInsights.Core.Tests.Unit/Places/) folder
   - Create `GooglePlacesServiceTests.cs`:
     - Test successful search with results
     - Test filtering by place type (include/exclude based on criteria)
     - Test filtering by minimum rating (above/below threshold)
     - Test result limiting (respects MaxResults)
     - Test empty results (no matching places)
     - Test Google API error handling (throws appropriate exception)
   - Follow xUnit + FluentAssertions + Moq patterns from test instructions
   - Mock Google API calls (or use test data)
   - Use `// arrange // act // assert` comments
   - Run `dotnet test` to verify tests pass

9. **Write unit tests for mapping extensions**
   - Create [tests/MapInsights.Api.Tests.Unit/Features/Places/Mapping/](src/backend/tests/MapInsights.Api.Tests.Unit/Features/Places/Mapping/) folder
   - Create `PlacesMappingExtensionsTests.cs`:
     - Test `ToSearchCriteria`: verify all properties map correctly
     - Test `ToDto`: verify PlaceDetails → PlaceDetailsDto mapping
     - Test `ToResponse`: verify PlaceSearchResult → PlaceSearchResponse mapping
     - Test null handling for optional properties
   - Use `[Theory]` with `[InlineData]` for parameterized tests where appropriate
   - Run `dotnet test` to verify

10. **Write unit tests for validator**
    - Create [tests/MapInsights.Api.Tests.Unit/Features/Places/Validators/](src/backend/tests/MapInsights.Api.Tests.Unit/Features/Places/Validators/) folder
    - Create `PlaceSearchRequestValidatorTests.cs`:
      - Test valid request passes validation
      - Test invalid bounds (North <= South) fails
      - Test invalid limit (not 10/30/50) fails
      - Test invalid rating (< 0 or > 5) fails
      - Test invalid place type (not in curated list) fails
      - Test null optional properties pass validation
    - Use FluentValidation test extensions: `validator.TestValidate(request).ShouldHaveValidationErrorFor(x => x.Limit)`
    - Run `dotnet test` to verify

11. **Write integration tests for Places endpoint**
    - Create [tests/MapInsights.Api.Tests.Integration/Features/Places/](src/backend/tests/MapInsights.Api.Tests.Integration/Features/Places/) folder
    - Create `PlacesEndpointsTests.cs`:
      - Use `WebApplicationFactory<Program>` to test endpoint
      - Mock `IPlacesService` in test container
      - Test `POST /api/places/search` with valid request returns 200
      - Test invalid request returns 400 with validation errors
      - Test service exception returns 500
      - Test response structure matches schema
    - Follow integration test patterns from existing tests
    - Run `dotnet test` to verify

12. **Add comprehensive error handling and logging**
    - Review [GooglePlacesService.cs](src/backend/src/MapInsights.Infrastructure/Places/GooglePlacesService.cs) error handling:
      - Catch Google API specific exceptions (quota exceeded, invalid API key, network errors)
      - Log errors with structured logging (include search criteria, exception details)
      - Throw custom domain exceptions (e.g., `PlacesServiceException`) with meaningful messages
    - Review [PlacesEndpoints.cs](src/backend/src/MapInsights.Api/Features/Places/PlacesEndpoints.cs) error handling:
      - Catch validation exceptions
      - Catch service exceptions
      - Return appropriate HTTP status codes
      - Log all errors with correlation context
      - Do not expose internal error details to API responses

## Verification

- Run `dotnet restore` in backend directory - restores FluentValidation package
- Run `dotnet build` - zero compilation errors
- Run `dotnet test` - all tests pass (unit + integration)
- Run `dotnet run --project src/backend/src/MapInsights.Api` - backend starts successfully
- Test endpoint manually:
  - Use REST client or curl to `POST http://localhost:5000/api/places/search`
  - Valid request with viewport bounds returns 200 with places
  - Invalid request (bad bounds) returns 400 with validation errors
  - Check logs show request/response details
- Verify OpenAPI docs at `/openapi/v1.json` includes new endpoint
- Check that Google Places API is called correctly (via logs or API quota dashboard)

## Decisions

- **GoogleApi NuGet package**: Already in use from Phase 1, provides typed client for Google Places API rather than raw HTTP calls
- **FluentValidation**: Industry standard for complex validation logic, keeps validation separate from models, easily testable
- **Vertical slice architecture**: Each feature (Places, Health) has its own Models, Validators, Mapping, Endpoints - maintains cohesion
- **Three-layer separation**: 
  - API layer (HTTP concerns, DTOs, validation)
  - Core layer (domain models, interfaces, business rules)
  - Infrastructure layer (external service implementations)
- **Explicit mapping**: Manual mapping extensions rather than AutoMapper for transparency and control
- **Scoped service lifetime**: `IPlacesService` registered as scoped for per-request instances, appropriate for services with state or external calls
- **Curated place types**: Limit to 10 common types for MVP rather than all ~100 Google place types - simplifies UI/UX
- **Photo URLs**: Return photo URLs from Google (not base64 data) for performance - frontend will load images separately
- **Viewport search**: Use rectangular bounds (NE/SW corners) rather than radius/center for precise map-based searching
