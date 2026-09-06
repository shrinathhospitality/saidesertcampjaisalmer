import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCopy, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { contentApi } from '../services/content.js';
import { useToast } from '../hooks/useToast.jsx';
import PageHeader from './PageHeader.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import DataTable from './DataTable.jsx';
import EmptyState from './EmptyState.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

/**
 * Shared list screen for the id-based CRUD content types (packages, rooms,
 * activities, blogs). Each page just supplies its columns and labels; the
 * dedicated editor route handles create/edit.
 */
export default function CollectionListPage({ type, title, description, columns, searchKeys, editPath, newPath }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const load = () => {
    contentApi.list(type)
      .then((data) => setItems([...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))))
      .catch((err) => setError(err.message));
  };

  useEffect(load, [type]);

  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!items) return <LoadingSpinner label={`Loading ${title.toLowerCase()}…`} />;

  const handleDuplicate = async (row) => {
    try {
      await contentApi.duplicate(type, row.id);
      toast.success('Duplicated as draft');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await contentApi.remove(type, pendingDelete.id);
      toast.success('Deleted');
      setPendingDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <button onClick={() => navigate(newPath)} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            <FiPlus /> Add new
          </button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title={`No ${title.toLowerCase()} yet`}
          message="Get started by adding your first item."
          action={<button onClick={() => navigate(newPath)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Add new</button>}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={items}
          searchKeys={searchKeys}
          rowActions={(row) => (
            <div className="flex justify-end gap-2">
              <button onClick={() => handleDuplicate(row)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Duplicate">
                <FiCopy />
              </button>
              <button onClick={() => navigate(editPath(row))} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Edit">
                <FiEdit2 />
              </button>
              <button onClick={() => setPendingDelete(row)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50" title="Delete">
                <FiTrash2 />
              </button>
            </div>
          )}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this item?"
        message={`"${pendingDelete?.title || pendingDelete?.name}" will be permanently removed. This can't be undone.`}
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
