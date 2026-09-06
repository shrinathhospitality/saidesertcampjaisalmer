export default function SaveBar({ dirty, saving, onSave, onDiscard, savedLabel = 'All changes saved' }) {
  return (
    <div className="sticky bottom-4 z-10 mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-5 py-3 shadow-lg backdrop-blur">
      <span className="text-sm text-slate-500">{dirty ? 'You have unsaved changes' : savedLabel}</span>
      <div className="flex gap-2">
        {dirty && (
          <button type="button" onClick={onDiscard} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
