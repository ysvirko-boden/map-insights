# Frontend Development Checklist

Use this checklist to ensure quality and consistency in your React TypeScript SPA development.

## 🎯 Before Starting Development

- [ ] Read [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md)
- [ ] Read [SETUP.md](SETUP.md)
- [ ] Install VS Code recommended extensions
- [ ] Copy `.env.example` to `.env.local` and configure
- [ ] Run `npm install`
- [ ] Verify setup with `npm test` and `npm run build`

## 📝 For Each New Component

### Planning
- [ ] Determine component responsibility (single purpose)
- [ ] Identify props and their types
- [ ] Consider reusability (common vs feature-specific)
- [ ] Plan component structure

### Implementation
- [ ] Create component folder (if complex) or file
- [ ] Define TypeScript interface for props
- [ ] Implement component with proper typing
- [ ] Use path aliases for imports (`@components/`, etc.)
- [ ] Add proper accessibility attributes
- [ ] Create CSS module or styled component (if needed)
- [ ] Export via index.ts for clean imports

### Testing
- [ ] Create `.test.tsx` file
- [ ] Test rendering
- [ ] Test user interactions
- [ ] Test edge cases
- [ ] Test accessibility
- [ ] Achieve >80% coverage
- [ ] All tests pass

### Code Quality
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] No console.log statements
- [ ] No commented code
- [ ] Meaningful variable names

## 🪝 For Each New Custom Hook

### Planning
- [ ] Identify reusable logic
- [ ] Define hook parameters and return type
- [ ] Consider side effects and dependencies

### Implementation
- [ ] Create hook file in `src/hooks/`
- [ ] Use proper TypeScript generics if needed
- [ ] Handle edge cases and errors
- [ ] Document hook usage with JSDoc
- [ ] Export hook

### Testing
- [ ] Create `.test.ts` file
- [ ] Use `renderHook` from Testing Library
- [ ] Test initial state
- [ ] Test state updates
- [ ] Test side effects
- [ ] Test cleanup

## 📄 For Each New Page Component

### Planning
- [ ] Define page route
- [ ] Identify required data
- [ ] Plan page layout and sections

### Implementation
- [ ] Create page component in `src/pages/`
- [ ] Implement data fetching (if needed)
- [ ] Use smaller components for sections
- [ ] Add proper meta tags (if using React Helmet)
- [ ] Implement loading and error states

### Testing
- [ ] Test page rendering
- [ ] Test data loading states
- [ ] Test error states
- [ ] Test navigation (if applicable)

## 🔧 For New Utility Functions

### Implementation
- [ ] Create in `src/utils/`
- [ ] Add proper TypeScript typing
- [ ] Make pure functions when possible
- [ ] Add JSDoc documentation

### Testing
- [ ] Create `.test.ts` file
- [ ] Test with various inputs
- [ ] Test edge cases
- [ ] Test error handling

## 🔌 For API Integration

### Planning
- [ ] Define API endpoints
- [ ] Define request/response types

### Implementation
- [ ] Create service file in `src/services/`
- [ ] Define TypeScript interfaces for API data
- [ ] Implement API client functions
- [ ] Add error handling
- [ ] Use environment variables for URLs

### Testing
- [ ] Mock API calls in tests
- [ ] Test success scenarios
- [ ] Test error scenarios
- [ ] Test loading states

## 🎨 For Styling

### Planning
- [ ] Determine styling approach (CSS, CSS Modules, etc.)
- [ ] Follow design system (if exists)
- [ ] Consider responsive design

### Implementation
- [ ] Create CSS file co-located with component
- [ ] Use semantic class names
- [ ] Avoid inline styles (except dynamic values)
- [ ] Use CSS variables for theming
- [ ] Ensure responsive design
- [ ] Test in different viewports

## ♿ Accessibility Checklist

