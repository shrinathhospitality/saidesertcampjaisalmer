export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center">
      <p className="text-base font-semibold text-slate-700">{title}</p>
      {message && <p className="max-w-sm text-sm text-slate-500">{message}</p>}
      {action}
    </div>
  );
}
