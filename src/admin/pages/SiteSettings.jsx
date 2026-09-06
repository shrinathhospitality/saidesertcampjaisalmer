import { useEffect, useState } from 'react';
import { useSingleton } from '../hooks/useSingleton.js';
import { useToast } from '../hooks/useToast.jsx';
import { useUnsavedChangesWarning, confirmDiscard } from '../hooks/useUnsavedChanges.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SaveBar from '../components/SaveBar.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import { TextField, TextAreaField } from '../components/FormField.jsx';

export default function SiteSettings() {
  const { data, loading, error, saving, save } = useSingleton('site-settings');
  const [form, setForm] = useState(null);
  const [dirty, setDirty] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (data) {
      setForm(data);
      setDirty(false);
    }
  }, [data]);

  useUnsavedChangesWarning(dirty);

  if (loading || !form) return <LoadingSpinner label="Loading site settings…" />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>;

  const set = (path, value) => {
    setForm((prev) => setPath(prev, path, value));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      await save(form);
      setDirty(false);
      toast.success('Site settings saved');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDiscard = () => {
    if (!confirmDiscard(dirty)) return;
    setForm(data);
    setDirty(false);
  };

  return (
    <div>
      <PageHeader title="Site Settings" description="Global identity, contact details, and social links used across the whole website." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Identity</h2>
          <TextField label="Camp / resort name" value={form.siteName} onChange={(e) => set('siteName', e.target.value)} />
          <TextField label="Tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
          <TextField label="Website URL (baseUrl)" hint="Used to build canonical links and sitemaps. Update this to your live domain before launch." value={form.baseUrl} onChange={(e) => set('baseUrl', e.target.value)} />
          <TextField label="Booking / enquiry button label" value={form.bookNowLabel} onChange={(e) => set('bookNowLabel', e.target.value)} />
          <TextField label="Currency" value={form.currency} onChange={(e) => set('currency', e.target.value)} />
          <MediaPicker label="Logo" value={form.logo} onChange={(url) => set('logo', url)} />
          <MediaPicker label="Favicon" value={form.favicon} onChange={(url) => set('favicon', url)} accept="image" />
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Contact</h2>
          <TextField label="Phone" value={form.contact.phone} onChange={(e) => set('contact.phone', e.target.value)} />
          <TextField label="WhatsApp number" hint="Include country code, digits only, e.g. 919999999999" value={form.contact.whatsapp} onChange={(e) => set('contact.whatsapp', e.target.value)} />
          <TextField label="Email" type="email" value={form.contact.email} onChange={(e) => set('contact.email', e.target.value)} />
          <TextAreaField label="Address" rows={2} value={form.contact.address} onChange={(e) => set('contact.address', e.target.value)} />
          <TextField label="Hours" value={form.contact.hours} onChange={(e) => set('contact.hours', e.target.value)} />
          <TextField label="Google Maps link" value={form.contact.mapLink} onChange={(e) => set('contact.mapLink', e.target.value)} />
          <TextAreaField label="Map embed code" hint="Paste an iframe embed code or leave as a placeholder." rows={3} value={form.contact.mapEmbed} onChange={(e) => set('contact.mapEmbed', e.target.value)} />
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Social links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {form.social.map((item, index) => (
              <div key={item.icon} className="flex items-end gap-2">
                <TextField
                  label={item.name}
                  value={item.url}
                  onChange={(e) => set(`social.${index}.url`, e.target.value)}
                />
                <label className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <input type="checkbox" checked={item.enabled} onChange={(e) => set(`social.${index}.enabled`, e.target.checked)} />
                  Show
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Newsletter block</h2>
          <TextField label="Title" value={form.newsletterTitle} onChange={(e) => set('newsletterTitle', e.target.value)} />
          <TextAreaField label="Text" rows={2} value={form.newsletterText} onChange={(e) => set('newsletterText', e.target.value)} />
        </section>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={handleSave} onDiscard={handleDiscard} />
    </div>
  );
}

function setPath(obj, path, value) {
  const keys = path.split('.');
  const next = structuredClone(obj);
  let cursor = next;
  for (let i = 0; i < keys.length - 1; i++) {
    cursor = cursor[keys[i]];
  }
  cursor[keys[keys.length - 1]] = value;
  return next;
}
