# Map Insights Repository

## Project Overview
Map Insights is a full-stack application combining a .NET minimal API backend with a React TypeScript SPA frontend in a monorepo structure.

## Repository Structure

```
map-insights/
├── .github/
│   ├── instructions/                 # Path-specific Copilot instructions
│   └── workflows/                    # CI/CD pipelines
│
├── src/
│   ├── backend/                      # .NET Minimal API
│   │   ├── MapInsights.Api/          # Main API project
│   │   │   ├── Program.cs            # Application entry point
│   │   │   ├── appsettings.json
│   │   │   ├── Endpoints/            # API endpoint definitions
│   │   │   ├── Models/               # DTOs and domain models
│   │   │   ├── Services/             # Business logic services
│   │   │   ├── Data/                 # Database context, repositories
│   │   │   ├── Middleware/           # Custom middleware
│   │   │   └── MapInsights.Api.csproj
│   │   │
│   │   ├── MapInsights.Core/         # Core business logic (optional)
│   │   ├── MapInsights.Infrastructure/ # Infrastructure layer (optional)
│   │   └── MapInsights.Tests/        # Backend unit/integration tests
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
├── MapInsights.sln                   # .NET solution file
└── README.md
```

## Technology Stack

### Backend
- **.NET 8+**: Minimal API framework
- **Entity Framework Core**: ORM for database access
- **ASP.NET Core**: Web framework
- **xUnit**: Testing framework

### Frontend
- **React 18+**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management
- **Vitest**: Testing framework
- **@testing-library/react**: Component testing

## Build & Run Commands

### Backend
```bash
# Navigate to backend directory
cd src/backend/MapInsights.Api

# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the API
dotnet run

# Run tests
cd ../MapInsights.Tests
dotnet test
```

### Frontend
```bash
# Navigate to frontend directory
cd src/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## Development Guidelines

### Backend
- Follow REST API conventions for endpoint naming
- Use minimal API endpoint mapping for route definitions
- Implement proper error handling and logging
- Use dependency injection for services
- Keep controllers/endpoints thin, business logic in services
- Write unit tests for services and integration tests for endpoints

### Frontend
- Use functional components with hooks exclusively
- Keep components small and focused
- Define TypeScript types for all props and API responses
- Use React Query for server state, Zustand for client state
- Follow the project's custom instructions for specific directories
- Write tests for critical components and hooks

## Code Organization Principles

1. **Separation of Concerns**: Backend and frontend are independent but coordinated
2. **Type Safety**: Use TypeScript on frontend, C# on backend
3. **Testability**: Write testable code with proper dependency injection
4. **Scalability**: Structure supports adding new features without major refactoring
5. **Maintainability**: Clear directory structure and consistent naming conventions

## API Communication
- Frontend communicates with backend via REST API
- API base URL configured in frontend environment variables
- Use typed API client services in `src/frontend/src/services/`
- Handle authentication tokens in API service layer

## Environment Variables

### Backend
- Configure in `appsettings.json` and `appsettings.Development.json`
- Sensitive values should use User Secrets or environment variables

### Frontend
- Store in `.env` files (`.env.local`, `.env.production`)
- Prefix with `VITE_` to expose to client
- Never commit `.env.local` files

## Best Practices
- Always run tests before committing
- Use meaningful commit messages
- Keep dependencies up to date
- Document complex business logic
- Use ESLint and Prettier for frontend code consistency
- Follow C# coding conventions for backend
