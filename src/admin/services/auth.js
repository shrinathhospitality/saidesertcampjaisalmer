import { api, setCsrfToken } from './apiClient.js';

export async function fetchSession() {
  const data = await api.get('auth.php', { action: 'session' });
  if (data.csrfToken) setCsrfToken(data.csrfToken);
  return data;
}

export async function login(username, password) {
  const data = await api.post('auth.php', { username, password }, { action: 'login' });
  if (data.csrfToken) setCsrfToken(data.csrfToken);
  return data;
}

export async function logout() {
  await api.post('auth.php', {}, { action: 'logout' });
  setCsrfToken(null);
}

export function changePassword(currentPassword, newPassword) {
  return api.post('auth.php', { currentPassword, newPassword }, { action: 'change-password' });
}

export function setupFirstAdmin(username, password, setupToken) {
  return api.post('auth.php', { username, password, setupToken }, { action: 'setup' });
}
