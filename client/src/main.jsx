/* ===================================================================
 * POINT D'ENTRÉE DU SITE
 * -------------------------------------------------------------------
 * Ce fichier est le tout premier exécuté. Il fait trois choses :
 *   1. il charge le CSS (Tailwind)
 *   2. il active le routeur (les adresses /connexion, /universites…)
 *   3. il affiche le composant App dans la div #root de index.html
 * =================================================================== */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
