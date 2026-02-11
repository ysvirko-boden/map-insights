# Plan: Phase 1 - Setup Dependencies & Infrastructure

Phase 1 establishes the foundational infrastructure for the Places Discovery feature. We'll install and configure TanStack Query for server state management, Zustand for client state, and set up the backend for Google Places API integration. Decisions from alignment: Backend proxy strategy chosen for API security; manual load trigger selected for simpler MVP; viewport bounds approach for place search.

## Steps

1. **Install frontend state management libraries**
   - Add `zustand` (v5.x latest) to [package.json](src/frontend/package.json) dependencies
   - Add `@tanstack/react-query` (v5.x latest) to dependencies
   - Add `@tanstack/react-query-devtools` to devDependencies for debugging query cache

2. **Configure TanStack Query Provider in frontend entry point**
   - Update [main.tsx](src/frontend/src/main.tsx) to import `QueryClient` and `QueryClientProvider`
   - Create new `QueryClient` instance with default options: `staleTime: 5 * 60 * 1000` (5 minutes), `gcTime: 10 * 60 * 1000` (10 minutes cache)
   - Wrap the `App` component with `QueryClientProvider`, passing the client instance
   - Add `ReactQueryDevtools` component in development mode for debugging
   - The existing `StrictMode` wrapper should remain as outermost wrapper

3. **Add backend HTTP client for Google Places API**
   - Update [MapInsights.Api.csproj](src/backend/src/MapInsights.Api/MapInsights.Api.csproj) to add `PackageReference` for `Microsoft.Extensions.Http.Resilience` (standard resilience patterns for HTTP)
   - Register `IHttpClientFactory` in [Program.cs](src/backend/src/MapInsights.Api/Program.cs) via `builder.Services.AddHttpClient()` before building the app
   - Configure a named HTTP client for Google Places API with base address `https://places.googleapis.com/v1/` and standard timeout/retry policies

4. **Configure Google API key in backend settings**
   - Add new `GoogleMaps` configuration section to [appsettings.json](src/backend/src/MapInsights.Api/appsettings.json) with placeholder `ApiKey: "YOUR_API_KEY_HERE"` and comment indicating key should be set in appsettings.Development.json
   - Document in comments that production key should be set via environment variables (Production/CI)
   - Do NOT commit actual API key to repository in appsettings.json - use placeholder only

5. **Add Google API key to Development configuration**
   - Add the same `GoogleMaps` configuration section to [appsettings.Development.json](src/backend/src/MapInsights.Api/appsettings.Development.json) with the actual API key value: `"GoogleMaps": { "ApiKey": "actual-development-key-here" }`
   - Ensure [appsettings.Development.json](src/backend/src/MapInsights.Api/appsettings.Development.json) is listed in `.gitignore` or document that developers should not commit real API keys
   - This file is only loaded in Development environment, keeping keys out of production config

6. **Create configuration model for Google Maps settings**
   - Create new file `src/backend/src/MapInsights.Api/Configuration/GoogleMapsOptions.cs`
   - Define `GoogleMapsOptions` class with property `ApiKey` (string, required)
   - Register options pattern in [Program.cs](src/backend/src/MapInsights.Api/Program.cs): `builder.Services.Configure<GoogleMapsOptions>(builder.Configuration.GetSection("GoogleMaps"))`
   - This enables dependency injection of `IOptions<GoogleMapsOptions>` in services

7. **Update CORS policy for potential port differences**
   - Review CORS configuration in [Program.cs](src/backend/src/MapInsights.Api/Program.cs) line 13-19
   - Ensure frontend origin `http://localhost:3000` is correct (matches Vite dev server port)
   - Consider adding `http://localhost:5173` as Vite sometimes uses this port by default
   - Document that production will need environment-specific CORS origins

## Verification

- Run `npm install` in `src/frontend` directory - zero errors, new packages appear in node_modules
- Run `npm run dev` - frontend starts without errors, React Query DevTools panel appears in bottom-right corner
- Run `dotnet restore` in `src/backend` directory - restores new HTTP client package
- Run `dotnet build` in `src/backend` - builds successfully
- Run `dotnet run --project src/backend/src/MapInsights.Api` - backend starts on port 5000, reads API key from appsettings.Development.json
- Verify configuration: Add temporary log statement in startup to output `IOptions<GoogleMapsOptions>` value, confirm API key is loaded correctly

## Decisions

- **TanStack Query v5**: Chose latest stable for React 19 compatibility, provides built-in cache with 5-minute stale time for reasonable API quota management
- **Zustand over Context**: Per project guidelines, better performance and simpler API for complex state like filters + selection + hidden places
- **Microsoft.Extensions.Http.Resilience**: Standard .NET package for resilience (retry policies, circuit breakers) rather than third-party Google SDK, maintains architectural consistency
- **appsettings.Development.json for dev keys**: Simpler than User Secrets for MVP, but requires care not to commit real keys; production uses environment variables
- **Named HTTP client pattern**: Allows future addition of other external API clients without conflicts
