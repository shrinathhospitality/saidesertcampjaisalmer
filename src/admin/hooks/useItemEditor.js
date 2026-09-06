import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contentApi } from '../services/content.js';

/**
 * Shared load/save/dirty state for an id-based CRUD editor (new or existing
 * record). `emptyRecord` is used when the route has no :id (the "new" route).
 */
export function useItemEditor(type, emptyRecord, listPath) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [item, setItem] = useState(isNew ? emptyRecord : null);
  const [original, setOriginal] = useState(isNew ? emptyRecord : null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    contentApi.get(type, id)
      .then((data) => {
        setItem(data);
        setOriginal(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [type, id, isNew]);

  const dirty = item && original && JSON.stringify(item) !== JSON.stringify(original);

  const save = async () => {
    setSaving(true);
    try {
      const result = isNew ? await contentApi.create(type, item) : await contentApi.update(type, id, item);
      setItem(result);
      setOriginal(result);
      if (isNew) navigate(`${listPath}/${result.id}`, { replace: true });
      return result;
    } finally {
      setSaving(false);
    }
  };

  const discard = () => setItem(original);

  return { item, setItem, isNew, loading, saving, error, dirty, save, discard };
}
