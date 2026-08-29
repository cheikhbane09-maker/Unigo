import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { IconSearch, IconCap, IconDoc, IconBus, IconCalendar } from './Icons.jsx';

/** Moteur de recherche global multi-modules avec suggestions instantanées. */
export default function GlobalSearch({ variant = 'nav' }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setResults(await get(`/search?q=${encodeURIComponent(q.trim())}`));
        setOpen(true);
      } catch {
        setResults(null);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/universites?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  };

  const groups = results
    ? [
        { key: 'universities', icon: IconCap, label: t('nav.universities'), items: results.universities, to: (i) => `/universites/${i.slug}`, sub: (i) => i.city },
        { key: 'programs', icon: IconCap, label: t('uni.programs'), items: results.programs, to: (i) => `/universites/${i.university.slug}`, sub: (i) => `${i.field} · ${i.university.name}` },
        { key: 'procedures', icon: IconDoc, label: t('nav.procedures'), items: results.procedures, to: (i) => `/demarches/${i.slug}`, sub: (i) => i.category, title: (i) => i.title },
        { key: 'transport', icon: IconBus, label: t('nav.transport'), items: results.transport, to: () => '/transport', sub: (i) => i.mode },
        { key: 'events', icon: IconCalendar, label: t('nav.activities'), items: results.events, to: () => '/activites', sub: (i) => i.city, title: (i) => i.title },
      ].filter((g) => g.items?.length)
    : [];

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} role="search">
        <div className="relative">
          <IconSearch
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => results && setOpen(true)}
            placeholder={t('home.search.placeholder')}
            aria-label={t('common.search')}
            className={
              variant === 'hero'
                ? 'input py-3.5 pl-11 text-base shadow-lg ring-0'
                : 'input py-2 pl-10 text-sm'
            }
          />
        </div>
      </form>

      {open && groups.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl bg-white p-2 shadow-xl ring-1 ring-ink-100">
          {groups.map((g) => (
            <div key={g.key} className="mb-1 last:mb-0">
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                {g.label}
              </p>
              {g.items.map((item) => (
                <Link
                  key={`${g.key}-${item.id}`}
                  to={g.to(item)}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 rounded-xl px-3 py-2 hover:bg-ink-50"
                >
                  <g.icon size={18} className="mt-0.5 shrink-0 text-brand-600" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink-800">
                      {g.title ? g.title(item) : item.name}
                    </span>
                    <span className="block truncate text-xs text-ink-400">{g.sub(item)}</span>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
