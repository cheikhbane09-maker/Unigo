import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Universities from './pages/Universities.jsx';
import UniversityDetail from './pages/UniversityDetail.jsx';
import Compare from './pages/Compare.jsx';
import Procedures from './pages/Procedures.jsx';
import ProcedureDetail from './pages/ProcedureDetail.jsx';
import Testimonials from './pages/Testimonials.jsx';
import Transport from './pages/Transport.jsx';
import Activities from './pages/Activities.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Profile from './pages/Profile.jsx';
import Favorites from './pages/Favorites.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Module Université — Kaiju */}
        <Route path="/universites" element={<Universities />} />
        <Route path="/universites/:slug" element={<UniversityDetail />} />
        <Route path="/comparateur" element={<Compare />} />
        <Route path="/demarches" element={<Procedures />} />
        <Route path="/demarches/:slug" element={<ProcedureDetail />} />
        <Route path="/temoignages" element={<Testimonials />} />

        {/* Module Transport — Binta Comé */}
        <Route path="/transport" element={<Transport />} />

        {/* Module Activités & Divertissement — Maguette Niang */}
        <Route path="/activites" element={<Activities />} />

        {/* Authentification et espace personnel */}
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favoris"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
