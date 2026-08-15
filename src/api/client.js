const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const TOKENS_STORAGE_KEY = 'dashboard-auth-tokens';

const REFRESH_PATH = '/api/auth/refresh/';

export class ApiError extends Error {
  constructor(status, data = {}) {
    const detail = data?.detail || (data?.non_field_errors && data.non_field_errors[0]);
    super(detail || 'Request failed');
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getStoredTokens() {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeTokens({ access, refresh }) {
  const next = { access, refresh };
  localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearTokens() {
  localStorage.removeItem(TOKENS_STORAGE_KEY);
}

async function toApiError(response) {
  let data = {};
  try {
    data = await response.json();
  } catch {
    /* ignore invalid JSON */
  }
  return new ApiError(response.status, data);
}

export async function login({ username, password }) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new ApiError(0, { detail: 'Unable to reach the server. Please try again.' });
  }

  if (!response.ok) {
    let data = {};
    try {
      data = await response.json();
    } catch {
      /* ignore invalid JSON */
    }
    if (response.status === 400 || response.status === 401) {
      throw new ApiError(response.status, {
        detail: data?.detail || data?.non_field_errors?.[0] || 'Invalid username or password.',
      });
    }
    throw new ApiError(response.status, data);
  }

  return response.json();
}

let refreshPromise = null;

async function refreshAccessToken() {
  const tokens = getStoredTokens();
  if (!tokens?.refresh) {
    throw new ApiError(401, { detail: 'No refresh token available.' });
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}${REFRESH_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokens.refresh }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new ApiError(response.status);
        }
        return response.json();
      })
      .then((data) => {
        const next = storeTokens({ ...tokens, access: data.access });
        return next.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch(path, options = {}) {
  const tokens = getStoredTokens();
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (tokens?.access) {
    headers.set('Authorization', `Bearer ${tokens.access}`);
  }

  const request = () =>
    fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  let response = await request();

  if (response.status === 401 && tokens?.refresh) {
    try {
      const newAccess = await refreshAccessToken();
      headers.set('Authorization', `Bearer ${newAccess}`);
      response = await request();
    } catch {
      clearTokens();
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  return response;
}

export async function fetchProfile() {
  const response = await apiFetch('/api/user/profile/');
  if (!response.ok) throw await toApiError(response);
  return response.json();
}

export async function fetchUserFiles() {
  const response = await apiFetch('/api/user/files/');
  if (!response.ok) throw await toApiError(response);
  return response.json();
}

export async function getAdminUsers() {
  const response = await apiFetch('/api/users/');
  if (!response.ok) throw await toApiError(response);
  return response.json();
}

export async function getAdminUser(userId) {
  const response = await apiFetch(`/api/user-details/${userId}/`);
  if (!response.ok) throw await toApiError(response);
  return response.json();
}

export async function fetchMetrics() {
  const response = await apiFetch('/metrics/');
  if (!response.ok) throw await toApiError(response);
  const text = await response.text();
  const metrics = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('ocr_')) continue;
    const name = trimmed.split('{')[0].split(/\s+/)[0];
    const value = parseFloat(trimmed.split(/\s+/).pop());
    if (!Number.isNaN(value)) metrics[name] = value;
  }
  return metrics;
}
