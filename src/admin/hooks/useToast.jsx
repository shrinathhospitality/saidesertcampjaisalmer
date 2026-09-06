import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = 'success') => {
    const id = nextId++;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => remove(id), 4500);
  }, [remove]);

  const toast = {
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error'),
    info: (message) => push(message, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[200] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${
              t.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : t.type === 'info'
                ? 'border-slate-200 bg-white text-slate-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
