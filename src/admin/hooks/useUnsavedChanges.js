import { useEffect } from 'react';

/**
 * Warns on a hard page close/refresh while there are unsaved edits.
 * (In-app navigation guarding is handled per-page by editors calling
 * `confirmDiscard()` before routing away — a full navigation blocker
 * requires a data router, which this app intentionally doesn't use to
 * keep the admin's routing plain and easy to extend.)
 */
export function useUnsavedChangesWarning(isDirty) {
  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}

export function confirmDiscard(isDirty) {
  if (!isDirty) return true;
  return window.confirm('You have unsaved changes. Leave without saving?');
}
