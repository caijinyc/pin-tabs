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
  success: 'border-green-500/30 bg-green-50 text-green-900 dark:bg-green-900/50 dark:text-green-100 dark:border-green-500/50',
  error: 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-900/50 dark:text-red-100 dark:border-red-500/50',
  info: 'border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100 dark:border-blue-500/50',
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
      className={`w-full rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${statusClassNameMap[toast.status ?? 'info']}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {toast.title ? <div className="font-semibold">{toast.title}</div> : null}
          {toast.description ? <div className="mt-1 opacity-80">{toast.description}</div> : null}
        </div>
        {toast.isClosable ? (
          <button
            className="text-xs uppercase tracking-wide opacity-60 transition hover:opacity-100"
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
