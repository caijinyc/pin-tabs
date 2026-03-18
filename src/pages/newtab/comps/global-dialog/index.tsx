import { Button } from '@chakra-ui/react';
import React from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';

type ConfirmParams = { title: React.ReactNode; content: React.ReactNode; onOk?: () => void; onCancel?: () => void };
let count = 0;
export const useDialogStore = create<
  ConfirmParams & {
    count: number;
  }
>(() => ({
  title: '',
  content: '',
  count: 0,
}));

export const dialog = {
  confirm: (props: ConfirmParams) => {
    useDialogStore.setState({
      ...props,
      count: count++,
    });
  },
};

export function GlobalDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { title, content, onOk, onCancel } = useDialogStore();

  React.useEffect(() => {
    if (count > 0) {
      setIsOpen(true);
    }
  }, [count]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 text-white shadow-2xl">
        <div className="mb-4 text-lg font-semibold">{title}</div>
        <div className="mb-6 text-sm text-white/80">{content}</div>
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => {
              setIsOpen(false);
              onCancel?.();
            }}
            type="button"
            variant="outline">
            No
          </Button>
          <Button
            colorPalette="red"
            onClick={() => {
              setIsOpen(false);
              onOk?.();
            }}
            type="button">
            Yes
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
