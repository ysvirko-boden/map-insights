# Map Insights Repository

## Project Overview
Map Insights is a full-stack application combining a .NET minimal API backend with a React TypeScript SPA frontend in a monorepo structure.

## Repository Structure

```
map-insights/
├── .github/
│   ├── instructions/                 # Path-specific Copilot instructions
│
├── src/
│   ├── backend/                      # .NET Minimal API
│   │   ├── MapInsights.sln           # .NET solution file
│   │   │
│   │   ├── src/                      # Backend source code
│   │   │   ├── MapInsights.Api/      # Main API project
│   │   │   │   ├── Program.cs        # Application entry point
│   │   │   │   ├── appsettings.json
│   │   │   │   ├── Features/         # Feature-based organization
│   │   │   │   │   ├── Places/       # Places feature (Models, Validators, Endpoints)
│   │   │   │   │   └── Health/       # Health check endpoints
│   │   │   │   └── MapInsights.Api.csproj
│   │   │   │
│   │   │   ├── MapInsights.Core/     # Core business logic
│   │   │   │   └── Places/           # Domain interfaces and models
│   │   │   └── MapInsights.Infrastructure/ # Infrastructure layer
│   │   │       └── Places/           # Google Places API implementation
│   │   │
│   │   └── tests/                    # Backend tests
│   │       ├── MapInsights.Api.Tests.Unit/      # API unit tests
│   │       ├── MapInsights.Core.Tests.Unit/     # Core unit tests
│   │       └── MapInsights.Api.Tests.Integration/ # Integration tests
│   │
│   └── frontend/                     # React TypeScript SPA
│       ├── public/                   # Static assets
│       ├── src/
│       │   ├── components/           # Reusable React components
│       │   ├── hooks/                # Custom React hooks
│       │   ├── pages/                # Page-level components
│       │   ├── store/                # Zustand state management
│       │   ├── contexts/             # React context providers
│       │   ├── types/                # TypeScript type definitions
│       │   ├── services/             # API client services
│       │   ├── utils/                # Helper utilities
│       │   ├── styles/               # Global styles
│       │   ├── assets/               # Images, icons, fonts
│       │   ├── App.tsx               # Root application component
│       │   └── main.tsx              # Application entry point
│       │
│       ├── tests/                    # Frontend tests
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── .env.example
│
├── docs/                             # Project documentation
└── README.md
```

## Technology Stack

### Backend
- **.NET 10+**: Minimal API framework with feature-based architecture
- **xUnit**: Testing framework with FluentAssertions
- **FluentValidation**: Request validation library
- **Serilog**: Structured logging framework
- **GoogleApi**: Google Maps/Places API integration (NuGet)

### Frontend
- **React 19+**: UI library with functional components
- **TypeScript**: Type-safe JavaScript with strict mode
- **Vite**: Build tool and dev server with HMR
- **@vis.gl/react-google-maps**: Google Maps JavaScript API wrapper
- **TanStack Router**: Type-safe file-based routing
- **TanStack Query**: Server state management (API calls, caching)
- **Zustand**: Client state management (places filters, UI state)
- **React Context**: Global state (theme system)
- **Vitest**: Fast test runner with Jest-compatible API
- **@testing-library/react**: Component testing utilities

### Testing & API Tools
- **playwright-cli**: E2E browser automation and testing

## Build & Run Commands

### Backend
```bash
# Navigate to API directory and run
cd src/backend/src/MapInsights.Api
dotnet run
# API runs on http://localhost:5000

# Run all tests from backend root
cd src/backend
dotnet test

# Build entire solution
dotnet build

# Run specific test project
cd tests/MapInsights.Api.Tests.Unit
dotnet test
```

### Frontend
```bash
# Navigate to frontend directory
cd src/frontend

# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Type checking
npm run type-check

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Testing
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# Building
npm run build            # Production build
npm run preview          # Preview production build
```

## Development Guidelines

### Backend
- **Feature-based structure**: Group by domain (Features/Places, Features/Health)
- **Minimal API**: Use MapGroup/MapPost/MapGet extension methods
- **Validation**: Use FluentValidation with validators in feature folders
- **Logging**: Use Serilog with structured logging (configured in appsettings.json)
- **DI Registration**: Create extension methods (e.g., AddPlacesInfrastructure)
- **Primary constructors**: Use C# 12+ primary constructor syntax
- Keep endpoints thin - delegate to Core services
- Write unit tests for services and integration tests for endpoints

