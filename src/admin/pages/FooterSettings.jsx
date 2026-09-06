import { useEffect, useState } from 'react';
import { useSingleton } from '../hooks/useSingleton.js';
import { useToast } from '../hooks/useToast.jsx';
import { confirmDiscard, useUnsavedChangesWarning } from '../hooks/useUnsavedChanges.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SaveBar from '../components/SaveBar.jsx';
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
      <PageHeader title="Footer" description="Footer about text, credit line, and which blocks are shown." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Content</h2>
          <TextAreaField label="About text" rows={4} value={footer.aboutText} onChange={(e) => set({ aboutText: e.target.value })} />
          <TextField label="Copyright text" hint="Leave blank to auto-generate “© {year} {site name}. All rights reserved.”" value={footer.copyrightText} onChange={(e) => set({ copyrightText: e.target.value })} />
          <TextField label="“Created by” credit text" value={footer.credit.text} onChange={(e) => setCredit({ text: e.target.value })} />
          <TextField label="Credit link URL" value={footer.credit.url} onChange={(e) => setCredit({ url: e.target.value })} />
          <CheckboxField label="Show newsletter signup block" checked={footer.showNewsletter} onChange={(e) => set({ showNewsletter: e.target.checked })} />
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Visible blocks</h2>
          <CheckboxField label="Quick links" checked={footer.blocks.quickLinks} onChange={(e) => setBlock('quickLinks', e.target.checked)} />
          <CheckboxField label="Legal links" checked={footer.blocks.legal} onChange={(e) => setBlock('legal', e.target.checked)} />
          <CheckboxField label="Contact information" checked={footer.blocks.contact} onChange={(e) => setBlock('contact', e.target.checked)} />
          <CheckboxField label="Social icons" checked={footer.blocks.social} onChange={(e) => setBlock('social', e.target.checked)} />
        </section>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} />
    </div>
  );
}
