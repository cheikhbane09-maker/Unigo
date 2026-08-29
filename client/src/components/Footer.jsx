import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext.jsx';
import { IconCap } from './Icons.jsx';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-ink-100 bg-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-white">
                <IconCap size={20} />
              </span>
              <span className="font-display text-lg font-extrabold text-ink-900">
                UNI<span className="text-brand-600">GO</span>
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-ink-400">{t('footer.tagline')}</p>
            <p className="mt-4 text-xs text-ink-400">{t('footer.project')}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-800">{t('footer.modules')}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-400">
              <li><Link to="/universites" className="hover:text-brand-700">{t('nav.universities')}</Link></li>
              <li><Link to="/transport" className="hover:text-brand-700">{t('nav.transport')}</Link></li>
              <li><Link to="/activites" className="hover:text-brand-700">{t('nav.activities')}</Link></li>
              <li><Link to="/demarches" className="hover:text-brand-700">{t('nav.procedures')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink-800">{t('footer.account')}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-400">
              <li><Link to="/connexion" className="hover:text-brand-700">{t('nav.login')}</Link></li>
              <li><Link to="/inscription" className="hover:text-brand-700">{t('nav.register')}</Link></li>
              <li><Link to="/favoris" className="hover:text-brand-700">{t('nav.favorites')}</Link></li>
              <li><Link to="/comparateur" className="hover:text-brand-700">{t('nav.compare')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-ink-100 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} UNIGO — {t('footer.rights')}</p>
          <p>Kaiju · Binta Comé · Maguette Niang</p>
        </div>
      </div>
    </footer>
  );
}
