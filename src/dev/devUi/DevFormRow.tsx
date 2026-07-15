import type { FormEvent, ReactNode } from 'react';

interface DevFormRowProps {
  submitLabel: string;
  onSubmit: () => void;
  children: ReactNode;
}

const SUBMIT_CLASS =
  'rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-[13px] font-medium text-cyan-200 transition hover:border-cyan-400 hover:bg-cyan-500/20';

export function DevFormRow({ submitLabel, onSubmit, children }: DevFormRowProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-1.5">
      {children}
      <button type="submit" className={SUBMIT_CLASS}>
        {submitLabel}
      </button>
    </form>
  );
}
