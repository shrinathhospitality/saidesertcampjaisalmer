import { useEffect, useRef, useState } from 'react';
import { FiImage, FiUpload, FiX } from 'react-icons/fi';
import { mediaApi } from '../services/media.js';
import { useToast } from '../hooks/useToast.jsx';

/** A single-image field: shows a preview, and opens a small library/upload modal to change it. */
export default function MediaPicker({ label, value, onChange, hint }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      {hint && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
      <div className="mt-2 flex items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {value ? <img src={value} alt="" className="h-full w-full object-contain" /> : <FiImage className="text-slate-300" />}
        </div>
        <div className="flex flex-col gap-1">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            Choose image
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} className="text-left text-xs text-slate-400 hover:text-red-600">
              Remove
            </button>
          )}
        </div>
      </div>
      {open && (
        <MediaPickerModal
          currentValue={value}
          onClose={() => setOpen(false)}
          onSelect={(url) => {
            onChange(url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function MediaPickerModal({ onClose, onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    mediaApi.list().then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const record = await mediaApi.upload(file, { title: file.name });
      setItems((list) => [record, ...list]);
      onSelect(record.url);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] grid place-items-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">Select an image</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><FiX /></button>
        </div>
        <div className="border-b border-slate-100 px-5 py-3">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleUpload(e.target.files?.[0])} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 disabled:opacity-50"
          >
            <FiUpload /> {uploading ? 'Uploading…' : 'Upload new image'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-sm text-slate-400">Loading media…</p>
          ) : items.filter((i) => i.kind === 'image').length === 0 ? (
            <p className="text-sm text-slate-400">No images uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.filter((i) => i.kind === 'image').map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.url)}
                  className="group aspect-square overflow-hidden rounded-lg border border-slate-200 hover:border-slate-500"
                  title={item.title}
                >
                  <img src={item.url} alt={item.alt || item.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
