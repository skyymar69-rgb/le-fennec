import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Language } from '../../types';

interface LangOption {
  code:  Language;
  label: string;
  flag:  string;  // emoji flag
  dir:   'ltr' | 'rtl';
}

const LANGUAGES: LangOption[] = [
  { code: 'fr', label: 'Français',  flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', label: 'العربية',   flag: '🇩🇿', dir: 'rtl' },
  { code: 'en', label: 'English',   flag: '🇬🇧', dir: 'ltr' },
];

interface LanguageSwitcherProps {
  size?:       'sm' | 'md';
  variant?:    'default' | 'ghost';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  size    = 'md',
  variant = 'default',
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === language)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setOpen(false);
  };

  const btnBase = `
    inline-flex items-center gap-1.5 rounded-full border transition-all duration-150 font-medium
    ${size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'}
  `;
  const btnVariant = variant === 'ghost'
    ? 'border-transparent bg-white/10 text-white hover:bg-white/20'
    : 'border-border bg-background hover:bg-muted text-foreground';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`${btnBase} ${btnVariant}`}
        aria-label={t.language}
        aria-expanded={open}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown
          size={11}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} opacity-60`}
        />
      </button>

      {open && (
        <div className="
          absolute top-full mt-1.5 right-0 z-50
          w-36 bg-card border border-border rounded-xl shadow-lg
          overflow-hidden animate-fade-up
        ">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2.5 text-left
                text-sm transition-colors duration-150
                hover:bg-muted
                ${lang.code === language
                  ? 'bg-primary/5 text-primary font-semibold'
                  : 'text-foreground'
                }
              `}
              dir={lang.dir}
            >
              <span className="text-base leading-none flex-shrink-0">{lang.flag}</span>
              <span className="flex-1">{lang.label}</span>
              {lang.code === language && (
                <span className="w-1.5 h-1.5 rounded-full bg-dz-green flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
