import { useEffect, useState } from 'react';
import { FiDownload, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { backupApi } from '../services/backup.js';
import { useToast } from '../hooks/useToast.jsx';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { CheckboxField } from '../components/FormField.jsx';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

export default function Backups() {
  const [items, setItems] = useState(null);
  const [includeMedia, setIncludeMedia] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pendingRestore, setPendingRestore] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const toast = useToast();

  const load = () => backupApi.list().then(setItems).catch((err) => toast.error(err.message));
  useEffect(() => { load(); }, []);

  if (!items) return <LoadingSpinner label="Loading backups…" />;

  const handleCreate = async () => {
    setCreating(true);
    try {
      await backupApi.create(includeMedia);
      toast.success('Backup created');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await backupApi.restore(pendingRestore.id);
      toast.success('Backup restored. A safety copy of the previous data was saved automatically.');
      setPendingRestore(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div>
      <PageHeader title="Backups" description="Snapshot and restore the website's content data." />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CheckboxField label="Include uploaded media in the backup" checked={includeMedia} onChange={(e) => setIncludeMedia(e.target.checked)} />
          {includeMedia && <p className="mt-1 text-xs text-amber-600">Including media can make the backup file significantly larger.</p>}
        </div>
        <button onClick={handleCreate} disabled={creating} className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
          <FiPlus /> {creating ? 'Creating…' : 'Create backup now'}
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No backups yet" message="Create your first backup before making major changes." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Created</th><th className="px-4 py-3">Includes media</th><th className="px-4 py-3">Size</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{item.includesMedia ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-slate-500">{formatBytes(item.sizeBytes)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <a href={backupApi.downloadUrl(item.id)} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                        <FiDownload /> Download
                      </a>
                      <button onClick={() => setPendingRestore(item)} className="flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                        <FiRefreshCw /> Restore
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingRestore)}
        title="Restore this backup?"
        message="This replaces the site's current content with the backed-up version. A safety copy of what's currently live will be saved automatically first, but any edits made after this backup was created will be lost."
        confirmLabel="Restore"
        busy={restoring}
        onConfirm={handleRestore}
        onCancel={() => setPendingRestore(null)}
      />
    </div>
  );
}
