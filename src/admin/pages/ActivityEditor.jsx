import { useNavigate } from 'react-router-dom';
import { useItemEditor } from '../hooks/useItemEditor.js';
import { useToast } from '../hooks/useToast.jsx';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChanges.js';
import { contentApi } from '../services/content.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EditorShell from '../components/EditorShell.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import { CheckboxField, ListEditor, TextAreaField, TextField } from '../components/FormField.jsx';

const EMPTY = {
  title: '', slug: '', duration: '', capacity: '', price: 0, priceSuffix: '/ person',
  active: true, featured: false, shortDescription: '', description: '', image: '', gallery: [],
  inclusions: [], exclusions: [], highlights: [],
  ctaLabel: 'Enquire Now', whatsappMessage: '',
  seo: { title: '', description: '', focusKeyword: '', canonical: '', ogTitle: '', ogDescription: '', ogImage: '', noindex: false },
};

export default function ActivityEditor() {
  const navigate = useNavigate();
  const toast = useToast();
  const { item, setItem, isNew, loading, saving, error, dirty, save, discard } = useItemEditor('activities', EMPTY, '/admin/activities');

  useUnsavedChangesWarning(dirty);

  if (loading || !item) return <LoadingSpinner label="Loading activity…" />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;

  const set = (patch) => setItem((p) => ({ ...p, ...patch }));
  const setSeo = (patch) => setItem((p) => ({ ...p, seo: { ...p.seo, ...patch } }));

  const handleSave = async () => {
    try {
      await save();
      toast.success(isNew ? 'Activity created' : 'Activity saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    try {
      await contentApi.remove('activities', item.id);
      toast.success('Activity deleted');
      navigate('/admin/activities');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <EditorShell
      title={isNew ? 'New Activity' : item.title}
      backLabel="Back to Activities"
      backPath="/admin/activities"
      navigate={navigate}
      dirty={dirty}
      saving={saving}
      onSave={handleSave}
      onDiscard={discard}
      onDelete={isNew ? null : handleDelete}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Basics</h2>
          <TextField label="Title" value={item.title} onChange={(e) => set({ title: e.target.value })} />
          <TextField label="Slug" hint="Auto-generated from the title if left blank" value={item.slug} onChange={(e) => set({ slug: e.target.value })} />
          <TextAreaField label="Short description" rows={2} value={item.shortDescription} onChange={(e) => set({ shortDescription: e.target.value })} />
          <TextAreaField label="Full description" rows={4} value={item.description} onChange={(e) => set({ description: e.target.value })} />
          <MediaPicker label="Featured image" value={item.image} onChange={(url) => set({ image: url })} />
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Pricing &amp; status</h2>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Duration" value={item.duration} onChange={(e) => set({ duration: e.target.value })} />
            <TextField label="Capacity" value={item.capacity} onChange={(e) => set({ capacity: e.target.value })} />
            <TextField label="Price" type="number" value={item.price} onChange={(e) => set({ price: Number(e.target.value) })} />
            <TextField label="Price suffix" value={item.priceSuffix} onChange={(e) => set({ priceSuffix: e.target.value })} />
          </div>
          <div className="flex gap-6">
            <CheckboxField label="Featured" checked={item.featured} onChange={(e) => set({ featured: e.target.checked })} />
            <CheckboxField label="Active (visible on site)" checked={item.active} onChange={(e) => set({ active: e.target.checked })} />
          </div>
          <TextField label="CTA button label" value={item.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} />
          <TextAreaField label="WhatsApp enquiry message" rows={2} value={item.whatsappMessage} onChange={(e) => set({ whatsappMessage: e.target.value })} />
        </section>

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Details</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <ListEditor label="Inclusions" items={item.inclusions} onChange={(v) => set({ inclusions: v })} />
            <ListEditor label="Exclusions" items={item.exclusions} onChange={(v) => set({ exclusions: v })} />
            <ListEditor label="Highlights" items={item.highlights} onChange={(v) => set({ highlights: v })} />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">SEO</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="SEO title" value={item.seo.title} onChange={(e) => setSeo({ title: e.target.value })} />
            <TextField label="Focus keyword" value={item.seo.focusKeyword} onChange={(e) => setSeo({ focusKeyword: e.target.value })} />
          </div>
          <TextAreaField label="Meta description" rows={2} value={item.seo.description} onChange={(e) => setSeo({ description: e.target.value })} />
          <CheckboxField label="Hide from search engines (noindex)" checked={item.seo.noindex} onChange={(e) => setSeo({ noindex: e.target.checked })} />
        </section>
      </div>
    </EditorShell>
  );
}
