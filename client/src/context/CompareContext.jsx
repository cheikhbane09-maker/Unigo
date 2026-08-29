import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CompareContext = createContext(null);
const KEY = 'unigo_compare';
const MAX = 4;

/** Panier de comparaison (jusqu'à 4 établissements), conservé entre les visites. */
export function CompareProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw).slice(0, MAX) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids]);

  const value = useMemo(
    () => ({
      ids,
      max: MAX,
      has: (id) => ids.includes(id),
      toggle: (id) =>
        setIds((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX ? [...prev, id] : prev
        ),
      clear: () => setIds([]),
    }),
    [ids]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare doit être utilisé à l\'intérieur de <CompareProvider>');
  return ctx;
}
