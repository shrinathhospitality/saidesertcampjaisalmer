import { useEffect, useMemo, useRef, useState } from 'react';
import { FiCheck, FiCopy, FiGrid, FiList, FiTrash2, FiUpload } from 'react-icons/fi';
import { mediaApi } from '../services/media.js';
import { useToast } from '../hooks/useToast.jsx';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

export default function MediaLibrary() {
  const [items, setItems] = useState(null);
  const [view, setView] = useState('grid');
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const fileRef = useRef(null);
  const toast = useToast();

  const load = () => mediaApi.list().then((data) => setItems([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((i) => i.title.toLowerCase().includes(q) || i.filename.toLowerCase().includes(q));
  }, [items, query]);

  if (!items) return <LoadingSpinner label="Loading media…" />;

  const handleUpload = async (fileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        await mediaApi.upload(file, { title: file.name });
      }
      toast.success(`${fileList.length} file(s) uploaded`);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopy = async (item) => {
    const url = window.location.origin + item.url;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.info(url);
    }
  };

  const handleDelete = async () => {
    try {
      await mediaApi.remove(pendingDelete.id);
      toast.success('File deleted');
      setPendingDelete(null);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Upload and manage images and documents used across the website."
        actions={
          <>
            <div className="flex rounded-lg border border-slate-200 p-0.5">
              <button onClick={() => setView('grid')} className={`grid h-8 w-8 place-items-center rounded-md ${view === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}><FiGrid /></button>
              <button onClick={() => setView('list')} className={`grid h-8 w-8 place-items-center rounded-md ${view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}><FiList /></button>
            </div>
            <input ref={fileRef} type="file" multiple hidden accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.pdf" onChange={(e) => e.target.files?.length && handleUpload(e.target.files)} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              <FiUpload /> {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </>
        }
      />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search media…"
        className="mb-4 w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
      />

      {filtered.length === 0 ? (
        <EmptyState title="No media found" message="Upload JPG, PNG, WebP, GIF, SVG, or PDF files." />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.map((item) => (
            <button key={item.id} onClick={() => setSelected(item)} className="overflow-hidden rounded-xl border border-slate-200 bg-white text-left hover:border-slate-400">
              <div className="grid aspect-square place-items-center bg-slate-50">
                {item.kind === 'image' ? <img src={item.url} alt={item.alt} className="h-full w-full object-cover" /> : <span className="text-xs font-semibold text-slate-400">PDF</span>}
              </div>
              <p className="truncate px-2 py-1.5 text-xs text-slate-600">{item.title}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Preview</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Size</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2"><div className="h-10 w-10 overflow-hidden rounded bg-slate-100">{item.kind === 'image' && <img src={item.url} alt="" className="h-full w-full object-cover" />}</div></td>
                  <td className="px-4 py-2">{item.title}</td>
                  <td className="px-4 py-2 text-slate-500">{item.mime}</td>
                  <td className="px-4 py-2 text-slate-500">{formatBytes(item.size)}</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setSelected(item)} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <MediaDetailModal
          item={selected}
          copied={copiedId === selected.id}
          onCopy={() => handleCopy(selected)}
          onClose={() => setSelected(null)}
          onDelete={() => setPendingDelete(selected)}
          onSaved={(updated) => { setSelected(updated); load(); }}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this file?"
        message={`"${pendingDelete?.title}" will be permanently deleted. Make sure nothing on the site still references it.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function MediaDetailModal({ item, onClose, onDelete, onSaved, onCopy, copied }) {
  const [title, setTitle] = useState(item.title);
  const [alt, setAlt] = useState(item.alt);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await mediaApi.update(item.id, { title, alt });
      toast.success('Media details saved');
      onSaved(updated);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-slate-50">
            {item.kind === 'image' ? <img src={item.url} alt={item.alt} className="h-full w-full object-contain" /> : <span className="text-sm font-semibold text-slate-400">PDF document</span>}
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Alt text</label>
              <input value={alt} onChange={(e) => setAlt(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <p className="text-xs text-slate-400">{item.mime} · {formatBytes(item.size)}</p>
            <button onClick={onCopy} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy />} {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
        </div>
        <div className="mt-5 flex justify-between">
          <button onClick={onDelete} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><FiTrash2 /> Delete</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Close</button>
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
