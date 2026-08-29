import { useI18n } from '../i18n/I18nContext.jsx';

export default function Spinner({ label }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink-400" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-100 border-t-brand-600" />
      <span className="text-sm">{label || t('common.loading')}</span>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  const { t } = useI18n();
  return (
    <div className="card border border-red-100 bg-red-50/60 p-5 text-sm text-red-800">
      <p className="font-medium">{message || t('common.error')}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-3">
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-14 text-center">
      <div className="mb-1 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
        <span className="text-xl">∅</span>
      </div>
      <p className="font-display text-lg text-ink-800">{title}</p>
      {description && <p className="max-w-md text-sm text-ink-400">{description}</p>}
      {action}
    </div>
  );
}
