import { FiArrowLeft, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { confirmDiscard } from '../hooks/useUnsavedChanges.js';
import PageHeader from './PageHeader.jsx';
import SaveBar from './SaveBar.jsx';

export default function EditorShell({
  title, backLabel, backPath, navigate, dirty, saving, onSave, onDiscard, onDelete, previewHref, children,
}) {
  const handleBack = () => {
    if (!confirmDiscard(dirty)) return;
    navigate(backPath);
  };

  return (
    <div>
      <button onClick={handleBack} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
        <FiArrowLeft /> {backLabel}
      </button>
      <PageHeader
        title={title}
        actions={
          <>
            {previewHref && (
              <a href={previewHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                <FiExternalLink /> Preview
              </a>
            )}
            {onDelete && (
              <button onClick={onDelete} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                <FiTrash2 /> Delete
              </button>
            )}
          </>
        }
      />
      {children}
      <SaveBar dirty={Boolean(dirty)} saving={saving} onSave={onSave} onDiscard={onDiscard} />
    </div>
  );
}
