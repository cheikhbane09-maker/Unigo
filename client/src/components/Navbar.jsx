import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import GlobalSearch from './GlobalSearch.jsx';
import { IconCap, IconMenu, IconX, IconHeart, IconScale, IconUser, IconShield, IconLogout } from './Icons.jsx';

function LanguageSwitcher() {
  const { locale, setLocale, languages } = useI18n();
  return (
    <div className="inline-flex rounded-lg bg-ink-100 p-0.5" role="group" aria-label="Langue">
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          aria-pressed={locale === l.code}
          className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
            locale === l.code ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-600 hover:text-ink-800'
          }`}
        >
          {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Navbar() {
  const { t } = useI18n();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { ids } = useCompare();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/universites', label: t('nav.universities') },
    { to: '/demarches', label: t('nav.procedures') },
    { to: '/temoignages', label: t('nav.testimonials') },
    { to: '/transport', label: t('nav.transport') },
    { to: '/activites', label: t('nav.activities') },
  ];

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-800'
    }`;

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/85 backdrop-blur">
      <div className="container-page">
        <div className="flex h-16 items-center gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="UNIGO — accueil">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-white">
              <IconCap size={20} />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-ink-900">
              UNI<span className="text-brand-600">GO</span>
            </span>
          </Link>

          <nav className="ml-2 hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden w-64 xl:block">
            <GlobalSearch />
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <Link
              to="/comparateur"
              className="relative hidden rounded-lg p-2 text-ink-600 hover:bg-ink-100 sm:block"
              aria-label={t('nav.compare')}
              title={t('nav.compare')}
            >
              <IconScale size={20} />
              {ids.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-sand-500 px-1 text-[10px] font-bold text-white">
                  {ids.length}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden items-center gap-1 lg:flex">
                <Link to="/favoris" className="rounded-lg p-2 text-ink-600 hover:bg-ink-100" title={t('nav.favorites')}>
                  <IconHeart size={20} />
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="rounded-lg p-2 text-ink-600 hover:bg-ink-100" title={t('nav.admin')}>
                    <IconShield size={20} />
                  </Link>
                )}
                <Link to="/profil" className="btn-secondary !px-3">
                  <IconUser size={18} />
                  <span className="max-w-[9rem] truncate">{user.fullName.split(' ')[0]}</span>
                </Link>
                <button type="button" onClick={handleLogout} className="btn-ghost !px-2" title={t('nav.logout')}>
                  <IconLogout size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Link to="/connexion" className="btn-ghost">
                  {t('nav.login')}
                </Link>
                <Link to="/inscription" className="btn-primary">
                  {t('nav.register')}
                </Link>
              </div>
            )}

            <button
              type="button"
              className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={t('nav.menu')}
            >
              {open ? <IconX size={22} /> : <IconMenu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-ink-100 py-4 lg:hidden">
            <div className="mb-3">
              <GlobalSearch />
            </div>
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
              <NavLink to="/comparateur" className={linkClass} onClick={() => setOpen(false)}>
                {t('nav.compare')} {ids.length > 0 && `(${ids.length})`}
              </NavLink>
            </nav>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-4">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <>
                  <Link to="/favoris" className="btn-secondary" onClick={() => setOpen(false)}>
                    {t('nav.favorites')}
                  </Link>
                  <Link to="/profil" className="btn-secondary" onClick={() => setOpen(false)}>
                    {t('nav.profile')}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="btn-secondary" onClick={() => setOpen(false)}>
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="btn-ghost">
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/connexion" className="btn-secondary" onClick={() => setOpen(false)}>
                    {t('nav.login')}
                  </Link>
                  <Link to="/inscription" className="btn-primary" onClick={() => setOpen(false)}>
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
