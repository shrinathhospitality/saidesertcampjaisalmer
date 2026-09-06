const TONES = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  Contacted: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function StatusBadge({ value }) {
  const tone = TONES[value] || 'bg-slate-100 text-slate-600 border-slate-200';
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${tone}`}>{String(value)}</span>;
}
