/* ===================================================================
 * MODULE TRANSPORT — Binta Comé      adresse : /transport
 * -------------------------------------------------------------------
 * Page de départ : les moyens de transport de Dakar et leurs tarifs.
 * Les données viennent de l'API : GET /api/transport
 *
 * À FAIRE (Binta) :
 *  - TODO : ajouter les trajets fréquents (aéroport ↔ campus, etc.)
 *  - TODO : filtres par zone et par budget
 *  - TODO : carte interactive des arrêts et gares
 *  - TODO : annuaire des prestataires (Yango, Heetch, compagnies)
 * =================================================================== */

import { formaterFcfa } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { EnTetePage } from '../components/Layout.jsx';
import { Chargement, ErreurChargement } from '../components/Etat.jsx';

export default function Transport() {
  const { donnees, erreur, chargement } = useApi('/transport');

  if (chargement) return <Chargement texte="Chargement des transports…" />;
  if (erreur) {
    return (
      <div className="conteneur py-10">
        <ErreurChargement message={erreur} />
      </div>
    );
  }

  const moyensTransport = donnees || [];

  return (
    <>
      <EnTetePage
        titre="Se déplacer à Dakar"
        sousTitre="Les moyens de transport, leurs tarifs indicatifs et les conseils à connaître."
      />

      <div className="conteneur py-10">
        {/* Les cartes des moyens de transport */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {moyensTransport.map((moyen) => (
            <article key={moyen.id} className="carte flex flex-col">
              <h2 className="text-lg font-bold text-ardoise-900">{moyen.nom}</h2>

              <p className="mt-1 text-sm font-semibold text-brand-700">
                {formaterFcfa(moyen.prixMin)} – {formaterFcfa(moyen.prixMax)}
              </p>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-ardoise-600">
                {moyen.description}
              </p>

              <p className="mt-4 rounded-xl bg-ardoise-100 p-3 text-xs text-ardoise-600">
                💡 {moyen.conseil}
              </p>
            </article>
          ))}
        </div>

        {/* Le même contenu sous forme de tableau récapitulatif */}
        <h2 className="mt-14 text-xl font-bold text-ardoise-900">Récapitulatif des tarifs</h2>
        <p className="mt-2 text-sm text-ardoise-600">
          Ces fourchettes valent pour l'ensemble de l'agglomération de Dakar, quel que soit le campus.
        </p>

        <div className="carte mt-5 overflow-x-auto p-0">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-ardoise-100 bg-ardoise-50 text-xs uppercase tracking-wide text-ardoise-400">
                <th className="p-4">Transport</th>
                <th className="p-4">Tarif indicatif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ardoise-100">
              {moyensTransport.map((moyen) => (
                <tr key={moyen.id}>
                  <td className="p-4 font-medium text-ardoise-900">{moyen.nom}</td>
                  <td className="p-4 text-ardoise-600">
                    {moyen.prixMin} – {moyen.prixMax} F
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 rounded-2xl bg-sable-50 p-4 text-sm text-sable-700">
          Page en cours de développement par <strong>Binta Comé</strong> sur la branche
          <code className="mx-1 rounded bg-white px-1.5 py-0.5">feature/transport-binta</code>.
          Prochaine étape : les trajets fréquents entre l'aéroport, les campus et le centre-ville.
        </p>
      </div>
    </>
  );
}
