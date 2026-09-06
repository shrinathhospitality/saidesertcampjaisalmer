import { api } from './apiClient.js';

export const mediaApi = {
  list: () => api.get('media.php'),
  upload: (file, { title, alt } = {}) => {
    const form = new FormData();
    form.append('file', file);
    if (title) form.append('title', title);
    if (alt) form.append('alt', alt);
    return api.upload('media.php', form);
  },
  update: (id, body) => api.put('media.php', body, { id }),
  remove: (id) => api.del('media.php', { id }),
};
