import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

/** Protège une route : redirige vers /connexion, et vers l'accueil si le rôle ne convient pas. */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}
