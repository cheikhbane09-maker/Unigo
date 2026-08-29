import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function Layout({ children }) {
  const { pathname } = useLocation();

  // Remonte en haut de page à chaque navigation.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu principal
      </a>
      <Navbar />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

/** En-tête de page réutilisable. */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="border-b border-ink-100 bg-white">
      <div className="container-page py-10 sm:py-14">
        <h1 className="font-display text-3xl font-extrabold text-ink-900 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-[15px] text-ink-400">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
