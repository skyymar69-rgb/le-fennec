import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface ThemeSwitcherProps {
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ size = 'md', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? t.lightMode : t.darkMode}
      aria-label={isDark ? t.lightMode : t.darkMode}
      className={`
        inline-flex items-center gap-2 rounded-full border border-border
        bg-background hover:bg-muted transition-all duration-200
        ${size === 'sm' ? 'p-1.5' : 'px-3 py-2'}
        text-muted-foreground hover:text-foreground
      `}
    >
      {/* Toggle track */}
      <div className={`
        relative flex items-center rounded-full transition-colors duration-300
        ${size === 'sm' ? 'w-8 h-4' : 'w-9 h-5'}
        ${isDark ? 'bg-dz-green' : 'bg-muted-foreground/30'}
      `}>
        <div className={`
          absolute rounded-full bg-white shadow-sm transition-all duration-300
          ${size === 'sm' ? 'w-3 h-3 top-0.5' : 'w-4 h-4 top-0.5'}
          ${isDark
            ? (size === 'sm' ? 'left-4' : 'left-4')
            : 'left-0.5'
          }
        `} />
      </div>

      {/* Icon */}
      {isDark
        ? <Moon size={size === 'sm' ? 13 : 15} className="text-dz-green" />
        : <Sun  size={size === 'sm' ? 13 : 15} className="text-amber-500" />
      }

      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? t.lightMode : t.darkMode}
        </span>
      )}
    </button>
  );
};

export default ThemeSwitcher;
