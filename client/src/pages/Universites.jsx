/* ===================================================================
 * MODULE UNIVERSITÉ — Kaiju        adresse : /universites
 * -------------------------------------------------------------------
 * L'annuaire des établissements, avec une recherche et un filtre.
 * Les données viennent de l'API : GET /api/universites
 * =================================================================== */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formaterFcfa } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { EnTetePage } from '../components/Layout.jsx';
import { Chargement, ErreurChargement } from '../components/Etat.jsx';

export default function Universites() {
  const [recherche, setRecherche] = useState('');
  const [domaineChoisi, setDomaineChoisi] = useState('');

  // Les données viennent maintenant du serveur, plus d'un fichier local.
  const { donnees, erreur, chargement } = useApi('/universites');

  if (chargement) return <Chargement texte="Chargement des établissements…" />;
  if (erreur) {
    return (
      <div className="conteneur py-10">
        <ErreurChargement message={erreur} />
      </div>
    );
  }

  const universites = donnees || [];

  // On construit la liste des domaines à partir des données,
  // sans doublon (grâce à Set) et rangée par ordre alphabétique.
  const domaines = [...new Set(universites.flatMap((u) => u.domaines))].sort();

  // filter() garde uniquement les établissements qui correspondent.
  const resultats = universites.filter((u) => {
    const texte = (u.nom + u.nomComplet + u.quartier + u.description).toLowerCase();
    const correspondRecherche = texte.includes(recherche.toLowerCase().trim());
    const correspondDomaine = domaineChoisi === '' || u.domaines.includes(domaineChoisi);
    return correspondRecherche && correspondDomaine;
  });

  return (
    <>
      <EnTetePage
        titre="Annuaire des établissements"
        sousTitre="Les écoles et universités de Dakar, avec leurs contacts vérifiés."
      />

      <div className="conteneur py-10">
        {/* Barre de recherche et filtre */}
        <div className="carte mb-8 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="etiquette" htmlFor="recherche">Rechercher</label>
            <input
              id="recherche"
              type="search"
              className="champ"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="CESAG, Mermoz, informatique…"
            />
          </div>

          <div>
            <label className="etiquette" htmlFor="domaine">Domaine</label>
            <select
              id="domaine"
              className="champ"
              value={domaineChoisi}
              onChange={(e) => setDomaineChoisi(e.target.value)}
            >
              <option value="">Tous les domaines</option>
              {domaines.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-5 text-sm text-ardoise-600">
          <strong className="text-ardoise-900">{resultats.length}</strong> établissement(s) trouvé(s)
        </p>

        {resultats.length === 0 ? (
          <div className="carte text-center text-ardoise-600">
            Aucun établissement ne correspond à cette recherche.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resultats.map((u) => (
              <article key={u.id} className="carte flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  {/* Le nom de l'ecole est un lien direct vers son site officiel.
                      target="_blank" ouvre dans un nouvel onglet, rel="noreferrer
                      noopener" est la precaution de securite obligatoire avec. */}
                  <h2 className="text-lg font-bold text-ardoise-900">
                    <a
                      href={u.siteWeb}
                      target="_blank"
                      rel="noreferrer noopener"
                      title={`Ouvrir le site officiel de ${u.nom}`}
                      className="hover:text-brand-700 hover:underline"
                    >
                      {u.nom}
                      <span aria-hidden="true" className="ml-1 text-sm text-ardoise-400">&#8599;</span>
                    </a>
                  </h2>
                  <span className="puce shrink-0">{u.type}</span>
                </div>

                <p className="mt-1 text-sm text-ardoise-400">📍 {u.quartier}, {u.ville}</p>

                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ardoise-600">
                  {u.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {u.domaines.slice(0, 3).map((d) => (
                    <span key={d} className="rounded-full bg-ardoise-100 px-2.5 py-0.5 text-xs text-ardoise-600">
                      {d}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-ardoise-100 pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-ardoise-400">À partir de</p>
                    <p className="text-sm font-semibold text-ardoise-900">{formaterFcfa(u.fraisMin)}</p>
                  </div>
                  <Link to={`/universites/${u.id}`} className="bouton-principal !px-4 !py-2">
                    Voir
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-8 rounded-2xl bg-sable-50 p-4 text-sm text-sable-700">
          Les frais affichés sont des ordres de grandeur indicatifs. À confirmer auprès de chaque
          établissement avant toute inscription.
        </p>
      </div>
    </>
  );
}
