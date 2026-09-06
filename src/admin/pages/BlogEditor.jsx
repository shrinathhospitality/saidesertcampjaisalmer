import { useNavigate } from 'react-router-dom';
import { useItemEditor } from '../hooks/useItemEditor.js';
import { useToast } from '../hooks/useToast.jsx';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChanges.js';
import { contentApi } from '../services/content.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EditorShell from '../components/EditorShell.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import RichTextEditor from '../components/RichTextEditor.jsx';
import { CheckboxField, SelectField, TextAreaField, TextField } from '../components/FormField.jsx';

const EMPTY = {
  title: '', slug: '', excerpt: '', contentHtml: '', image: '', author: '', category: '',
  tags: [], date: new Date().toISOString().slice(0, 10), status: 'draft', featured: false,
  seo: { title: '', description: '', focusKeyword: '', canonical: '', ogTitle: '', ogDescription: '', ogImage: '', noindex: false },
};

export default function BlogEditor() {
  const navigate = useNavigate();
  const toast = useToast();
  const { item, setItem, isNew, loading, saving, error, dirty, save, discard } = useItemEditor('blogs', EMPTY, '/admin/blogs');

  useUnsavedChangesWarning(dirty);

  if (loading || !item) return <LoadingSpinner label="Loading post…" />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;

  const set = (patch) => setItem((p) => ({ ...p, ...patch }));
  const setSeo = (patch) => setItem((p) => ({ ...p, seo: { ...p.seo, ...patch } }));

  const handleSave = async () => {
    try {
      await save();
      toast.success(isNew ? 'Post created' : 'Post saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${item.title}"? This can't be undone.`)) return;
    try {
      await contentApi.remove('blogs', item.id);
      toast.success('Post deleted');
      navigate('/admin/blogs');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <EditorShell
      title={isNew ? 'New Blog Post' : item.title}
      backLabel="Back to Blog"
      backPath="/admin/blogs"
      navigate={navigate}
      dirty={dirty}
      saving={saving}
      onSave={handleSave}
      onDiscard={discard}
      onDelete={isNew ? null : handleDelete}
      previewHref={isNew ? null : `/blog/${item.slug}`}
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <TextField label="Title" value={item.title} onChange={(e) => set({ title: e.target.value })} />
            <TextField label="Slug" hint="Auto-generated from the title if left blank" value={item.slug} onChange={(e) => set({ slug: e.target.value })} />
            <TextAreaField label="Excerpt" rows={2} value={item.excerpt} onChange={(e) => set({ excerpt: e.target.value })} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <RichTextEditor label="Content" value={item.contentHtml} onChange={(html) => set({ contentHtml: html })} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Publishing</h2>
            <SelectField label="Status" value={item.status} onChange={(e) => set({ status: e.target.value })} options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }]} />
            <TextField label="Publish date" type="date" value={item.date} onChange={(e) => set({ date: e.target.value })} />
            <CheckboxField label="Featured" checked={item.featured} onChange={(e) => set({ featured: e.target.checked })} />
            <TextField label="Author" value={item.author} onChange={(e) => set({ author: e.target.value })} />
            <TextField label="Category" value={item.category} onChange={(e) => set({ category: e.target.value })} />
            <TextField label="Tags" hint="Comma-separated" value={item.tags.join(', ')} onChange={(e) => set({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} />
            <MediaPicker label="Featured image" value={item.image} onChange={(url) => set({ image: url })} />
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">SEO</h2>
            <TextField label="SEO title" value={item.seo.title} onChange={(e) => setSeo({ title: e.target.value })} />
            <TextAreaField label="Meta description" rows={2} value={item.seo.description} onChange={(e) => setSeo({ description: e.target.value })} />
            <TextField label="Focus keyword" value={item.seo.focusKeyword} onChange={(e) => setSeo({ focusKeyword: e.target.value })} />
            <CheckboxField label="Hide from search engines (noindex)" checked={item.seo.noindex} onChange={(e) => setSeo({ noindex: e.target.checked })} />
          </section>
        </div>
      </div>
    </EditorShell>
  );
}
