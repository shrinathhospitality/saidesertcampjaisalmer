import { useCallback, useEffect, useState } from 'react';
import { contentApi } from '../services/content.js';

/** Loads a singleton content type (currently just site-settings) and exposes a save() for a partial update. */
export function useSingleton(type) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    return contentApi.list(type)
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (partial) => {
    setSaving(true);
    try {
      const updated = await contentApi.updateSingleton(type, partial);
      setData(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  }, [type]);

  return { data, loading, error, saving, save, reload: load };
}
