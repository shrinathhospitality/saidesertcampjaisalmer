import { api } from './apiClient.js';

export const enquiriesApi = {
  list: () => api.get('enquiries.php'),
  get: (id) => api.get('enquiries.php', { id }),
  update: (id, body) => api.put('enquiries.php', body, { id }),
  remove: (id) => api.del('enquiries.php', { id }),
  exportUrl: () => '/api/enquiries.php?action=export',
};