- [ ] Use semantic HTML elements
- [ ] Add ARIA labels where needed
- [ ] Ensure keyboard navigation works
- [ ] Add alt text to images
- [ ] Ensure sufficient color contrast
- [ ] Test with screen reader (if possible)
- [ ] Add focus indicators

## 🧪 Testing Checklist

### Component Tests
- [ ] Render tests
- [ ] Prop tests
- [ ] User interaction tests (click, type, etc.)
- [ ] Conditional rendering tests
- [ ] Accessibility tests

### Hook Tests
- [ ] Initial state tests
- [ ] State update tests
- [ ] Side effect tests
- [ ] Cleanup tests

### Integration Tests
- [ ] User flow tests
- [ ] API integration tests
- [ ] Navigation tests

## 📦 Before Committing

- [ ] Run `npm run type-check` - No errors
- [ ] Run `npm run lint:fix` - No errors
- [ ] Run `npm run format` - Code formatted
- [ ] Run `npm test` - All tests pass
- [ ] Run `npm run build` - Build succeeds
- [ ] Review changed files
- [ ] Write clear commit message
- [ ] Remove console.logs and debuggers

## 🚀 Before Deployment

### Code Quality
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code coverage >80%
- [ ] No security vulnerabilities (`npm audit`)

### Performance
- [ ] Lazy load routes
- [ ] Optimize images
- [ ] Check bundle size
- [ ] Remove unused dependencies
- [ ] Enable compression

### Environment
- [ ] Environment variables configured
- [ ] API endpoints correct for environment
- [ ] Error tracking configured (if applicable)
- [ ] Analytics configured (if applicable)

### Testing
- [ ] Test in production mode (`npm run preview`)
- [ ] Test in different browsers
- [ ] Test on mobile devices
- [ ] Test with slow network
- [ ] Test error scenarios

### Documentation
- [ ] README updated
- [ ] API documentation current
- [ ] Changelog updated
- [ ] Deployment instructions current

## 🔄 Maintenance Checklist

### Weekly
- [ ] Review and update dependencies
- [ ] Check for security advisories
- [ ] Review code coverage trends
- [ ] Monitor bundle size

### Monthly
- [ ] Update dependencies (`npm update`)
- [ ] Review and refactor technical debt
- [ ] Update documentation
- [ ] Review and improve tests

### Quarterly
- [ ] Major dependency updates
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] Security audit

## 📋 Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling present
- [ ] No regressions

### Code Quality
- [ ] Follows project patterns
- [ ] No code duplication
- [ ] Proper TypeScript usage
- [ ] Clean and readable
- [ ] Properly commented

### Testing
- [ ] Tests exist and pass
- [ ] Good coverage
- [ ] Tests are meaningful
- [ ] Edge cases tested

### Performance
- [ ] No unnecessary re-renders
- [ ] Proper memoization
- [ ] Efficient algorithms
- [ ] No memory leaks

### Security
- [ ] No sensitive data exposed
- [ ] Input validation present
- [ ] XSS protection
- [ ] CSRF protection (if applicable)

### Accessibility
- [ ] Semantic HTML
- [ ] ARIA attributes
- [ ] Keyboard navigation
- [ ] Screen reader compatible

## 🎓 Learning Checklist

### React
- [ ] Understand component lifecycle
- [ ] Master hooks (useState, useEffect, etc.)
- [ ] Learn context API
- [ ] Understand reconciliation
- [ ] Learn performance optimization

### TypeScript
- [ ] Understand basic types
- [ ] Learn generics
- [ ] Understand utility types
- [ ] Learn type guards
- [ ] Master type inference

### Testing
- [ ] Learn Testing Library principles
- [ ] Master user-event
- [ ] Understand mocking
- [ ] Learn async testing
- [ ] Understand coverage reports

### Tools
- [ ] Master Vite configuration
- [ ] Understand ESLint rules
- [ ] Learn Prettier options
- [ ] Master Git workflow
- [ ] Learn debugging tools

---

**Print this checklist and keep it handy while developing!** ✅
