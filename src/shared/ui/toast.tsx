import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import { create } from 'zustand';

type ToastStatus = 'success' | 'error' | 'info';

type ToastOptions = {
  title?: string;
  description?: string;
  status?: ToastStatus;
  duration?: number;
  isClosable?: boolean;
};

type ToastItem = ToastOptions & {
  id: number;
};

type ToastStore = {
  toasts: ToastItem[];
  push: (toast: ToastOptions) => number;
  remove: (id: number) => void;
};

let toastId = 0;

const statusClassNameMap: Record<ToastStatus, string> = {
  success: 'border-emerald-500/50 bg-emerald-950/90',
  error: 'border-rose-500/50 bg-rose-950/90',
  info: 'border-sky-500/50 bg-zinc-900/95',
};

const useToastStore = create<ToastStore>(set => ({
  toasts: [],
  push: toast => {
    const id = ++toastId;
    set(state => ({
      toasts: [
        ...state.toasts,
        {
          duration: 2400,
          status: 'info',
          ...toast,
          id,
        },
      ],
    }));
    return id;
  },
  remove: id => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    }));
  },
}));

export function globalToast(toast: ToastOptions) {
  return useToastStore.getState().push(toast);
}

function ToastCard({ toast }: { toast: ToastItem }) {
  const remove = useToastStore(state => state.remove);

  useEffect(() => {
    if (toast.duration === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      remove(toast.id);
    }, toast.duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [remove, toast.duration, toast.id]);

  return (
    <div
      className={`w-full rounded-xl border px-4 py-3 text-sm text-white shadow-xl backdrop-blur ${statusClassNameMap[toast.status ?? 'info']}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {toast.title ? <div className="font-semibold">{toast.title}</div> : null}
          {toast.description ? <div className="mt-1 text-white/80">{toast.description}</div> : null}
        </div>
        {toast.isClosable ? (
          <button
            className="text-xs uppercase tracking-wide text-white/60 transition hover:text-white"
            onClick={() => remove(toast.id)}
            type="button">
            close
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ToastViewport() {
  const toasts = useToastStore(state => state.toasts);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {toasts.map(toast => (
        <div className="pointer-events-auto" key={toast.id}>
          <ToastCard toast={toast} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
