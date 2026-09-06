import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { contentApi } from '../services/content.js';
import { useToast } from '../hooks/useToast.jsx';
import { confirmDiscard, useUnsavedChangesWarning } from '../hooks/useUnsavedChanges.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SaveBar from '../components/SaveBar.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import { CheckboxField, SelectField, TextAreaField, TextField } from '../components/FormField.jsx';

export default function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [page, setPage] = useState(null);
  const [original, setOriginal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    contentApi.get('pages', id).then((data) => {
      setPage(data);
      setOriginal(data);
    }).catch((err) => toast.error(err.message));
  }, [id]);

  const dirty = page && original && JSON.stringify(page) !== JSON.stringify(original);
  useUnsavedChangesWarning(dirty);

  if (!page) return <LoadingSpinner label="Loading page…" />;

  const setHero = (patch) => setPage((p) => ({ ...p, hero: { ...p.hero, ...patch } }));
  const setSeo = (patch) => setPage((p) => ({ ...p, seo: { ...p.seo, ...patch } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await contentApi.update('pages', id, page);
      setPage(updated);
      setOriginal(updated);
      toast.success('Page saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (!confirmDiscard(dirty)) return;
    navigate('/admin/pages');
  };

  return (
    <div>
      <button onClick={handleBack} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <FiArrowLeft /> Back to Pages
      </button>
      <PageHeader
        title={page.name}
        description={`Editing ${page.path}`}
        actions={
          <a href={page.path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <FiExternalLink /> View page
          </a>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Page status</h2>
          <SelectField
            label="Status"
            value={page.status}
            onChange={(e) => setPage((p) => ({ ...p, status: e.target.value }))}
            options={[{ value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]}
          />
          <p className="text-xs text-slate-400">
            The URL <code>{page.path}</code> is part of the site's routing and stays fixed; this status only marks
            the page for editorial tracking today (see limitations noted in HOSTINGER-DEPLOYMENT.md).
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Hero section</h2>
          {page.slug === 'home' ? (
            <p className="text-xs text-slate-400">
              The homepage uses an animated multi-slide hero rather than a single hero block, so it isn't editable
              field-by-field here yet. The SEO fields below still apply to the homepage.
            </p>
          ) : (
            <>
              <TextField label="Eyebrow" value={page.hero.eyebrow} onChange={(e) => setHero({ eyebrow: e.target.value })} />
              <TextField label="Title" value={page.hero.title} onChange={(e) => setHero({ title: e.target.value })} />
              <TextAreaField label="Subtitle" rows={2} value={page.hero.subtitle} onChange={(e) => setHero({ subtitle: e.target.value })} />
              <MediaPicker label="Background image" value={page.hero.image} onChange={(url) => setHero({ image: url })} />
            </>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">SEO</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="SEO title" value={page.seo.title} onChange={(e) => setSeo({ title: e.target.value })} />
            <TextField label="Focus keyword" value={page.seo.focusKeyword} onChange={(e) => setSeo({ focusKeyword: e.target.value })} />
          </div>
          <TextAreaField label="Meta description" rows={3} value={page.seo.description} onChange={(e) => setSeo({ description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Canonical URL" placeholder="Leave blank to use the default page URL" value={page.seo.canonical} onChange={(e) => setSeo({ canonical: e.target.value })} />
            <TextField label="Open Graph title" placeholder="Defaults to SEO title" value={page.seo.ogTitle} onChange={(e) => setSeo({ ogTitle: e.target.value })} />
          </div>
          <TextAreaField label="Open Graph description" rows={2} placeholder="Defaults to meta description" value={page.seo.ogDescription} onChange={(e) => setSeo({ ogDescription: e.target.value })} />
          <MediaPicker label="Open Graph image" value={page.seo.ogImage} onChange={(url) => setSeo({ ogImage: url })} />
          <CheckboxField label="Hide from search engines (noindex)" checked={page.seo.noindex} onChange={(e) => setSeo({ noindex: e.target.checked })} />
        </section>
      </div>

      <SaveBar dirty={Boolean(dirty)} saving={saving} onSave={handleSave} onDiscard={() => setPage(original)} />
    </div>
  );
}
