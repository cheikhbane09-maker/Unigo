import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext.jsx';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-extrabold text-brand-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-ink-900">{t('common.notFound')}</h1>
      <p className="prose-unigo mt-2 max-w-md">{t('common.notFoundDesc')}</p>
      <Link to="/" className="btn-primary mt-7">{t('nav.home')}</Link>
    </div>
  );
}
