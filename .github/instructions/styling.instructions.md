---
applyTo: "src/frontend/**/*.css,src/frontend/**/*.scss"
---

# Styling Guidelines

## CSS Modules (Default)

### File Naming
- Name CSS Module files: `ComponentName.module.css`
- Place CSS Module file next to component file

### Class Naming
- Use camelCase for class names in CSS Modules
- Use descriptive names that indicate purpose, not appearance
- Follow BEM-like patterns for variants

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

.buttonPrimary {
  background: var(--primary-color);
}

.buttonSecondary {
  background: var(--secondary-color);
}

.buttonLarge {
  padding: 0.75rem 1.5rem;
}
```

### Usage in Components
```typescript
import styles from './Button.module.css';

// Compose classes
<button className={`${styles.button} ${styles.buttonPrimary}`}>

// Or use helper
import clsx from 'clsx';
<button className={clsx(styles.button, styles[variant], {
  [styles.buttonDisabled]: disabled
})}>
```

### Best Practices
- Keep specificity low (avoid nesting >2 levels)
- Use CSS custom properties for theming
- Avoid `!important`
- Group related styles together
- Use consistent spacing units (rem, em)

## CSS Custom Properties (Variables)

### Definition
```css
/* globals.css or theme.css */
:root {
  /* Colors */
  --primary-color: #0066cc;
  --secondary-color: #6c757d;
  --error-color: #dc3545;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-family: system-ui, -apple-system, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  
  /* Borders */
  --border-radius: 0.25rem;
  --border-color: #e0e0e0;
}
```

### Usage
```css
.card {
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}
```

## Responsive Design

### Mobile First
```css
/* Base styles (mobile) */
.container {
  padding: var(--spacing-sm);
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-lg);
  }
}
```

### Breakpoints
```css
/* Use consistent breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
```

## Layout Patterns

### Flexbox
```css
.flexContainer {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  justify-content: space-between;
}
```

### Grid
```css
.gridContainer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
}
```

### Container Queries (Modern)
```css
@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

## Animations

### Transitions
```css
.button {
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(0);
}
```

### Keyframes
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal {
  animation: fadeIn 0.3s ease;
}
```

### Performance
- Animate transform and opacity only when possible
- Use `will-change` sparingly
- Prefer CSS transitions over JS animations
- Use `prefers-reduced-motion` for accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Accessibility

### Focus Styles
```css
.button:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
```

### Color Contrast
- Ensure text has sufficient contrast (WCAG AA: 4.5:1)
- Don't rely on color alone to convey information
- Test with browser DevTools accessibility features

### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #1a1a1a;
    --text-color: #ffffff;
  }
}
```

## Performance Best Practices

### Avoid Expensive Properties
- Minimize use of box-shadow, filter, backdrop-filter
- Avoid frequent layout recalculations
- Use `contain` property when appropriate

### Optimize Images
```css
.image {
  width: 100%;
  height: auto;
  display: block;
}
```

### Font Loading
```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Avoid invisible text */
}
```

## Organization

### File Structure
```
components/
  Button/
    Button.tsx
    Button.module.css
    Button.test.tsx
```

### Import Order
```css
/* 1. Resets/normalization */
/* 2. Variables */
/* 3. Base styles */
/* 4. Layout */
/* 5. Components */
/* 6. Utilities */
```

## Anti-Patterns

### Avoid
- Inline styles (except for dynamic values)
- Global class names in CSS Modules
- Deep nesting (>3 levels)
- Magic numbers (use variables)
- Fixed widths/heights when not necessary
- Overriding library styles with !important
- ID selectors for styling
- Overly specific selectors

## Tools

### PostCSS
- Autoprefixer for vendor prefixes
- CSS nesting (if desired)
- PurgeCSS for unused styles in production

### Linting
```json
// .stylelintrc
{
  "extends": "stylelint-config-standard",
  "rules": {
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]+$",
    "max-nesting-depth": 3
  }
}
```