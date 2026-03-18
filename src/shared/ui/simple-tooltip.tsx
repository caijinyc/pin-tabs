import type { PropsWithChildren, ReactNode } from 'react';

export function SimpleTooltip({ label, children }: PropsWithChildren<{ label: ReactNode }>) {
  const title = typeof label === 'string' ? label : undefined;
  return (
    <span title={title} className="inline-flex">
      {children}
    </span>
  );
}
