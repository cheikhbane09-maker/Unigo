/* ===================================================================
 * LA BASE DE DONNÉES
 * -------------------------------------------------------------------
 * Pas de MySQL, pas de XAMPP, rien à installer : les données sont
 * rangées dans un simple fichier JSON, server/donnees.json.
 *
 * Au tout premier démarrage, le fichier est créé automatiquement avec
 * les universités, les transports et les activités de départ.
 *
 * Deux fonctions suffisent :
 *   lireBase()          → renvoie tout le contenu du fichier
 *   ecrireBase(donnees) → réécrit le fichier
 *
 * ⚠ Un fichier JSON convient parfaitement à un projet d'école. Pour un
 * vrai site avec beaucoup de visiteurs, on passerait à MySQL ou
 * PostgreSQL : seul ce fichier serait à réécrire, les routes ne
 * changeraient pas.
 * =================================================================== */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { donneesInitiales } from './donnees.js';

const dossierActuel = path.dirname(fileURLToPath(import.meta.url));
const FICHIER = path.join(dossierActuel, '..', 'donnees.json');

/** Lit tout le contenu de la base. Crée le fichier s'il n'existe pas. */
export function lireBase() {
  if (!fs.existsSync(FICHIER)) {
    // Premier démarrage : on crée le fichier avec les données de départ.
    ecrireBase(donneesInitiales);
    console.log('  → Fichier de données créé : server/donnees.json');
    return donneesInitiales;
  }

  try {
    return JSON.parse(fs.readFileSync(FICHIER, 'utf-8'));
  } catch (erreur) {
    console.error('  ✖ Le fichier donnees.json est illisible :', erreur.message);
    console.error('    Supprimez-le, il sera recréé au prochain démarrage.');
    throw erreur;
  }
}

/** Réécrit tout le contenu de la base. */
export function ecrireBase(donnees) {
  // null, 2 = fichier indenté, lisible à l'œil dans VS Code.
  fs.writeFileSync(FICHIER, JSON.stringify(donnees, null, 2), 'utf-8');
}

/** Raccourci : lit la base, applique une modification, réenregistre. */
export function modifierBase(modification) {
  const donnees = lireBase();
  modification(donnees);
  ecrireBase(donnees);
  return donnees;
}
