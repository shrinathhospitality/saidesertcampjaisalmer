import { api } from './apiClient.js';

// Generic CRUD wrapper over /api/content.php for every collection/singleton
// content type. Keeps every admin screen's data access identical.
export const contentApi = {
  list: (type) => api.get('content.php', { type }),
  updateSingleton: (type, body) => api.put('content.php', body, { type }),
  get: (type, id) => api.get('content.php', { type, id }),
  create: (type, body) => api.post('content.php', body, { type }),
  update: (type, id, body) => api.put('content.php', body, { type, id }),
  remove: (type, id) => api.del('content.php', { type, id }),
  reorder: (type, order) => api.post('content.php', { order }, { type, action: 'reorder' }),
  duplicate: (type, id) => api.post('content.php', {}, { type, id, action: 'duplicate' }),
};
