/* ===================================================================
 * MODULE ACTIVITÉS & DIVERTISSEMENT — Maguette Niang
 * adresse : /activites
 * -------------------------------------------------------------------
 * Deux appels à l'API :
 *   GET /api/activites                    → les 4 familles (onglets)
 *   GET /api/lieux?categorie=restauration → les lieux de la famille ouverte
 *
 * Chaque lieu est présenté comme une fiche d'établissement :
 * nom cliquable, téléphone cliquable, badge ⚠ si le contact reste à confirmer.
 *
 * À FAIRE (Maguette) :
 *  - TODO : page de détail par lieu (/activites/:id)
 *  - TODO : agenda des événements avec filtre par date
 *  - TODO : photos des lieux
 * =================================================================== */

import { useState } from 'react';
import { useApi } from '../lib/useApi.js';
import { EnTetePage } from '../components/Layout.jsx';
import { Chargement, ErreurChargement } from '../components/Etat.jsx';

export default function Activites() {
  const { donnees: familles, erreur, chargement } = useApi('/activites');

  // La famille ouverte. null = on prendra la première.
  const [familleOuverte, setFamilleOuverte] = useState(null);
  const [recherche, setRecherche] = useState('');

  if (chargement) return <Chargement texte="Chargement des activités…" />;
  if (erreur) {
    return (
      <div className="conteneur py-10">
        <ErreurChargement message={erreur} />
      </div>
    );
  }

  const categories = familles || [];
  if (categories.length === 0) return null;

  const ouverte = familleOuverte || categories[0].id;
  const familleActive = categories.find((c) => c.id === ouverte);

  return (
    <>
      <EnTetePage
        titre="Sortir et s'intégrer"
        sousTitre="Plages, restaurants, loisirs et culture : de quoi découvrir Dakar en dehors des cours."
      />

      <div className="conteneur py-10">
        {/* Les onglets des quatre familles */}
        <div className="flex flex-wrap gap-2">
          {categories.map((categorie) => (
            <button
              key={categorie.id}
              type="button"
              onClick={() => {
                setFamilleOuverte(categorie.id);
                setRecherche(''); // on repart d'une recherche vide
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                ouverte === categorie.id
                  ? 'bg-brand-700 text-white'
                  : 'bg-white text-ardoise-600 ring-1 ring-ardoise-100 hover:bg-ardoise-50'
              }`}
            >
              {categorie.emoji} {categorie.titre}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <label className="etiquette" htmlFor="recherche-lieu">Rechercher un lieu</label>
          <input
            id="recherche-lieu"
            type="search"
            className="champ max-w-md"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Loutcha, plage, bowling…"
          />
        </div>

        {/* La liste des lieux de la famille ouverte.
            key={ouverte} force React à recharger quand on change d'onglet. */}
        <ListeLieux key={ouverte} famille={familleActive} recherche={recherche} />
      </div>
    </>
  );
}

/* -------------------------------------------------------------------
 * La liste des lieux d'une famille, regroupés par sous-catégorie.
 * ----------------------------------------------------------------- */
function ListeLieux({ famille, recherche }) {
  const { donnees, erreur, chargement } = useApi(`/lieux?categorie=${famille.id}`);

  if (chargement) return <Chargement texte="Chargement des lieux…" />;
  if (erreur) return <div className="mt-8"><ErreurChargement message={erreur} /></div>;

  const tous = donnees || [];

  // Filtre de recherche, sans tenir compte des majuscules.
  const texte = recherche.toLowerCase().trim();
  const lieux = tous.filter((l) =>
    (l.nom + ' ' + (l.sousCategorie || '') + ' ' + (l.ville || '')).toLowerCase().includes(texte)
  );

  // On range les lieux par sous-catégorie : { 'Plages': [...], 'Îles': [...] }
  const groupes = {};
  for (const lieu of lieux) {
    const cle = lieu.sousCategorie || 'Autres';
    if (!groupes[cle]) groupes[cle] = [];
    groupes[cle].push(lieu);
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-ardoise-900">
        {famille.emoji} {famille.titre}
      </h2>
      <p className="mt-1 text-sm text-ardoise-600">
        <strong className="text-ardoise-900">{lieux.length}</strong> lieu(x)
        {texte && ' pour cette recherche'}
      </p>

      {lieux.length === 0 ? (
        <div className="carte mt-5 text-center text-ardoise-600">
          Aucun lieu ne correspond à cette recherche.
        </div>
      ) : (
        Object.entries(groupes).map(([sousCategorie, liste]) => (
          <section key={sousCategorie} className="mt-8">
            <h3 className="text-sm font-bold uppercase tracking-wide text-ardoise-400">
              {sousCategorie}
            </h3>

            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {liste.map((lieu) => (
                <FicheLieu key={lieu.id} lieu={lieu} couleur={famille.couleur} />
              ))}
            </div>
          </section>
        ))
      )}

      <p className="mt-10 rounded-2xl bg-sable-50 p-4 text-sm text-sable-700">
        Le badge ⚠ signale un lieu dont le numéro n'a pas encore été confirmé.
        Les autres contacts ont été relevés un par un — un appel avant de se déplacer reste conseillé.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------
 * Une fiche de lieu : nom, ville, téléphone, site, carte.
 * ----------------------------------------------------------------- */
function FicheLieu({ lieu, couleur }) {
  // Le nom renvoie vers le site officiel s'il existe, sinon vers Google Maps.
  const lienPrincipal = lieu.siteWeb || lieu.carte;

  return (
    <article className="carte flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-bold text-ardoise-900">
          {lienPrincipal ? (
            <a
              href={lienPrincipal}
              target="_blank"
              rel="noreferrer noopener"
              title={lieu.siteWeb ? `Site de ${lieu.nom}` : `${lieu.nom} sur Google Maps`}
              className="hover:text-brand-700 hover:underline"
            >
              {lieu.nom}
              <span aria-hidden="true" className="ml-1 text-sm text-ardoise-400">&#8599;</span>
            </a>
          ) : (
            lieu.nom
          )}
        </h4>

        {lieu.aVerifier && (
          <span
            className="shrink-0 rounded-full bg-sable-100 px-2 py-0.5 text-xs text-sable-700"
            title="Contact à confirmer"
          >
            ⚠
          </span>
        )}
      </div>

      {lieu.ville && <p className="mt-1 text-sm text-ardoise-400">📍 {lieu.ville}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ardoise-100 pt-4">
        {/* href="tel:..." : sur téléphone, un clic lance l'appel. */}
        {lieu.telephone ? (
          <a
            href={`tel:${lieu.telephone.replace(/\s/g, '')}`}
            className={`rounded-lg px-2.5 py-1 text-sm font-semibold ${couleur || 'bg-ardoise-100 text-ardoise-700'}`}
          >
            📞 {lieu.telephone}
          </a>
        ) : (
          <span className="text-sm text-ardoise-400">Numéro à trouver</span>
        )}

        {lieu.carte && (
          <a
            href={lieu.carte}
            target="_blank"
            rel="noreferrer noopener"
            className="text-sm text-ardoise-500 hover:text-brand-700 hover:underline"
          >
            Carte
          </a>
        )}
      </div>
    </article>
  );
}
