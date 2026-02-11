---
applyTo: "src/backend/**/*"
---

# Backend Development Guidelines

## Technology Stack
- **.NET 10** with minimal API
- **C# 14** with nullable reference types enabled
- **xUnit** for testing with **FluentAssertions**
- **FluentValidation** for request validation
- **Serilog** for structured logging
- **GoogleApi** NuGet package for Google Maps/Places API

## Project Structure and Layers

### 1. MapInsights.Api — Presentation Layer

#### Responsibilities
- HTTP request/response models
- Controllers / endpoints
- Middleware
- API validation
- API-specific mapping (HTTP ↔ Application DTOs)
- API orchestration of application services

#### Structure Example
```
MapInsights.Api
 └── Features
     └── Places
         ├── Models
         ├── Validators
         ├── Mapping
         └── Controllers
```

#### Rules
- No business logic
- No database logic
- No infrastructure implementation details

### 2. MapInsights.Core — Application / Domain Layer

#### Responsibilities
- Domain entities
- Application DTOs
- Business rules
- Use cases
- Service interfaces
- Abstractions for repositories and external services

#### Rules
- Must not depend on Infrastructure
- Must not depend on ASP.NET Core
- Must not contain EF Core DbContext or persistence entities

### 3. MapInsights.Infrastructure — Infrastructure Layer

#### Responsibilities
- Repository implementations
- External API client implementations
- EF Core DbContext and persistence entities
- Database-specific logic
- Configuration models
- HttpClient implementations
- Third-party integrations

#### Rules
- Implements Core interfaces
- Depends only on Core
- Contains no business logic

### 4. Dependency Direction Rules

- Api → Core
- Api → Infrastructure
- Infrastructure → Core
- Core → (no project dependencies)

**Infrastructure must never depend on Api.**

## Feature-Based Structure (Vertical Slices)

Organize code by feature, not technical layer.

❌ BAD:
```
/Config
/Models
/Services
/Extensions
```

✅ GOOD:
```
/Features
  /Places
    /Models           # DTOs (PlaceSearchRequest, PlaceSearchResponse)
    /Validators       # FluentValidation validators
    /Mapping          # Mapping extensions
    PlacesEndpoints.cs
  /Health
    HealthEndpoints.cs
```


## Dependency Injection Guidelines

- Use constructor injection (prefer primary constructors)
- Depend on interfaces from Core layer
- Register services via IServiceCollection extensions in Infrastructure
- Avoid direct registration in Program.cs
- Use appropriate service lifetimes
- Use `IOptions<T>` for configuration binding

### Example: Infrastructure DI Extension

```csharp
// Infrastructure/Places/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddPlacesInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<GoogleMapsOptions>(
            configuration.GetSection("GoogleMaps"));

        services.AddScoped<IGridDivisionService, GridDivisionService>();
        services.AddScoped<IPlacesService, GooglePlacesService>();

        return services;
    }
}
```

## Code Style

1. **No comments in code** - except `// arrange // act // assert` in tests or when explicitly requested
2. **Use primary constructors** - always prefer primary constructors (C# 12+) when possible
3. **Use collection expressions** - prefer `["item1", "item2"]` over `new List<string> { "item1", "item2" }`
4. **Use block scoped namespaces** - do not use file scoped namespaces
5. **Always use "var"** - even in for loops: `for (var i = 0; i < N; i++)`
6. **Method chaining preferred** - use fluent interfaces for service registration and configuration
7. **Builder patterns** - use appropriate builders instead of direct constructors when available
8. **Return collections** - extension methods should return the collection for chaining
9. **Use modern C# syntax** - leverage latest language features and idioms

## Principles

1. **Be brief** - do not explain each action or obvious things
2. **Follow best practices** - use established software development patterns
3. **Adhere to core principles** - KISS, YAGNI, DRY, SOLID

## Testing Workflow

**Always run tests after completing any backend task to validate changes:**

```bash
cd src/backend
dotnet test
```

This runs all unit and integration tests across the entire solution. Fix any failures before considering the task complete.
