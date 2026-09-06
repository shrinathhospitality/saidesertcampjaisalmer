import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { contentApi } from '../services/content.js';
import { useToast } from '../hooks/useToast.jsx';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import { CheckboxField, SelectField, TextField } from '../components/FormField.jsx';

export default function GalleryManager() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null); // item being edited, or {} for new
  const [pendingDelete, setPendingDelete] = useState(null);
  const toast = useToast();

  const load = () => contentApi.list('gallery').then((data) => setItems([...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))));
  useEffect(() => { load(); }, []);

  if (!items) return <LoadingSpinner label="Loading gallery…" />;

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await contentApi.reorder('gallery', next.map((i) => i.id));
  };

  const handleDelete = async () => {
    try {
      await contentApi.remove('gallery', pendingDelete.id);
      toast.success('Image removed');
      setPendingDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Gallery"
        description="The public gallery page and homepage gallery preview."
        actions={<button onClick={() => setEditing({})} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"><FiPlus /> Add image</button>}
      />

      {items.length === 0 ? (
        <EmptyState title="No gallery images yet" action={<button onClick={() => setEditing({})} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Add image</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="aspect-video bg-slate-100">
                <img src={item.src} alt={item.alt || item.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-400">{item.category} · {item.type}{item.active ? '' : ' · hidden'}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1">
                    <IconBtn onClick={() => move(index, -1)}><FiArrowUp /></IconBtn>
                    <IconBtn onClick={() => move(index, 1)}><FiArrowDown /></IconBtn>
                  </div>
                  <div className="flex gap-1">
                    <IconBtn onClick={() => setEditing(item)}><FiEdit2 /></IconBtn>
                    <IconBtn danger onClick={() => setPendingDelete(item)}><FiTrash2 /></IconBtn>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <GalleryItemModal
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove this image?"
        message={`"${pendingDelete?.title}" will be removed from the gallery.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function IconBtn({ children, onClick, danger }) {
  return (
    <button type="button" onClick={onClick} className={`grid h-8 w-8 place-items-center rounded-lg border text-sm ${danger ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
      {children}
    </button>
  );
}

function GalleryItemModal({ item, onClose, onSaved }) {
  const isNew = !item.id;
  const [form, setForm] = useState({
    title: item.title || '', category: item.category || '', type: item.type || 'image',
    src: item.src || '', alt: item.alt || '', videoUrl: item.videoUrl || '', active: item.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await contentApi.create('gallery', form);
        toast.success('Image added');
      } else {
        await contentApi.update('gallery', item.id, form);
        toast.success('Image updated');
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">{isNew ? 'Add gallery image' : 'Edit gallery image'}</h3>
        <MediaPicker label="Image" value={form.src} onChange={(url) => set({ src: url })} />
        <TextField label="Title" value={form.title} onChange={(e) => set({ title: e.target.value })} required />
        <TextField label="Alt text" value={form.alt} onChange={(e) => set({ alt: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Category" value={form.category} onChange={(e) => set({ category: e.target.value })} />
          <SelectField label="Type" value={form.type} onChange={(e) => set({ type: e.target.value })} options={[{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }]} />
        </div>
        {form.type === 'video' && <TextField label="Video URL" value={form.videoUrl} onChange={(e) => set({ videoUrl: e.target.value })} />}
        <CheckboxField label="Visible on site" checked={form.active} onChange={(e) => set({ active: e.target.checked })} />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
