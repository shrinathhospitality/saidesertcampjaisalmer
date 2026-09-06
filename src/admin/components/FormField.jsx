const baseInput = 'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500';

export function TextField({ label, hint, ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input {...props} className={baseInput} />
      {hint && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
    </label>
  );
}

export function TextAreaField({ label, hint, rows = 4, ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <textarea {...props} rows={rows} className={`${baseInput} resize-y`} />
      {hint && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
    </label>
  );
}

export function SelectField({ label, hint, options = [], ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <select {...props} className={baseInput}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
    </label>
  );
}

export function CheckboxField({ label, ...props }) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      <input type="checkbox" {...props} className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500" />
      {label}
    </label>
  );
}

/** Editable list of plain strings (inclusions, exclusions, amenities, etc.). */
export function ListEditor({ label, hint, items = [], onChange, placeholder = 'Add item' }) {
  const update = (index, value) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };
  const remove = (index) => onChange(items.filter((_, i) => i !== index));
  const add = () => onChange([...items, '']);

  return (
    <div>
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      {hint && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
      <div className="mt-2 flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={item}
              placeholder={placeholder}
              onChange={(e) => update(index, e.target.value)}
              className={baseInput}
            />
            <button type="button" onClick={() => remove(index)} className="shrink-0 rounded-lg border border-slate-200 px-3 text-sm text-slate-500 hover:bg-slate-50">
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={add} className="self-start rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-slate-400">
          + Add item
        </button>
      </div>
    </div>
  );
}
