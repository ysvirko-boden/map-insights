# Frontend Setup Instructions

## Prerequisites

Before you begin, ensure you have:
- **Node.js** v20+ installed ([Download](https://nodejs.org/))
- **npm** v10+ (comes with Node.js)
- **Git** installed
- **VS Code** (recommended) with the suggested extensions

## Initial Setup

### 1. Install Dependencies

```bash
cd src/frontend
npm install
```

This will install all required packages including:
- React and React DOM
- TypeScript
- Vite (build tool)
- Vitest (testing framework)
- ESLint and Prettier (code quality)
- Testing Library utilities

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure your settings:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MapInsights
```

**Important:** Never commit `.env.local` to version control!

### 3. Verify Setup

Run the type checker:
```bash
npm run type-check
```

Run linting:
```bash
npm run lint
```

Run tests:
```bash
npm test
```

If all commands succeed, your setup is complete! ✅

## Development Workflow

### Start Development Server

```bash
npm run dev
```

This will:
- Start the Vite dev server on http://localhost:3000
- Enable hot module replacement (HMR)
- Open your browser automatically

### Run Tests in Watch Mode

In a separate terminal:

```bash
npm run test:watch
```

This will:
- Run tests automatically on file changes
- Show test results in real-time
- Help catch issues early

### Code Quality Checks

Before committing code:

```bash
# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run full test suite
npm test

# Check types
npm run type-check
```

## VS Code Setup

### Install Recommended Extensions

When you open the project in VS Code, you'll see a prompt to install recommended extensions. Click "Install All" or manually install:

1. **ESLint** - Real-time linting
2. **Prettier** - Code formatting
3. **Vitest** - Test runner integration
4. **Error Lens** - Inline error display
5. **ES7+ React/Redux Snippets** - Code snippets

### Configure Settings

The project includes VS Code settings that will:
- Format code on save
- Run ESLint fixes automatically
- Use the workspace TypeScript version

## Project Structure

```
src/frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Generic components (Button, Input, etc.)
│   │   └── feature/      # Feature-specific components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page/route components
│   ├── services/         # API clients and external services
│   ├── store/            # Global state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Helper functions and utilities
│   ├── styles/           # Global styles and theme
│   ├── assets/           # Static assets (images, fonts)
│   ├── App.tsx           # Root application component
│   └── main.tsx          # Application entry point
│
├── tests/                # Test utilities and setup
├── public/               # Static files served as-is
├── .env.example          # Environment variables template
├── vite.config.ts        # Vite configuration
├── vitest.config.ts      # Test configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.js      # ESLint configuration
└── package.json          # Dependencies and scripts
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run preview` - Preview production build locally

### Type Checking
- `npm run type-check` - Check TypeScript types

### Linting & Formatting
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are formatted

### Testing
- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI
- `npm run test:coverage` - Generate coverage report

### Building
- `npm run build` - Build for production
- `npm run clean` - Clean build artifacts

## Common Issues

### Port Already in Use

If port 3000 is already in use:

1. Edit `vite.config.ts`
2. Change the port in the `server` section
3. Restart the dev server

### Module Not Found

If you see module import errors:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

If TypeScript shows errors:

```bash
# Restart TypeScript server in VS Code
# Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
# Type: "TypeScript: Restart TS Server"
```

### ESLint Issues

If ESLint is not working:

```bash
# Reinstall ESLint
npm install eslint --save-dev

# Restart VS Code
```

## Next Steps

1. **Read the Guide**: Check [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) for comprehensive development practices
2. **Explore Examples**: Look at the sample Button component in `src/components/common/Button/`
3. **Create Components**: Start building your components following the established patterns
4. **Write Tests**: Add tests for all new components and hooks

## Getting Help

- Check the [Frontend Guide](./FRONTEND_GUIDE.md) for detailed best practices
- Review existing components in `src/components/` for examples
- Read the [React documentation](https://react.dev)
- Check [Vite documentation](https://vite.dev) for build configuration

## Quick Reference

### Import Aliases

The project uses path aliases for cleaner imports:

```typescript
// Instead of: import { Button } from '../../components/common/Button'
import { Button } from '@components/common/Button'

// Available aliases:
// @/           -> src/
// @components/ -> src/components/
// @hooks/      -> src/hooks/
// @utils/      -> src/utils/
// @services/   -> src/services/
// @types/      -> src/types/
// @store/      -> src/store/
// @pages/      -> src/pages/
// @assets/     -> src/assets/
```

### Component Template

```typescript
import type { ReactNode } from 'react'
import './MyComponent.css'

export interface MyComponentProps {
  children?: ReactNode
  // ... other props
}

export function MyComponent({ children }: MyComponentProps) {
  return (
    <div className="my-component">
      {children}
    </div>
  )
}
```

### Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent>Test</MyComponent>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

---

Happy coding! 🚀
