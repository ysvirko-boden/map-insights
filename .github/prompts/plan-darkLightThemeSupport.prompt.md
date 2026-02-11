# Plan: Dark/Light Theme Support

**TL;DR**: Implement a theme system with system/light/dark modes using React Context for state management and CSS custom properties for styling. Theme toggle will be placed in the Header (top-right, standard UX pattern). The implementation requires refactoring 20+ CSS files to use CSS variables and integrating theme support for Google Maps via Map ID switching. Initial system theme detection with localStorage persistence will ensure user preferences are maintained across sessions.

**Steps**

1. **Create theme infrastructure**
   - Add [src/frontend/src/contexts/ThemeContext.tsx](src/frontend/src/contexts/ThemeContext.tsx) with `ThemeProvider` component
   - Define `ThemeMode` type (`'system' | 'light' | 'dark'`) in [src/frontend/src/types/theme.ts](src/frontend/src/types/theme.ts)
   - Implement `useTheme` hook returning `{ mode, setMode, resolvedTheme }` where `resolvedTheme` is the actual theme applied (handles system preference resolution)
   - Use `useLocalStorage` hook for persistence with key `'theme-preference'`
   - Add `prefers-color-scheme` media query listener for system mode
   - Apply `data-theme` attribute to `document.documentElement` based on resolved theme

