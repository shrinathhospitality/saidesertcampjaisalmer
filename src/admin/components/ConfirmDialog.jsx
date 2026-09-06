export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', danger = true, busy = false, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[150] grid place-items-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
