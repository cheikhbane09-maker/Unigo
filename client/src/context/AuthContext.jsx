import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { get, post, patch, setToken, getToken } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const refreshFavorites = useCallback(async () => {
    if (!getToken()) return setFavoriteIds([]);
    try {
      const res = await get('/favorites/ids');
      setFavoriteIds(res.data || []);
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  // Restaure la session au chargement si un jeton valide est présent.
  useEffect(() => {
    (async () => {
      if (!getToken()) return setLoading(false);
      try {
        const res = await get('/auth/me');
        setUser(res.user);
        await refreshFavorites();
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshFavorites]);

  const login = async (email, password) => {
    const res = await post('/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
    await refreshFavorites();
    return res.user;
  };

  const register = async (payload) => {
    const res = await post('/auth/register', payload);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setFavoriteIds([]);
  };

  const updateProfile = async (payload) => {
    const res = await patch('/auth/me', payload);
    setUser(res.user);
    return res.user;
  };

  const toggleFavorite = async (universityId) => {
    const res = await post('/favorites/toggle', { universityId });
    setFavoriteIds((prev) =>
      res.favorited ? [...prev, universityId] : prev.filter((id) => id !== universityId)
    );
    return res.favorited;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      favoriteIds,
      login,
      register,
      logout,
      updateProfile,
      toggleFavorite,
      refreshFavorites,
    }),
    [user, loading, favoriteIds, refreshFavorites]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>');
  return ctx;
}
