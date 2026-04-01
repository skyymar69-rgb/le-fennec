import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import type { Language, Dir, Translation } from '../types';
import { fr } from '../i18n/fr';
import { ar } from '../i18n/ar';
import { en } from '../i18n/en';

const TRANSLATIONS: Record<Language, Translation> = { fr, ar, en };

interface LangCtx {
  language: Language;
  t: Translation;
  dir: Dir;
  setLanguage: (l: Language) => void;
}

const LangContext = createContext<LangCtx | undefined>(undefined);

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [language, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fennec_lang') as Language | null;
      if (stored && ['fr', 'ar', 'en'].includes(stored)) return stored;
    }
    return 'fr';
  });

  const dir: Dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    const html = document.documentElement;
    html.lang = language;
    html.dir  = dir;
    document.body.style.fontFamily = language === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif";
    localStorage.setItem('fennec_lang', language);
  }, [language, dir]);

  const setLanguage = (l: Language) => setLangState(l);

  return (
    <LangContext.Provider value={{ language, t: TRANSLATIONS[language], dir, setLanguage }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLanguage = (): LangCtx => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
