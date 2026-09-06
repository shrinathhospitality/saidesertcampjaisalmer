import { useEffect, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from 'react-icons/fi';
import { contentApi } from '../services/content.js';
import { useSingleton } from '../hooks/useSingleton.js';
import { useToast } from '../hooks/useToast.jsx';
import { confirmDiscard, useUnsavedChangesWarning } from '../hooks/useUnsavedChanges.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SaveBar from '../components/SaveBar.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import { CheckboxField, TextField } from '../components/FormField.jsx';

let tempId = 0;

export default function HeaderSettings() {
  const { data: settings, loading: settingsLoading, save: saveSettings, saving: savingSettings } = useSingleton('site-settings');
  const [nav, setNav] = useState(null);
  const [original, setOriginal] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    contentApi.list('navigation').then((items) => {
      const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setNav(sorted);
      setOriginal(sorted);
    });
  }, []);

  useEffect(() => {
    if (settings) setAnnouncement(settings.header?.announcement ?? { enabled: false, text: '', link: '' });
  }, [settings]);

  useUnsavedChangesWarning(dirty);

  if (settingsLoading || !nav || !announcement) return <LoadingSpinner label="Loading header settings…" />;

  const markDirty = () => setDirty(true);

  const updateItem = (index, patch) => {
    setNav((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    markDirty();
  };

  const updateChild = (index, childIndex, patch) => {
    setNav((list) => list.map((item, i) => {
      if (i !== index) return item;
      const children = [...(item.children || [])];
      children[childIndex] = { ...children[childIndex], ...patch };
      return { ...item, children };
    }));
    markDirty();
  };

  const addItem = () => {
    setNav((list) => [...list, { id: `new-${tempId++}`, label: 'New Item', path: '/', external: false, newTab: false, enabled: true, children: [] }]);
    markDirty();
  };

  const addChild = (index) => {
    setNav((list) => list.map((item, i) => (i === index ? { ...item, children: [...(item.children || []), { id: `new-${tempId++}`, label: 'New Link', path: '/', description: '', external: false, newTab: false, enabled: true }] } : item)));
    markDirty();
  };

  const removeItem = (index) => {
    setNav((list) => list.filter((_, i) => i !== index));
    markDirty();
  };

  const removeChild = (index, childIndex) => {
    setNav((list) => list.map((item, i) => (i === index ? { ...item, children: item.children.filter((_, ci) => ci !== childIndex) } : item)));
    markDirty();
  };

  const move = (index, dir) => {
    setNav((list) => {
      const next = [...list];
      const target = index + dir;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    markDirty();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const originalIds = new Set(original.map((i) => i.id));
      const currentIds = new Set(nav.map((i) => i.id));

      for (const item of original) {
        if (!currentIds.has(item.id)) await contentApi.remove('navigation', item.id);
      }

      const saved = [];
      for (const item of nav) {
        const { id, ...body } = item;
        if (originalIds.has(id)) {
          saved.push(await contentApi.update('navigation', id, body));
        } else {
          saved.push(await contentApi.create('navigation', body));
        }
      }
      await contentApi.reorder('navigation', saved.map((i) => i.id));
      await saveSettings({ header: { ...settings.header, announcement } });

      const reloaded = await contentApi.list('navigation');
      const sorted = [...reloaded].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setNav(sorted);
      setOriginal(sorted);
      setDirty(false);
      toast.success('Header settings saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!confirmDiscard(dirty)) return;
    setNav(original);
    setAnnouncement(settings.header?.announcement ?? { enabled: false, text: '', link: '' });
    setDirty(false);
  };

  return (
    <div>
      <PageHeader title="Header" description="Logo, announcement bar, and the site's main navigation menu." />

      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Logo &amp; CTA</h2>
          <p className="text-xs text-slate-400">The logo and booking button label are shared with Site Settings.</p>
          <MediaPicker label="Logo" value={settings.logo} onChange={(url) => saveSettings({ logo: url }).then(() => toast.success('Logo updated'))} />
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Announcement bar</h2>
          <CheckboxField label="Show announcement bar" checked={announcement.enabled} onChange={(e) => { setAnnouncement((a) => ({ ...a, enabled: e.target.checked })); markDirty(); }} />
          <TextField label="Text" value={announcement.text} onChange={(e) => { setAnnouncement((a) => ({ ...a, text: e.target.value })); markDirty(); }} />
          <TextField label="Link (optional)" value={announcement.link} onChange={(e) => { setAnnouncement((a) => ({ ...a, link: e.target.value })); markDirty(); }} />
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Navigation menu</h2>
            <button type="button" onClick={addItem} className="flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400">
              <FiPlus /> Add menu item
            </button>
          </div>

          <div className="space-y-4">
            {nav.map((item, index) => (
              <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <input value={item.label} onChange={(e) => updateItem(index, { label: e.target.value })} placeholder="Label" className="w-40 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  <input value={item.path} onChange={(e) => updateItem(index, { path: e.target.value })} placeholder="/path" className="w-40 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
                  <label className="flex items-center gap-1 text-xs text-slate-500"><input type="checkbox" checked={item.external} onChange={(e) => updateItem(index, { external: e.target.checked })} /> External</label>
                  <label className="flex items-center gap-1 text-xs text-slate-500"><input type="checkbox" checked={item.newTab} onChange={(e) => updateItem(index, { newTab: e.target.checked })} /> New tab</label>
                  <label className="flex items-center gap-1 text-xs text-slate-500"><input type="checkbox" checked={item.enabled} onChange={(e) => updateItem(index, { enabled: e.target.checked })} /> Enabled</label>
                  <div className="ml-auto flex items-center gap-1">
                    <IconBtn onClick={() => move(index, -1)}><FiArrowUp /></IconBtn>
                    <IconBtn onClick={() => move(index, 1)}><FiArrowDown /></IconBtn>
                    <IconBtn onClick={() => removeItem(index)} danger><FiTrash2 /></IconBtn>
                  </div>
                </div>

                <div className="mt-3 space-y-2 border-t border-dashed border-slate-200 pt-3">
                  {(item.children || []).map((child, ci) => (
                    <div key={child.id} className="ml-4 flex flex-wrap items-center gap-2">
                      <input value={child.label} onChange={(e) => updateChild(index, ci, { label: e.target.value })} placeholder="Label" className="w-36 rounded-lg border border-slate-200 px-2 py-1 text-xs" />
                      <input value={child.path} onChange={(e) => updateChild(index, ci, { path: e.target.value })} placeholder="/path" className="w-36 rounded-lg border border-slate-200 px-2 py-1 text-xs" />
                      <input value={child.description || ''} onChange={(e) => updateChild(index, ci, { description: e.target.value })} placeholder="Description" className="w-48 rounded-lg border border-slate-200 px-2 py-1 text-xs" />
                      <label className="flex items-center gap-1 text-xs text-slate-500"><input type="checkbox" checked={child.enabled} onChange={(e) => updateChild(index, ci, { enabled: e.target.checked })} /> Enabled</label>
                      <IconBtn onClick={() => removeChild(index, ci)} danger><FiTrash2 /></IconBtn>
                    </div>
                  ))}
                  <button type="button" onClick={() => addChild(index)} className="ml-4 text-xs font-semibold text-slate-400 hover:text-slate-600">+ Add dropdown item</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <SaveBar dirty={dirty} saving={saving || savingSettings} onSave={handleSave} onDiscard={handleDiscard} />
    </div>
  );
}

function IconBtn({ children, onClick, danger }) {
  return (
    <button type="button" onClick={onClick} className={`grid h-7 w-7 place-items-center rounded-lg border text-xs ${danger ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
      {children}
    </button>
  );
}
