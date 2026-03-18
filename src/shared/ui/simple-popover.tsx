import type { CSSProperties, PropsWithChildren, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type SimplePopoverProps = PropsWithChildren<{
  trigger: ReactNode;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  matchTriggerWidth?: boolean;
}>;

export function SimplePopover({
  trigger,
  children,
  contentClassName,
  contentStyle,
  matchTriggerWidth = false,
}: SimplePopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative inline-flex" ref={rootRef}>
      <div
        ref={triggerRef}
        onClick={() => {
          setOpen(value => !value);
        }}>
        {trigger}
      </div>

      {open ? (
        <div
          className={contentClassName}
          style={{
            left: 0,
            marginTop: 8,
            minWidth: matchTriggerWidth ? triggerRef.current?.offsetWidth : undefined,
            position: 'absolute',
            top: '100%',
            zIndex: 1000,
            ...contentStyle,
          }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
