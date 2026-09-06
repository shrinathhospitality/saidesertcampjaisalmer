// Centralized API client for the admin panel. Every admin screen goes
// through this module instead of calling fetch() directly, so the base
// path, credentials, and CSRF header stay in exactly one place.

const API_BASE = '/api';

let csrfToken = null;

export function setCsrfToken(token) {
  csrfToken = token || null;
}

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = 'GET', body, isForm = false, query } = {}) {
  const url = new URL(`${API_BASE}/${path}`, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers = {};
  if (!isForm) {
    headers['Content-Type'] = 'application/json';
  }
  if (method !== 'GET' && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  let res;
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new ApiError('Network error: the server could not be reached.', 0, null);
  }

  const contentType = res.headers.get('content-type') || '';
  let payload = null;
  if (contentType.includes('application/json')) {
    payload = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const message = payload?.error || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, payload);
  }

  return payload?.data;
}

export const api = {
  get: (path, query) => request(path, { method: 'GET', query }),
  post: (path, body, query) => request(path, { method: 'POST', body, query }),
  put: (path, body, query) => request(path, { method: 'PUT', body, query }),
  del: (path, query) => request(path, { method: 'DELETE', query }),
  upload: (path, formData, query) => request(path, { method: 'POST', body: formData, isForm: true, query }),
};

export { ApiError };
