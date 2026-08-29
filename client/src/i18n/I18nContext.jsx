import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations, LANGUAGES } from './translations.js';

const I18nContext = createContext(null);
const STORAGE_KEY = 'unigo_locale';

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && translations[saved]) return saved;
      const browser = navigator.language?.slice(0, 2);
      return translations[browser] ? browser : 'fr';
    } catch {
      return 'fr';
    }
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }, [locale]);

  const value = useMemo(() => {
    const dict = translations[locale] || translations.fr;
    return {
      locale,
      languages: LANGUAGES,
      setLocale: (code) => translations[code] && setLocaleState(code),
      // t('cle') renvoie la traduction, ou la clé elle-même si absente.
      t: (key, fallback) => dict[key] ?? translations.fr[key] ?? fallback ?? key,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n doit être utilisé à l\'intérieur de <I18nProvider>');
  return ctx;
}
