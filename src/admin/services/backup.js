import { api } from './apiClient.js';

export const backupApi = {
  list: () => api.get('backup.php', { action: 'list' }),
  create: (includeMedia) => api.post('backup.php', { includeMedia }, { action: 'create' }),
  restore: (id) => api.post('backup.php', {}, { action: 'restore', id }),
  downloadUrl: (id) => `/api/backup.php?action=download&id=${encodeURIComponent(id)}`,
};
