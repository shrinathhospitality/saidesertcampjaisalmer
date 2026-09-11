import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiTrash2 } from 'react-icons/fi';
import { useSingleton } from '../hooks/useSingleton.js';
import { useToast } from '../hooks/useToast.jsx';
import { confirmDiscard, useUnsavedChangesWarning } from '../hooks/useUnsavedChanges.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SaveBar from '../components/SaveBar.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import { CheckboxField, TextAreaField, TextField } from '../components/FormField.jsx';

export default function FooterSettings() {
  const { data, loading, error, saving, save } = useSingleton('site-settings');
  const [footer, setFooter] = useState(null);
  const [dirty, setDirty] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (data) setFooter(data.footer);
  }, [data]);

  useUnsavedChangesWarning(dirty);

  if (loading || !footer) return <LoadingSpinner label="Loading footer settings…" />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;

  const set = (patch) => {
    setFooter((f) => ({ ...f, ...patch }));
    setDirty(true);
  };
  const setBlock = (key, value) => set({ blocks: { ...footer.blocks, [key]: value } });
  const setCredit = (patch) => set({ credit: { ...footer.credit, ...patch } });

  const experienceLinks = footer.experienceLinks || [];
  const setExperienceLinks = (next) => set({ experienceLinks: next });
  const updateExperience = (index, patch) => setExperienceLinks(experienceLinks.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const addExperience = () => setExperienceLinks([...experienceLinks, { label: '', path: '/' }]);
  const removeExperience = (index) => setExperienceLinks(experienceLinks.filter((_, i) => i !== index));
  const moveExperience = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= experienceLinks.length) return;
    const next = [...experienceLinks];
    [next[index], next[target]] = [next[target], next[index]];
    setExperienceLinks(next);
  };

  const handleSave = async () => {
    try {
      await save({ footer });
      setDirty(false);
      toast.success('Footer settings saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDiscard = () => {
    if (!confirmDiscard(dirty)) return;
    setFooter(data.footer);
    setDirty(false);
  };

  return (
    <div>
      <PageHeader title="Footer" description="Footer about text, the top newsletter banner, credit line, and which blocks are shown." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Content</h2>
          <TextAreaField label="About text" rows={4} value={footer.aboutText} onChange={(e) => set({ aboutText: e.target.value })} />
          <TextField label="Tagline" hint="Small line under the about text, e.g. “Desert People Stories Forever”" value={footer.tagline || ''} onChange={(e) => set({ tagline: e.target.value })} />
          <TextField label="Copyright text" hint="Leave blank to auto-generate “© {year} {site name}. All rights reserved.”" value={footer.copyrightText} onChange={(e) => set({ copyrightText: e.target.value })} />
          <TextField label="Credit name" hint="Shown in the footer as “Created by {name}”" value={footer.credit.text} onChange={(e) => setCredit({ text: e.target.value })} />
          <TextField label="Credit link URL" placeholder="Optional — makes the name clickable" value={footer.credit.url} onChange={(e) => setCredit({ url: e.target.value })} />
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Newsletter banner</h2>
          <CheckboxField label="Show newsletter banner" checked={footer.showNewsletter} onChange={(e) => set({ showNewsletter: e.target.checked })} />
          <TextField label="Eyebrow label" value={footer.newsletterEyebrow || ''} onChange={(e) => set({ newsletterEyebrow: e.target.value })} />
          <p className="text-xs text-slate-400">The heading and supporting text come from Site Settings → Newsletter.</p>
          <MediaPicker label="Background image" value={footer.newsletterBackgroundImage || ''} onChange={(url) => set({ newsletterBackgroundImage: url })} hint="Leave empty for a plain dark background." />
          <TextField label="Script accent text" hint="Small handwritten-style flourish, e.g. “Jaisalmer Awaits”" value={footer.scriptTagline || ''} onChange={(e) => set({ scriptTagline: e.target.value })} />
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Visible blocks</h2>
          <CheckboxField label="Quick links" checked={footer.blocks.quickLinks} onChange={(e) => setBlock('quickLinks', e.target.checked)} />
          <CheckboxField label="Experiences links" checked={footer.blocks.experiences} onChange={(e) => setBlock('experiences', e.target.checked)} />
          <CheckboxField label="Legal links" checked={footer.blocks.legal} onChange={(e) => setBlock('legal', e.target.checked)} />
          <CheckboxField label="Contact information" checked={footer.blocks.contact} onChange={(e) => setBlock('contact', e.target.checked)} />
          <CheckboxField label="Social icons" checked={footer.blocks.social} onChange={(e) => setBlock('social', e.target.checked)} />
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Experiences column</h2>
            <button type="button" onClick={addExperience} className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-slate-400">
              + Add link
            </button>
          </div>
          {experienceLinks.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-400">No links yet.</p>}
          <div className="space-y-3">
            {experienceLinks.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input value={item.label} placeholder="Label" onChange={(e) => updateExperience(index, { label: e.target.value })} className="w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500" />
                <input value={item.path} placeholder="/path" onChange={(e) => updateExperience(index, { path: e.target.value })} className="w-1/2 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500" />
                <button type="button" onClick={() => moveExperience(index, -1)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><FiArrowUp /></button>
                <button type="button" onClick={() => moveExperience(index, 1)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><FiArrowDown /></button>
                <button type="button" onClick={() => removeExperience(index)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"><FiTrash2 /></button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} />
    </div>
  );
}
