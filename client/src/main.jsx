import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { I18nProvider } from './i18n/I18nContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';
import 'leaflet/dist/leaflet.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <CompareProvider>
            <App />
          </CompareProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
