/* ===================================================================
 * CADRE COMMUN AUX PAGES DE COMPTE
 * -------------------------------------------------------------------
 * Connexion, Inscription et Mot de passe oublié partagent la même
 * présentation : un visuel à gauche, le formulaire à droite.
 * On l'écrit une seule fois ici et les trois pages s'en servent.
 * =================================================================== */

import { Link } from 'react-router-dom';

export default function CadreAuth({ titre, sousTitre, children, bas }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      {/* Colonne visuelle — cachée sur téléphone pour laisser la place au formulaire */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 lg:block">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_25%_25%,white_1.5px,transparent_1.5px)] [background-size:26px_26px]" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-lg font-bold">
              U
            </span>
            <span className="text-xl font-extrabold">UNIGO</span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-3xl font-extrabold leading-tight text-white">
              Étudier et vivre au Sénégal, sans se perdre.
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li>🎓 L'annuaire des établissements et leurs contacts</li>
              <li>🚌 Les transports de Dakar et leurs tarifs</li>
              <li>🎉 Les sorties et activités pour s'intégrer</li>
            </ul>
          </div>

          {/* On ne promet pas une securite qu'on n'a pas encore : dans cette
              version sans serveur, les comptes vivent dans le navigateur. */}
          <p className="text-xs text-white/60">
            Version de démonstration — les comptes sont enregistrés dans ce navigateur,
            en attendant le branchement du serveur.
          </p>
        </div>
      </div>

      {/* Colonne formulaire */}
      <div className="flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-extrabold text-ardoise-900 sm:text-3xl">{titre}</h1>
          {sousTitre && <p className="mt-2 text-sm text-ardoise-600">{sousTitre}</p>}

          <div className="mt-8">{children}</div>

          {bas && <div className="mt-6 text-center text-sm text-ardoise-600">{bas}</div>}
        </div>
      </div>
    </div>
  );
}

/* Message rouge affiché en cas d'erreur dans un formulaire. */
export function Erreur({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  );
}

/* Message d'information (fond sable) : sert par exemple à expliquer
   « tu dois te connecter pour accéder à cette page ». */
export function Info({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-sable-100 bg-sable-50 p-3 text-sm text-sable-700">
      <span aria-hidden="true">🔒</span>
      <span>{message}</span>
    </div>
  );
}

/* Message vert affiché quand tout s'est bien passé. */
export function Succes({ message }) {
  if (!message) return null;
  return (
    <div role="status" className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-800">
      {message}
    </div>
  );
}
