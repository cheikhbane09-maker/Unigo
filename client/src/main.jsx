/* ===================================================================
 * POINT D'ENTRÉE DU SITE
 * -------------------------------------------------------------------
 * Ce fichier est le tout premier exécuté. Il fait quatre choses :
 *   1. il charge le CSS (Tailwind)
 *   2. il active le routeur (les adresses /connexion, /universites…)
 *   3. il active la gestion des comptes (AuthProvider)
 *   4. il affiche le composant App dans la div #root de index.html
 *
 * AuthProvider doit englober App : c'est ce qui permet à n'importe
 * quelle page d'appeler useAuth() pour savoir qui est connecté.
 * =================================================================== */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
