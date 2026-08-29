const BASE = '/api';
const TOKEN_KEY = 'unigo_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* stockage indisponible (navigation privée) : on ignore */
  }
}

/**
 * Petit client HTTP centralisé.
 * Ajoute automatiquement le jeton JWT et normalise les erreurs de l'API.
 */
export async function api(path, { method = 'GET', body, headers = {}, ...rest } = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...rest,
  });

  let payload = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  if (!res.ok) {
    const message = payload?.error || `Erreur ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.details = payload?.details;
    throw error;
  }
  return payload;
}

export const get = (p) => api(p);
export const post = (p, body) => api(p, { method: 'POST', body });
export const patch = (p, body) => api(p, { method: 'PATCH', body });
export const put = (p, body) => api(p, { method: 'PUT', body });
export const del = (p) => api(p, { method: 'DELETE' });

/** Formate un montant en FCFA (ex. 250000 → « 250 000 FCFA »). */
export function formatFcfa(value) {
  if (value === null || value === undefined) return '—';
  if (value === 0) return 'Gratuit / non communiqué';
  return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`;
}

export function formatDate(value, locale = 'fr-FR') {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
