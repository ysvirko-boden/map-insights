# E2E Test: Theme All Components

## Test Objective
Verify that all UI components render correctly and maintain proper styling in both light and dark themes.

## Prerequisites
- Application is running at http://localhost:5173 (or configured URL)
- Application has loaded successfully
- Multiple places are displayed (perform search if needed)

## Test Steps

### Part 1: Light Theme Component Verification

1. **Set to Light Theme**
   - Open application
   - Click Light theme button
   - Wait for theme to apply

2. **Header Component**
   - Verify header background is light
   - Check title text is dark and readable
   - Check theme toggle buttons are visible
   - Verify button icons are clear

3. **Sidebar Component**
   - Verify sidebar background is light
   - Check text is dark colored
   - Verify borders are subtle and visible
   - Check scrollbar is appropriately styled

4. **Search Input Component**
   - Check input background is light
   - Verify input text is dark
   - Check placeholder text is visible
   - Verify border is visible
   - Check focus state is clear (blue outline)

5. **Filter Components**
   - **Category Filter**
     - Verify category buttons have light backgrounds
     - Check text and icons are dark
     - Check selected state is distinct
     - Verify hover states work
   - **Rating Filter**
     - Check dropdown background is light
     - Verify text is dark
     - Check border is visible
   - **Result Limit**
     - Verify radio buttons are visible
     - Check labels are dark and readable

6. **PlaceCard Components**
   - Verify card backgrounds are light/white
   - Check place names are dark and bold
   - Verify ratings use gold stars
   - Check secondary text is gray/muted
   - Verify borders are light gray
   - Check hover states work
   - Verify expanded card details are readable

7. **Buttons**
   - **Load Places Button**
     - Check background is Google blue
     - Verify white text
     - Check hover state darkens
   - **Location Button**
     - Verify light background
     - Check blue icon
     - Verify shadow is visible
   - **Copy Buttons**
     - Check border is visible
     - Verify icon color

8. **Footer Component**
   - Verify footer background is light
   - Check text is muted/gray
   - Verify border on top is visible

### Part 2: Dark Theme Component Verification

9. **Switch to Dark Theme**
   - Click Dark theme button
   - Wait for theme transition

10. **Header Component (Dark)**
    - Verify header background is dark (#1a1a1a)
    - Check title text is light and readable
    - Check theme toggle buttons contrast
    - Verify dark button is highlighted

11. **Sidebar Component (Dark)**
    - Verify sidebar background is dark (#242424)
    - Check text is light colored
    - Verify borders are darker but visible
    - Check scrollbar matches dark theme

12. **Search Input Component (Dark)**
    - Check input background is dark
    - Verify input text is light
    - Check placeholder text is visible
    - Verify border is darker
    - Check focus state is clear

13. **Filter Components (Dark)**
    - **Category Filter**
      - Verify buttons have dark backgrounds
      - Check text and icons are light
      - Check selected state is distinct
      - Verify hover states work
    - **Rating Filter**
      - Check dropdown background is dark
      - Verify text is light
      - Check border is visible
    - **Result Limit**
      - Verify radio buttons are visible
      - Check labels are light

14. **PlaceCard Components (Dark)**
    - Verify card backgrounds are dark (#242424)
    - Check place names are light
    - Verify ratings use appropriate colors
    - Check secondary text is lighter gray
    - Verify borders are dark gray
    - Check hover states work
    - Verify expanded card details are readable

15. **Buttons (Dark)**
    - **Load Places Button**
      - Check updated blue color
      - Verify white text
      - Check hover state
    - **Location Button**
      - Verify dark background
      - Check icon color
    - **Copy Buttons**
      - Check border visibility
      - Verify icon color adapts

16. **Footer Component (Dark)**
    - Verify footer background is dark
    - Check text is light gray
    - Verify border is dark gray

### Part 3: Component States

17. **Interactive States**
    - Test hover states on various elements
    - Check focus states (tab through page)
    - Verify active states
    - Check disabled states (if applicable)

18. **Loading States**
    - Trigger loading state (search places)
    - Verify spinner colors match theme
    - Check loading text is visible

19. **Error States**
    - Trigger error state (if possible)
    - Verify error colors are appropriate
    - Check error text is readable

20. **Empty States**
    - Clear results or filters
    - Verify empty state messages are readable
    - Check icons are visible

### Part 4: Contrast and Readability

21. **Text Contrast Check**
    - Verify all text has sufficient contrast in both themes
    - Check headings, body text, and muted text
    - Verify links are distinguishable

22. **Border Visibility**
    - Check all borders are visible in both themes
    - Verify card separators
    - Check input borders

23. **Icon Visibility**
    - Verify all icons are clearly visible
    - Check emoji/unicode icons (☀️🌙💻)
    - Verify Material Icons or custom icons

### Part 5: Quick Theme Toggle

24. **Rapid Theme Switching**
    - Quickly toggle between themes 5-6 times
    - Verify no flashing or broken styles
    - Check all components update correctly
    - Verify no stuck/partial theme states

## Expected Results
- All components render correctly in both themes
- Text has sufficient contrast and is readable
- Borders and separators are visible
- All interactive states work properly
- No visual glitches or broken layouts
- Smooth transitions between themes
- Consistent styling across all components

## Pass/Fail Criteria
- ✅ Pass: All components display correctly in both themes with proper contrast
- ❌ Fail: Any component has incorrect styling, poor contrast, or broken appearance

## Visual Regression Checklist
- [ ] Header
- [ ] Footer
- [ ] Sidebar
- [ ] Search input
- [ ] Category filter
- [ ] Rating filter
- [ ] Result limit selector
- [ ] Place cards (normal)
- [ ] Place cards (expanded)
- [ ] Load places button
- [ ] Location button
- [ ] Copy buttons
- [ ] Map container
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Hover states
- [ ] Focus states

## Notes
- Take screenshots of key components in both themes for documentation
- Check with browser zoom at 100%, 125%, and 150%
- Test in different viewport sizes (desktop, tablet, mobile)
- Verify theme colors match design tokens in `themes.css`
