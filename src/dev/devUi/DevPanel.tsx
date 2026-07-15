import type { ReactNode } from 'react';

interface DevPanelProps {
  title?: string;
  children: ReactNode;
}

export function DevPanel({ title, children }: DevPanelProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      {title && <p className="text-[12px] tracking-wider text-white/35 uppercase">{title}</p>}
      {children}
    </div>
  );
}
