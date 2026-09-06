import { useEffect, useState } from 'react';
import { useSingleton } from '../hooks/useSingleton.js';
import { useToast } from '../hooks/useToast.jsx';
import { confirmDiscard, useUnsavedChangesWarning } from '../hooks/useUnsavedChanges.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SaveBar from '../components/SaveBar.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import { TextAreaField, TextField } from '../components/FormField.jsx';

export default function SeoDefaults() {
  const { data, loading, error, saving, save } = useSingleton('site-settings');
  const [seo, setSeo] = useState(null);
  const [script, setScript] = useState('');
  const [dirty, setDirty] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (data) {
      setSeo(data.seoDefaults);
      setScript(data.customHeadScript || '');
    }
  }, [data]);

  useUnsavedChangesWarning(dirty);

  if (loading || !seo) return <LoadingSpinner label="Loading SEO defaults…" />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;

  const set = (patch) => {
    setSeo((s) => ({ ...s, ...patch }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await save({ seoDefaults: seo, customHeadScript: script });
      setDirty(false);
      toast.success('SEO defaults saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDiscard = () => {
    if (!confirmDiscard(dirty)) return;
    setSeo(data.seoDefaults);
    setScript(data.customHeadScript || '');
    setDirty(false);
  };

  return (
    <div>
      <PageHeader title="SEO" description="Site-wide fallback metadata used when a page doesn't set its own SEO fields." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Default metadata</h2>
          <TextField label="Default SEO title" value={seo.title} onChange={(e) => set({ title: e.target.value })} />
          <TextAreaField label="Default meta description" rows={3} value={seo.description} onChange={(e) => set({ description: e.target.value })} />
          <TextField label="Twitter handle" placeholder="@yourhandle" value={seo.twitterHandle} onChange={(e) => set({ twitterHandle: e.target.value })} />
          <MediaPicker label="Default sharing image (Open Graph)" value={seo.ogImage} onChange={(url) => set({ ogImage: url })} />
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Advanced</h2>
          <p className="text-xs text-slate-500">
            Only paste scripts you trust (e.g. an analytics snippet). This is injected into every page's
            <code className="mx-1 rounded bg-slate-100 px-1">&lt;head&gt;</code> exactly as written and is only editable by a
            signed-in admin.
          </p>
          <TextAreaField label="Custom head script" rows={6} value={script} onChange={(e) => { setScript(e.target.value); setDirty(true); }} />
        </section>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} />
    </div>
  );
}
