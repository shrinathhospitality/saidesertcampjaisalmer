import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { contentApi } from '../services/content.js';
import { useToast } from '../hooks/useToast.jsx';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { CheckboxField, TextAreaField, TextField } from '../components/FormField.jsx';

export default function FaqsManager() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const toast = useToast();

  const load = () => contentApi.list('faqs').then((data) => setItems([...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))));
  useEffect(() => { load(); }, []);

  if (!items) return <LoadingSpinner label="Loading FAQs…" />;

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await contentApi.reorder('faqs', next.map((i) => i.id));
  };

  const handleDelete = async () => {
    try {
      await contentApi.remove('faqs', pendingDelete.id);
      toast.success('FAQ removed');
      setPendingDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="FAQs"
        description="Frequently asked questions shown on the homepage and relevant pages."
        actions={<button onClick={() => setEditing({})} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"><FiPlus /> Add FAQ</button>}
      />

      {items.length === 0 ? (
        <EmptyState title="No FAQs yet" action={<button onClick={() => setEditing({})} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Add FAQ</button>} />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className={`flex items-start gap-4 rounded-2xl border bg-white p-4 ${item.active ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{item.question}</p>
                <p className="mt-1 text-sm text-slate-600">{item.answer}</p>
                {item.category && <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{item.category}</span>}
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

      {editing && <FaqModal item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      <ConfirmDialog open={Boolean(pendingDelete)} title="Remove this FAQ?" message="This question and answer will be removed." onConfirm={handleDelete} onCancel={() => setPendingDelete(null)} />
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

function FaqModal({ item, onClose, onSaved }) {
  const isNew = !item.id;
  const [form, setForm] = useState({
    question: item.question || '', answer: item.answer || '', category: item.category || 'general', active: item.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) await contentApi.create('faqs', form);
      else await contentApi.update('faqs', item.id, form);
      toast.success(isNew ? 'FAQ added' : 'FAQ updated');
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
        <h3 className="text-lg font-semibold text-slate-900">{isNew ? 'Add FAQ' : 'Edit FAQ'}</h3>
        <TextField label="Question" value={form.question} onChange={(e) => set({ question: e.target.value })} required />
        <TextAreaField label="Answer" rows={3} value={form.answer} onChange={(e) => set({ answer: e.target.value })} required />
        <TextField label="Category / page assignment" value={form.category} onChange={(e) => set({ category: e.target.value })} />
        <CheckboxField label="Visible on site" checked={form.active} onChange={(e) => set({ active: e.target.checked })} />
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
