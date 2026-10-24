import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Tone = 'success' | 'error';
interface Toast {
  id: number;
  tone: Tone;
  message: string;
}

interface ToastApi {
  success(message: string): void;
  error(message: string): void;
}

const ToastContext = createContext<ToastApi | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts(list => list.filter(t => t.id !== id)), []);
  const push = useCallback(
    (tone: Tone, message: string) => {
      const id = nextId++;
      setToasts(list => [...list.slice(-3), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({ success: message => push('success', message), error: message => push('error', message) }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map(toast => (
          <div
            key={toast.id}
            role="status"
            className="toast-enter pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface-2/95 px-4 py-3 text-sm shadow-2xl shadow-black/40"
          >
            {toast.tone === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            ) : (
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
            )}
            <p className="flex-1 text-fg">{toast.message}</p>
            <button onClick={() => dismiss(toast.id)} className="text-muted hover:text-fg" aria-label="Dismiss notification">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
