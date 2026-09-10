import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowDown, FiArrowLeft, FiArrowUp, FiExternalLink, FiTrash2 } from 'react-icons/fi';
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

  const heroSlides = page.heroSlides || [];
  const setHeroSlides = (next) => setPage((p) => ({ ...p, heroSlides: next }));
  const updateSlide = (index, patch) => setHeroSlides(heroSlides.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const addSlide = () => setHeroSlides([...heroSlides, { eyebrow: '', title: '', text: '', image: '', type: 'image' }]);
  const removeSlide = (index) => setHeroSlides(heroSlides.filter((_, i) => i !== index));
  const moveSlide = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= heroSlides.length) return;
    const next = [...heroSlides];
    [next[index], next[target]] = [next[target], next[index]];
    setHeroSlides(next);
  };

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

        {page.slug === 'home' ? (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Hero slider</h2>
              <button type="button" onClick={addSlide} className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-slate-400">
                + Add slide
              </button>
            </div>
            <p className="text-xs text-slate-400">
              The homepage hero rotates through these slides automatically. Each needs an image, an eyebrow label, a title, and supporting text.
            </p>
            {heroSlides.length === 0 && (
              <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-400">No slides yet — add at least one so the homepage hero has something to show.</p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {heroSlides.map((slide, index) => (
                <div key={index} className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Slide {index + 1}</span>
                    <div className="flex gap-1">
                      <IconBtn onClick={() => moveSlide(index, -1)}><FiArrowUp /></IconBtn>
                      <IconBtn onClick={() => moveSlide(index, 1)}><FiArrowDown /></IconBtn>
                      <IconBtn danger onClick={() => removeSlide(index)}><FiTrash2 /></IconBtn>
                    </div>
                  </div>
                  <MediaPicker label="Background image" value={slide.image} onChange={(url) => updateSlide(index, { image: url })} />
                  <TextField label="Eyebrow" value={slide.eyebrow || ''} onChange={(e) => updateSlide(index, { eyebrow: e.target.value })} />
                  <TextField label="Title" value={slide.title || ''} onChange={(e) => updateSlide(index, { title: e.target.value })} />
                  <TextAreaField label="Supporting text" rows={2} value={slide.text || ''} onChange={(e) => updateSlide(index, { text: e.target.value })} />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Hero section</h2>
            <TextField label="Eyebrow" value={page.hero.eyebrow} onChange={(e) => setHero({ eyebrow: e.target.value })} />
            <TextField label="Title" value={page.hero.title} onChange={(e) => setHero({ title: e.target.value })} />
            <TextAreaField label="Subtitle" rows={2} value={page.hero.subtitle} onChange={(e) => setHero({ subtitle: e.target.value })} />
            <MediaPicker label="Background image" value={page.hero.image} onChange={(url) => setHero({ image: url })} />
          </section>
        )}

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

function IconBtn({ children, onClick, danger }) {
  return (
    <button type="button" onClick={onClick} className={`grid h-7 w-7 place-items-center rounded-lg border text-sm ${danger ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
      {children}
    </button>
  );
}
