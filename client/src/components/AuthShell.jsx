import { Link } from 'react-router-dom';
import { IconCap, IconShield, IconCheck } from './Icons.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

/** Mise en page commune aux écrans d'authentification (2 colonnes). */
export default function AuthShell({ title, subtitle, children, footer }) {
  const { t } = useI18n();

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Colonne visuelle */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 lg:block">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_25%_25%,white_1.5px,transparent_1.5px)] [background-size:26px_26px]" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-sand-400/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
              <IconCap size={22} />
            </span>
            <span className="font-display text-xl font-extrabold">UNIGO</span>
          </Link>

          <div className="max-w-md">
            <h2 className="font-display text-3xl font-extrabold leading-tight text-white">
              {t('home.title')}
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              {[
                t('home.module.university.desc'),
                t('home.module.transport.desc'),
                t('home.module.activities.desc'),
              ].map((line) => (
                <li key={line} className="flex gap-2.5">
                  <IconCheck size={18} className="mt-0.5 shrink-0 text-brand-300" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <p className="flex items-center gap-2 text-xs text-white/60">
            <IconShield size={16} /> Connexion sécurisée — mots de passe chiffrés (bcrypt).
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-400">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-ink-400">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function FormError({ message, details }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
      <p className="font-medium">{message}</p>
      {details?.length > 0 && (
        <ul className="mt-1 list-inside list-disc text-xs">
          {details.map((d, i) => (
            <li key={i}>{d.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FormSuccess({ message }) {
  if (!message) return null;
  return (
    <div role="status" className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-800">
      {message}
    </div>
  );
}
