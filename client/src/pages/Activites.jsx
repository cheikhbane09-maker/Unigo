/* ===================================================================
 * MODULE ACTIVITÉS & DIVERTISSEMENT — Maguette Niang
 * adresse : /activites
 * -------------------------------------------------------------------
 * Page de départ : les quatre familles d'activités et leurs
 * sous-catégories. Les données sont dans src/data/donnees.js
 * (tableau categoriesActivites).
 *
 * À FAIRE (Maguette) :
 *  - TODO : remplir chaque sous-catégorie avec de vrais lieux
 *           (nom, adresse, téléphone, fourchette de prix, photo)
 *  - TODO : page de détail par lieu
 *  - TODO : agenda des événements avec filtre par date
 *  - TODO : formulaire « proposer un événement »
 * =================================================================== */

import { useState } from 'react';
import { categoriesActivites } from '../data/donnees.js';
import { EnTetePage } from '../components/Layout.jsx';

export default function Activites() {
  // On retient la catégorie ouverte. Par défaut, la première.
  const [categorieOuverte, setCategorieOuverte] = useState(categoriesActivites[0].id);

  return (
    <>
      <EnTetePage
        titre="Sortir et s'intégrer"
        sousTitre="Plages, restaurants, loisirs et culture : de quoi découvrir Dakar en dehors des cours."
      />

      <div className="conteneur py-10">
        {/* Les onglets des quatre familles */}
        <div className="flex flex-wrap gap-2">
          {categoriesActivites.map((categorie) => (
            <button
              key={categorie.id}
              type="button"
              onClick={() => setCategorieOuverte(categorie.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                categorieOuverte === categorie.id
                  ? 'bg-brand-700 text-white'
                  : 'bg-white text-ardoise-600 ring-1 ring-ardoise-100 hover:bg-ardoise-50'
              }`}
            >
              {categorie.emoji} {categorie.titre}
            </button>
          ))}
        </div>

        {/* Le contenu de la catégorie sélectionnée */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {categoriesActivites
            .filter((categorie) => categorie.id === categorieOuverte)
            .map((categorie) => (
              <div key={categorie.id} className="carte md:col-span-2">
                <h2 className="text-xl font-bold text-ardoise-900">
                  {categorie.emoji} {categorie.titre}
                </h2>

                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {categorie.sousCategories.map((sousCategorie) => (
                    <li
                      key={sousCategorie}
                      className="flex items-center gap-3 rounded-xl bg-ardoise-50 p-4 text-sm text-ardoise-800"
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${categorie.couleur}`}>
                        {categorie.emoji}
                      </span>
                      {sousCategorie}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {/* Vue d'ensemble des quatre familles */}
        <h2 className="mt-14 text-xl font-bold text-ardoise-900">Les quatre familles</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categoriesActivites.map((categorie) => (
            <div key={categorie.id} className="carte">
              <span className="text-3xl">{categorie.emoji}</span>
              <h3 className="mt-3 font-bold text-ardoise-900">{categorie.titre}</h3>
              <p className="mt-1 text-sm text-ardoise-600">
                {categorie.sousCategories.length} catégories
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 rounded-2xl bg-sable-50 p-4 text-sm text-sable-700">
          Page en cours de développement par <strong>Maguette Niang</strong> sur la branche
          <code className="mx-1 rounded bg-white px-1.5 py-0.5">feature/activites-maguette</code>.
          Prochaine étape : remplir chaque catégorie avec de vrais lieux et leurs contacts.
        </p>
      </div>
    </>
  );
}
