/**
 * ThemeToggle component
 * Provides UI for switching between system/light/dark themes
 */

import { useTheme } from '../../../contexts/ThemeContext';
import type { ThemeMode } from '../../../types/theme';
import './ThemeToggle.css';

const THEME_OPTIONS: Array<{
  mode: ThemeMode;
  label: string;
  icon: string;
  ariaLabel: string;
}> = [
  {
    mode: 'light',
    label: 'Light',
    icon: '☀️',
    ariaLabel: 'Switch to light theme',
  },
  {
    mode: 'dark',
    label: 'Dark',
    icon: '🌙',
    ariaLabel: 'Switch to dark theme',
  },
  {
    mode: 'system',
    label: 'System',
    icon: '💻',
    ariaLabel: 'Use system theme',
  },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <div className="theme-toggle">
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.mode}
          type="button"
          className={`theme-toggle-button ${mode === option.mode ? 'theme-toggle-button--active' : ''}`}
          onClick={() => handleThemeChange(option.mode)}
          aria-label={option.ariaLabel}
          aria-pressed={mode === option.mode}
          title={option.label}
        >
          <span className="theme-toggle-icon" role="img" aria-hidden="true">
            {option.icon}
          </span>
        </button>
      ))}
    </div>
  );
}