2. **Define CSS design tokens**
   - Create [src/frontend/src/styles/themes.css](src/frontend/src/styles/themes.css) with CSS custom properties
   - Define color system for both themes:
     - Background colors: `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
     - Text colors: `--text-primary`, `--text-secondary`, `--text-muted`
     - Border colors: `--border-default`, `--border-subtle`
     - Interactive: `--color-hover`, `--color-active`, `--color-focus`
     - Semantic: `--color-error`, `--color-success`, `--color-warning`
     - Brand: `--color-brand-primary` (Google blue #4285f4)
   - Use `:root` for light theme (default), `[data-theme="dark"]` selector for dark overrides
   - Import in [src/frontend/src/index.css](src/frontend/src/index.css)

3. **Refactor CSS files to use variables**
   - Update 20+ CSS files systematically, starting with layout components:
     - [src/frontend/src/components/layout/Header.css](src/frontend/src/components/layout/Header.css)
     - [src/frontend/src/components/layout/Footer.css](src/frontend/src/components/layout/Footer.css)
     - [src/frontend/src/components/layout/Sidebar.css](src/frontend/src/components/layout/Sidebar.css)
     - [src/frontend/src/components/layout/AppLayout.css](src/frontend/src/components/layout/AppLayout.css)
   - Then feature components (Map, PlacesList, CategoryFilter, SearchControls, PlaceDetails)
   - Replace all hardcoded colors with corresponding CSS variables
   - Test each component in both themes during conversion

4. **Build ThemeToggle component**
   - Create [src/frontend/src/components/common/ThemeToggle/ThemeToggle.tsx](src/frontend/src/components/common/ThemeToggle/ThemeToggle.tsx)
   - Implement as icon button with dropdown/segmented control showing 3 options
   - Use icons: sun (light), moon (dark), monitor/auto (system)
   - Show active state clearly with visual indicator
   - Add accessible labels and ARIA attributes
   - Include [ThemeToggle.css](src/frontend/src/components/common/ThemeToggle/ThemeToggle.css) with proper theming

5. **Integrate theme toggle into Header**
   - Update [src/frontend/src/components/layout/Header.tsx](src/frontend/src/components/layout/Header.tsx)
   - Place `ThemeToggle` in top-right corner using flexbox layout
   - Maintain responsive design for mobile viewports
   - Ensure adequate spacing from title/logo

6. **Wrap App with ThemeProvider**
   - Update [src/frontend/src/App.tsx](src/frontend/src/App.tsx) to wrap `AppLayout` with `ThemeProvider`
   - Ensure provider is inside `APIProvider` but outside layout components
   - Add type exports to [src/frontend/src/types/index.ts](src/frontend/src/types/index.ts)

7. **Implement Google Maps theming**
   - Add environment variables in [.env](src/frontend/.env):
     - `VITE_GOOGLE_MAPS_MAP_ID_LIGHT`
     - `VITE_GOOGLE_MAPS_MAP_ID_DARK`
   - Update [src/frontend/src/components/Map/Map.tsx](src/frontend/src/components/Map/Map.tsx) to consume `useTheme` hook
   - Switch `mapId` prop based on `resolvedTheme`
   - Document Google Cloud Console setup in README for creating styled Map IDs
   - Fallback: If Map IDs not configured, use current default (graceful degradation)

8. **Write comprehensive tests**
   - [src/frontend/src/contexts/ThemeContext.test.tsx](src/frontend/src/contexts/ThemeContext.test.tsx):
     - Theme mode switching
     - localStorage persistence
     - System preference detection
     - Cross-tab synchronization
   - [src/frontend/src/components/common/ThemeToggle/ThemeToggle.test.tsx](src/frontend/src/components/common/ThemeToggle/ThemeToggle.test.tsx):
     - User interactions (click each option)
     - Active state rendering
     - Accessibility (keyboard navigation, ARIA)
   - Update [src/frontend/src/App.test.tsx](src/frontend/src/App.test.tsx) to test theme integration
   - Target >80% coverage per project standards

**Verification**

1. **Automated Testing (Unit Tests)**:
   ```bash
   cd src/frontend
   npm test -- ThemeContext ThemeToggle
   npm run test:coverage
   ```
   - Verify ThemeContext tests pass (theme switching, localStorage, system detection)
   - Verify ThemeToggle tests pass (interactions, accessibility)
   - Ensure >80% coverage threshold met

2. **E2E Testing with playwright-cli**:
   
   2.1. **Create E2E scenario files** in [tests/e2e/](tests/e2e/):
   - [theme-switching-light-to-dark.test.md](tests/e2e/theme-switching-light-to-dark.test.md) - Verify manual theme toggle from light to dark mode
   - [theme-switching-dark-to-light.test.md](tests/e2e/theme-switching-dark-to-light.test.md) - Verify manual theme toggle from dark to light mode
   - [theme-system-mode.test.md](tests/e2e/theme-system-mode.test.md) - Verify system mode respects OS preference
   - [theme-persistence.test.md](tests/e2e/theme-persistence.test.md) - Verify theme persists after page refresh
   - [theme-map-integration.test.md](tests/e2e/theme-map-integration.test.md) - Verify map styling updates with theme
   - [theme-all-components.test.md](tests/e2e/theme-all-components.test.md) - Verify all UI components render correctly in both themes
   
   2.2. **Run E2E tests** using playwright-cli skill:
   ```bash
   # Execute each scenario file
   # playwright-cli will generate test reports in tests/e2e/ directory
   ```
   - Verify theme toggle button appears in Header
   - Verify clicking each theme option updates the UI immediately
   - Verify CSS custom properties apply correctly in both themes
   - Verify map changes appearance (if Map IDs configured)
   - Verify localStorage stores theme preference
   - Verify no visual regressions or broken styling
   - Verify no console errors during theme switching


**Decisions**

- **Theme toggle placement**: Header top-right follows industry standard (GitHub, Twitter, VS Code pattern) - most discoverable location for users
- **State management**: React Context over Zustand - per [state-management.instructions.md](c:\Users\y.svirko\projects\map-insights\.github\instructions\state-management.instructions.md) guidelines for "simple global state that doesn't change frequently"
- **CSS approach**: CSS custom properties over runtime CSS-in-JS - better performance, follows existing plain CSS pattern, aligns with [styling.instructions.md](c:\Users\y.svirko\projects\map-insights\.github\instructions\styling.instructions.md)
- **Map theming**: Google Cloud Map ID approach - cleaner than dynamic styles, professional appearance, optional (graceful degradation if not configured)
- **System mode as default**: Respects user's OS preference, reduces decision fatigue for users who haven't set a preference
- **All CSS files refactored together**: Ensures visual consistency, prevents theming bugs from partial implementation