### Frontend
- **Components**: Functional components with hooks only
- **TypeScript strict mode**: No `any` types - use environment variable assertions
- **Path aliases**: @/, @components/, @hooks/, @services/, @types/, @store/, @assets/
- **Routing**: TanStack Router with type-safe navigation, route guards for auth
- **State management**: TanStack Query for server state, Zustand for client state, Context for theme
- **Google Maps**: Use @vis.gl/react-google-maps with APIProvider wrapper
- **Theme system**: React Context with system/light/dark modes, CSS variables
- **Testing**: Vitest + @testing-library/react (>80% coverage)
- **E2E**: playwright-cli for browser testing (tests/e2e/)
- Follow accessibility standards (WCAG 2.1)
- Path-specific instructions apply to different directories

## Code Organization Principles

1. **Separation of Concerns**: Backend and frontend independent but coordinated
2. **Type Safety**: TypeScript strict mode (frontend), C# nullable (backend)
3. **Feature-based structure**: Group by domain, not technical layer
4. **Testability**: DI on backend, pure functions on frontend
5. **Scalability**: Add features without major refactoring
6. **Consistency**: Follow established patterns (see path-specific instructions)

## API Communication
- Frontend communicates with backend via REST API
- API runs on http://localhost:5000 (configured in CORS)
- Use typed API client services in `src/frontend/src/services/`
- Endpoints follow pattern: `/api/{feature}/{action}` (e.g., `/api/places/search`)

## Environment Variables

### Backend
- Configure in `appsettings.json` and `appsettings.Development.json` (gitignored)
- **GoogleMaps:ApiKey**: Google Maps API key (required), dev API key is stored in `appsettings.Development.json` (gitignored)
- Sensitive values use User Secrets or environment variables
- Use double underscore notation for nested config: `GoogleMaps__ApiKey`

### Frontend
- Store in `.env.local` (gitignored) and `.env.example` (template)
- **VITE_GOOGLE_MAPS_API_KEY**: Google Maps JavaScript API key (required)
- All client env vars must be prefixed with `VITE_`
- Type environment variables in `vite-env.d.ts` for type safety

## E2E Testing Workflow

Use **playwright-cli** skill for end-to-end browser testing.

### Test Documentation Pattern
1. **Test Scenario**: Create `tests/e2e/[feature-name].test.md`
   - Document test steps, expected behavior, success criteria
   - Include specific actions and verification points

2. **Execute Tests**: Use playwright-cli skill

3. **Test Report**: Create `tests/e2e/[feature-name]-report.md`
   - Document actual results
   - Include screenshots
   - Note any issues or deviations

### Examples
- `tests/e2e/map-integration.test.md` - Google Maps initialization
- `tests/e2e/theme-switching-dark-to-light.test.md` - Theme toggle functionality
- `tests/e2e/category-filter-single-selection.test.md` - Filter interactions

## Best Practices
- Always run tests before committing
- Use meaningful commit messages
- Keep dependencies up to date
- Document complex business logic
- Use ESLint and Prettier for frontend code consistency
- Follow C# coding conventions for backend

## Path-Specific Instructions

Detailed guidelines for specific areas of the codebase (referenced in workspace instructions):

- **backend.instructions.md** - .NET minimal API, FluentValidation, Serilog patterns
- **frontend.instructions.md** - React, TypeScript, Google Maps integration
- **react-components.instructions.md** - Component structure and patterns
- **react-hooks.instructions.md** - Custom hooks development
- **state-management.instructions.md** - Zustand stores, React Context, useLocalStorage
- **typescript-types.instructions.md** - Type definitions and conventions
- **styling.instructions.md** - CSS Modules and theming with CSS variables
- **testing-back.instructions.md** - xUnit, FluentAssertions, test patterns
- **testing-front.instructions.md** - Vitest, Testing Library, E2E with playwright-cli

Each instruction file applies to specific file paths and provides focused, non-overlapping guidance.
