/* Pied de page, affiché sur toutes les pages. */

import { Link } from 'react-router-dom';

export default function Footer() {
  const annee = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-ardoise-100 bg-white">
      <div className="conteneur py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-lg font-bold text-white">
                U
              </span>
              <span className="text-lg font-extrabold text-ardoise-900">
                UNI<span className="text-brand-600">GO</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ardoise-600">
              La plateforme des étudiants étrangers au Sénégal : université, transport, activités.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ardoise-900">Les modules</h2>
            <ul className="mt-3 space-y-2 text-sm text-ardoise-600">
              <li><Link to="/universites" className="hover:text-brand-700">Universités</Link></li>
              <li><Link to="/transport" className="hover:text-brand-700">Transport</Link></li>
              <li><Link to="/activites" className="hover:text-brand-700">Activités</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ardoise-900">Mon compte</h2>
            <ul className="mt-3 space-y-2 text-sm text-ardoise-600">
              <li><Link to="/connexion" className="hover:text-brand-700">Connexion</Link></li>
              <li><Link to="/inscription" className="hover:text-brand-700">Créer un compte</Link></li>
              <li><Link to="/mot-de-passe-oublie" className="hover:text-brand-700">Mot de passe oublié</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-ardoise-100 pt-6 text-xs text-ardoise-400 sm:flex-row sm:justify-between">
          <p>© {annee} UNIGO — Projet académique</p>
          <p>Kaiju · Binta Comé · Maguette Niang</p>
        </div>
      </div>
    </footer>
  );
}
