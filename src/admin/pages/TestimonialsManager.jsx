import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiEdit2, FiPlus, FiStar, FiTrash2 } from 'react-icons/fi';
import { contentApi } from '../services/content.js';
import { useToast } from '../hooks/useToast.jsx';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import { CheckboxField, TextAreaField, TextField } from '../components/FormField.jsx';

export default function TestimonialsManager() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const toast = useToast();

  const load = () => contentApi.list('testimonials').then((data) => setItems([...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))));
  useEffect(() => { load(); }, []);

  if (!items) return <LoadingSpinner label="Loading testimonials…" />;

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await contentApi.reorder('testimonials', next.map((i) => i.id));
  };

  const handleDelete = async () => {
    try {
      await contentApi.remove('testimonials', pendingDelete.id);
      toast.success('Testimonial removed');
      setPendingDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Guest reviews shown across the site."
        actions={<button onClick={() => setEditing({})} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"><FiPlus /> Add testimonial</button>}
      />

      {items.length === 0 ? (
        <EmptyState title="No testimonials yet" action={<button onClick={() => setEditing({})} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Add testimonial</button>} />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className={`flex items-start gap-4 rounded-2xl border bg-white p-4 ${item.active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100">
                {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <span className="text-xs text-slate-400">{item.location}</span>
                  <span className="flex items-center gap-0.5 text-amber-500">{Array.from({ length: item.rating }).map((_, i) => <FiStar key={i} className="fill-current text-xs" />)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.review}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <IconBtn onClick={() => move(index, -1)}><FiArrowUp /></IconBtn>
                <IconBtn onClick={() => move(index, 1)}><FiArrowDown /></IconBtn>
                <IconBtn onClick={() => setEditing(item)}><FiEdit2 /></IconBtn>
                <IconBtn danger onClick={() => setPendingDelete(item)}><FiTrash2 /></IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <TestimonialModal item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      <ConfirmDialog open={Boolean(pendingDelete)} title="Remove this testimonial?" message={`The review from "${pendingDelete?.name}" will be removed.`} onConfirm={handleDelete} onCancel={() => setPendingDelete(null)} />
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

function TestimonialModal({ item, onClose, onSaved }) {
  const isNew = !item.id;
  const [form, setForm] = useState({
    name: item.name || '', location: item.location || '', rating: item.rating || 5,
    review: item.review || '', image: item.image || '', active: item.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) await contentApi.create('testimonials', form);
      else await contentApi.update('testimonials', item.id, form);
      toast.success(isNew ? 'Testimonial added' : 'Testimonial updated');
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
        <h3 className="text-lg font-semibold text-slate-900">{isNew ? 'Add testimonial' : 'Edit testimonial'}</h3>
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Guest name" value={form.name} onChange={(e) => set({ name: e.target.value })} required />
          <TextField label="Location / role" value={form.location} onChange={(e) => set({ location: e.target.value })} />
        </div>
        <TextField label="Rating (1-5)" type="number" min="1" max="5" value={form.rating} onChange={(e) => set({ rating: Number(e.target.value) })} />
        <TextAreaField label="Review" rows={3} value={form.review} onChange={(e) => set({ review: e.target.value })} required />
        <MediaPicker label="Guest photo (optional)" value={form.image} onChange={(url) => set({ image: url })} />
        <CheckboxField label="Visible on site" checked={form.active} onChange={(e) => set({ active: e.target.checked })} />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
