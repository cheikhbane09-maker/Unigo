/* ===================================================================
 * FICHE D'UN ÉTABLISSEMENT    adresse : /universites/cesag
 * -------------------------------------------------------------------
 * useParams() lit la partie variable de l'adresse. Dans App.jsx la
 * route est écrite /universites/:identifiant — donc pour l'adresse
 * /universites/cesag, useParams() renvoie { identifiant: 'cesag' }.
 * =================================================================== */

import { Link, useParams } from 'react-router-dom';
import { formaterFcfa } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { Chargement, ErreurChargement } from '../components/Etat.jsx';

export default function DetailUniversite() {
  const { identifiant } = useParams();

  // On demande directement la fiche au serveur : /api/universites/cesag
  const { donnees: universite, erreur, chargement } = useApi(`/universites/${identifiant}`);

  if (chargement) return <Chargement texte="Chargement de la fiche…" />;

  // Toujours prévoir le cas « pas trouvé » : sinon la page plante.
  if (erreur || !universite) {
    return (
      <div className="conteneur py-20 text-center">
        <h1 className="text-2xl font-extrabold text-ardoise-900">Établissement introuvable</h1>
        <p className="mt-2 text-ardoise-600">{erreur}</p>
        <Link to="/universites" className="bouton-principal mt-6">
          Retour à l'annuaire
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Bandeau */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
        <div className="conteneur py-12">
          <Link to="/universites" className="text-sm text-white/70 hover:text-white">
            ← Annuaire des établissements
          </Link>

          <span className="mt-5 block">
            <span className="puce bg-white/15 text-white ring-1 ring-inset ring-white/25">
              {universite.type}
            </span>
          </span>

          {/* Le titre renvoie lui aussi vers le site officiel de l'etablissement. */}
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            <a
              href={universite.siteWeb}
              target="_blank"
              rel="noreferrer noopener"
              title={`Ouvrir le site officiel de ${universite.nom}`}
              className="hover:underline"
            >
              {universite.nom}
              <span aria-hidden="true" className="ml-2 text-xl text-white/60">&#8599;</span>
            </a>
          </h1>
          <p className="mt-2 text-white/80">{universite.nomComplet}</p>
        </div>
      </div>

      <div className="conteneur py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Colonne principale */}
          <div className="space-y-6">
            <section className="carte">
              <h2 className="text-xl font-bold text-ardoise-900">Présentation</h2>
              <p className="mt-3 leading-relaxed text-ardoise-600">{universite.description}</p>
            </section>

            <section className="carte">
              <h2 className="text-xl font-bold text-ardoise-900">Domaines de formation</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {universite.domaines.map((d) => (
                  <span key={d} className="puce">{d}</span>
                ))}
              </div>
              <p className="mt-5 rounded-xl bg-sable-50 p-3 text-sm text-sable-700">
                Frais indicatifs à partir de <strong>{formaterFcfa(universite.fraisMin)}</strong> par an.
                À confirmer auprès de l'établissement.
              </p>
            </section>
          </div>

          {/* Colonne des contacts */}
          <aside className="space-y-5">
            <div className="carte">
              <h2 className="text-base font-bold text-ardoise-900">Contact</h2>

              <ul className="mt-4 space-y-3 text-sm text-ardoise-600">
                <li>📍 {universite.adresse}</li>

                <li>
                  ☎{' '}
                  <a href={`tel:${universite.telephone.replace(/\s/g, '')}`} className="text-brand-700 hover:underline">
                    {universite.telephone}
                  </a>
                </li>

                {universite.whatsapp && <li>💬 WhatsApp : {universite.whatsapp}</li>}

                {universite.email && (
                  <li>
                    ✉{' '}
                    <a href={`mailto:${universite.email}`} className="text-brand-700 hover:underline">
                      {universite.email}
                    </a>
                  </li>
                )}
              </ul>

              <a
                href={universite.siteWeb}
                target="_blank"
                rel="noreferrer noopener"
                className="bouton-secondaire mt-5 w-full"
              >
                Site officiel ↗
              </a>
            </div>

            {universite.aVerifier && (
              <p className="rounded-2xl bg-sable-50 p-4 text-xs text-sable-700">
                ⚠ Contacts issus d'un annuaire tiers : à confirmer directement auprès de
                l'établissement avant la mise en ligne.
              </p>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
