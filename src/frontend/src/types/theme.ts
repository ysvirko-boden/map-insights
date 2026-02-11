/**
 * Theme system types
 */

/**
 * Available theme modes
 * - 'system': Follow OS color scheme preference
 * - 'light': Force light theme
 * - 'dark': Force dark theme
 */
export type ThemeMode = 'system' | 'light' | 'dark';

/**
 * Resolved theme value (actual theme being displayed)
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * Theme context value
 */
export interface ThemeContextValue {
  /** Current theme mode setting */
  mode: ThemeMode;
  /** Resolved theme (handles system preference) */
  resolvedTheme: ResolvedTheme;
  /** Update theme mode */
  setMode: (mode: ThemeMode) => void;
}
