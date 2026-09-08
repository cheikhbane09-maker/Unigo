/* ===================================================================
 * LA BASE DE DONNÉES — MySQL (XAMPP)
 * -------------------------------------------------------------------
 * Le serveur se connecte au MySQL de XAMPP. Au premier démarrage :
 *   1. il crée la base « unigo » si elle n'existe pas
 *   2. il crée les 4 tables
 *   3. il les remplit avec le contenu de src/donnees.js si elles sont vides
 *
 * → Rien à faire dans phpMyAdmin. Il suffit que MySQL tourne dans XAMPP.
 *
 * Les réglages de connexion sont dans server/.env
 * (utilisateur root sans mot de passe = réglage XAMPP par défaut).
 * =================================================================== */

import mysql from 'mysql2/promise';
import { donneesInitiales } from './donnees.js';
import { lieux } from './donnees-activites.js'; // module Activités (Maguette)

const reglages = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unigo',
};

// Le « pool » est un groupe de connexions réutilisées : c'est ce qu'on
// utilise partout ailleurs dans le code, avec pool.query(...).
export let pool;

/* -------------------------------------------------------------------
 * Création de la base et des tables
 * ----------------------------------------------------------------- */

export async function initialiserBase() {
  // 1. On se connecte SANS préciser de base, pour pouvoir la créer.
  const connexion = await mysql.createConnection({
    host: reglages.host,
    port: reglages.port,
    user: reglages.user,
    password: reglages.password,
  });

  await connexion.query(
    `CREATE DATABASE IF NOT EXISTS \`${reglages.database}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connexion.end();

  // 2. Maintenant on ouvre le pool sur la base.
  pool = mysql.createPool({ ...reglages, waitForConnections: true, connectionLimit: 10 });

  // 3. Les tables. « IF NOT EXISTS » : on peut relancer sans rien casser.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      nomComplet      VARCHAR(120)  NOT NULL,
      email           VARCHAR(180)  NOT NULL UNIQUE,
      motDePasseHache VARCHAR(120)  NOT NULL,
      pays            VARCHAR(80),
      domaine         VARCHAR(80),
      inscritLe       DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS universites (
      id          VARCHAR(60) PRIMARY KEY,
      nom         VARCHAR(120) NOT NULL,
      nomComplet  VARCHAR(200),
      type        VARCHAR(20),
      ville       VARCHAR(80),
      quartier    VARCHAR(120),
      adresse     VARCHAR(255),
      telephone   VARCHAR(40),
      whatsapp    VARCHAR(40),
      email       VARCHAR(180),
      siteWeb     VARCHAR(255),
      description TEXT,
      domaines    TEXT,
      fraisMin    INT DEFAULT 0,
      aVerifier   BOOLEAN DEFAULT FALSE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transports (
      id          VARCHAR(60) PRIMARY KEY,
      nom         VARCHAR(120) NOT NULL,
      prixMin     INT,
      prixMax     INT,
      description TEXT,
      conseil     TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activites (
      id             VARCHAR(60) PRIMARY KEY,
      emoji          VARCHAR(20),
      titre          VARCHAR(120) NOT NULL,
      couleur        VARCHAR(80),
      sousCategories TEXT,
      ordre          INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lieux (
      id            VARCHAR(60) PRIMARY KEY,
      nom           VARCHAR(160) NOT NULL,
      categorie     VARCHAR(60),
      sousCategorie VARCHAR(120),
      ville         VARCHAR(80),
      telephone     VARCHAR(40),
      siteWeb       VARCHAR(255),
      carte         VARCHAR(255),
      aVerifier     BOOLEAN DEFAULT FALSE,
      ordre         INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  // 4. Remplissage initial, table par table (seulement si elle est vide).
  await remplirSiVide();

  return reglages.database;
}

/* Combien de lignes dans une table ? Sert à ne remplir que les tables vides. */
async function estVide(table) {
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM \`${table}\``);
  return total === 0;
}

/* Remplit les tables de contenu à partir des fichiers src/donnees*.js. */
async function remplirSiVide() {
  if (await estVide('universites')) await remplirUniversites();
  if (await estVide('transports')) await remplirTransports();
  if (await estVide('activites')) await remplirActivites();
  if (await estVide('lieux')) await remplirLieux();
}

async function remplirUniversites() {
  console.log('  → Remplissage des établissements…');
  for (const u of donneesInitiales.universites) {
    await pool.query(
      `INSERT INTO universites
       (id, nom, nomComplet, type, ville, quartier, adresse, telephone, whatsapp,
        email, siteWeb, description, domaines, fraisMin, aVerifier)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        u.id, u.nom, u.nomComplet, u.type, u.ville, u.quartier, u.adresse,
        u.telephone, u.whatsapp || null, u.email || null, u.siteWeb,
        u.description,
        JSON.stringify(u.domaines), // un tableau ne rentre pas tel quel en base
        u.fraisMin || 0,
        u.aVerifier === true,
      ]
    );
  }
}

async function remplirTransports() {
  console.log('  → Remplissage des transports…');
  for (const t of donneesInitiales.moyensTransport) {
    await pool.query(
      `INSERT INTO transports (id, nom, prixMin, prixMax, description, conseil)
       VALUES (?,?,?,?,?,?)`,
      [t.id, t.nom, t.prixMin, t.prixMax, t.description, t.conseil]
    );
  }
}

async function remplirActivites() {
  console.log("  → Remplissage des familles d'activités…");
  // « ordre » conserve l'ordre d'affichage voulu : sans lui, MySQL
  // renverrait les familles dans n'importe quel ordre.
  let position = 0;
  for (const a of donneesInitiales.categoriesActivites) {
    await pool.query(
      `INSERT INTO activites (id, emoji, titre, couleur, sousCategories, ordre)
       VALUES (?,?,?,?,?,?)`,
      [a.id, a.emoji, a.titre, a.couleur, JSON.stringify(a.sousCategories), position]
    );
    position += 1;
  }
}

async function remplirLieux() {
  console.log(`  → Remplissage des lieux (${lieux.length})…`);
  // « ordre » garde l'ordre du fichier : sans lui, les sous-catégories
  // ressortiraient par ordre alphabétique (Îles avant Plages…).
  let position = 0;
  for (const l of lieux) {
    await pool.query(
      `INSERT INTO lieux
       (id, nom, categorie, sousCategorie, ville, telephone, siteWeb, carte, aVerifier, ordre)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        l.id, l.nom, l.categorie, l.sousCategorie, l.ville,
        l.telephone || null, l.siteWeb || null, l.carte || null,
        l.aVerifier === true, position,
      ]
    );
    position += 1;
  }
}

/* -------------------------------------------------------------------
 * Les colonnes « domaines » et « sousCategories » contiennent des
 * tableaux enregistrés sous forme de texte JSON. Ces deux fonctions
 * les retransforment en vrais tableaux avant de les envoyer au site.
 * ----------------------------------------------------------------- */

export function universiteDepuisBase(ligne) {
  return {
    ...ligne,
    domaines: JSON.parse(ligne.domaines || '[]'),
    aVerifier: Boolean(ligne.aVerifier),
  };
}

export function activiteDepuisBase(ligne) {
  return {
    ...ligne,
    sousCategories: JSON.parse(ligne.sousCategories || '[]'),
  };
}

export function lieuDepuisBase(ligne) {
  return { ...ligne, aVerifier: Boolean(ligne.aVerifier) };
}
