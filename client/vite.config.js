import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // ouvre le navigateur automatiquement au démarrage

    // Pour plus tard : quand le backend sera branché, tous les appels
    // commençant par /api seront redirigés vers le serveur Node.
    // Pour l'instant le site fonctionne seul, avec les données de src/data.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
