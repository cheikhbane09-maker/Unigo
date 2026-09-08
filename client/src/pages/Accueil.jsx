/* ===================================================================
 * PAGE D'ACCUEIL (la « landing page »)
 * -------------------------------------------------------------------
 * C'est la vitrine du projet : ce que voit un visiteur qui arrive
 * sur le site sans avoir de compte. Son rôle est d'expliquer en
 * quelques secondes à quoi sert UNIGO, puis d'inviter à s'inscrire.
 * =================================================================== */

import { Link } from 'react-router-dom';
import { useApi } from '../lib/useApi.js';

/* Un petit bloc réutilisé trois fois plus bas. */
function CarteModule({ emoji, titre, texte, lien }) {
  return (
    <Link
      to={lien}
      className="carte group transition hover:-translate-y-1 hover:shadow-lg"
    >
      <span className="text-3xl">{emoji}</span>
      <h3 className="mt-4 text-lg font-bold text-ardoise-900">{titre}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ardoise-600">{texte}</p>
      <span className="mt-4 inline-block text-sm font-semibold text-brand-700">
        Découvrir →
      </span>
    </Link>
  );
}

export default function Accueil() {
  // /api/statistiques est une route PUBLIQUE : elle ne renvoie que des
  // nombres, donc la page d'accueil peut les afficher sans être connecté.
  // Si le serveur est éteint, on affiche simplement un tiret.
  const { donnees: stats } = useApi('/statistiques');

  const etapes = [
    { numero: 1, titre: 'Crée ton compte', texte: "Indique ton pays d'origine et ton projet d'études." },
    { numero: 2, titre: 'Compare et choisis', texte: 'Filtre les établissements par ville, domaine et budget.' },
    { numero: 3, titre: 'Prépare ton arrivée', texte: 'Repère tes trajets et les activités près de ton campus.' },
  ];

  return (
    <>
      {/* ---------- Bandeau principal ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600">
        {/* Motif de points en fond */}
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_15%_20%,white_1.5px,transparent_1.5px)] [background-size:26px_26px]" />

        <div className="conteneur relative py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="puce bg-white/15 text-white ring-1 ring-inset ring-white/25">
              Université · Transport · Activités
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-6xl">
              Étudier et vivre au Sénégal, sans se perdre.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              UNIGO réunit au même endroit tout ce dont un étudiant étranger a besoin :
              choisir son université, comprendre les démarches, se déplacer et s'intégrer.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/inscription" className="bouton bg-white text-brand-800 hover:bg-brand-50">
                Créer mon compte
              </Link>
              <Link to="/universites" className="bouton-clair">
                Voir les universités
              </Link>
            </div>

            {/* Trois chiffres clés */}
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
                <p className="text-2xl font-extrabold text-white">{stats?.universites ?? '—'}</p>
                <p className="mt-0.5 text-xs text-white/70">Établissements</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
                <p className="text-2xl font-extrabold text-white">{stats?.transports ?? '—'}</p>
                <p className="mt-0.5 text-xs text-white/70">Moyens de transport</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
                <p className="text-2xl font-extrabold text-white">{stats?.activites ?? '—'}</p>
                <p className="mt-0.5 text-xs text-white/70">Catégories de loisirs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Les trois modules ---------- */}
      <section className="conteneur py-16 sm:py-20">
        <h2 className="text-2xl font-extrabold text-ardoise-900 sm:text-3xl">
          Trois modules, un seul compte
        </h2>
        <p className="mt-3 max-w-2xl text-ardoise-600">
          Tout le site est accessible avec un compte unique. Ton profil et tes favoris
          te suivent d'un module à l'autre.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <CarteModule
            emoji="🎓"
            titre="Université"
            texte="Annuaire des établissements, filières, frais de scolarité, conditions d'admission et contacts vérifiés."
            lien="/universites"
          />
          <CarteModule
            emoji="🚌"
            titre="Transport"
            texte="Moyens de transport de Dakar, tarifs indicatifs et conseils pratiques pour rejoindre ton campus."
            lien="/transport"
          />
          <CarteModule
            emoji="🎉"
            titre="Activités & Divertissement"
            texte="Plages, restaurants, sorties, culture et événements pour s'intégrer rapidement."
            lien="/activites"
          />
        </div>
      </section>

      {/* ---------- Comment ça marche ---------- */}
      <section className="border-y border-ardoise-100 bg-white py-16">
        <div className="conteneur">
          <h2 className="text-2xl font-extrabold text-ardoise-900">Comment ça marche</h2>

          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {etapes.map((etape) => (
              <li key={etape.numero} className="relative pl-14">
                <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-xl bg-brand-700 font-bold text-white">
                  {etape.numero}
                </span>
                <h3 className="font-bold text-ardoise-900">{etape.titre}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ardoise-600">{etape.texte}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Appel à l'inscription ---------- */}
      <section className="conteneur py-16">
        <div className="rounded-3xl bg-ardoise-900 px-8 py-12 text-center sm:px-14">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Prêt à préparer ton arrivée ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            La création de compte prend moins d'une minute et te donne accès aux trois modules.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/inscription" className="bouton bg-white text-ardoise-900 hover:bg-brand-50">
              Créer mon compte
            </Link>
            <Link to="/connexion" className="bouton-clair">
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
