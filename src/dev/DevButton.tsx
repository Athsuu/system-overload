import { type ReactNode, useEffect, useRef, useState } from 'react';

interface DevButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export function DevButton({ children, onClick, variant = 'default', disabled = false }: DevButtonProps) {
  const base =
    'rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40';
  const styles =
    variant === 'danger'
      ? 'border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-400 hover:bg-red-500/20'
      : 'border-white/10 bg-white/5 text-white/80 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200';

  return (
    <button type="button" className={`${base} ${styles}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

const ARM_TIMEOUT_MS = 3000;

/** Bouton dangereux à double confirmation : 1er clic arme (rouge, "Confirmer ?"), 2e clic dans les 3s exécute. */
export function DevConfirmButton({
  children,
  onConfirm,
}: {
  children: ReactNode;
  onConfirm: () => void;
}) {
  const [armed, setArmed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const handleClick = () => {
    if (!armed) {
      setArmed(true);
      timeoutRef.current = setTimeout(() => setArmed(false), ARM_TIMEOUT_MS);
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setArmed(false);
    onConfirm();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
        armed
          ? 'border-red-400 bg-red-500/30 text-red-100'
          : 'border-red-500/30 bg-red-500/10 text-red-300 hover:border-red-400 hover:bg-red-500/20'
      }`}
    >
      {armed ? 'Confirmer ?' : children}
    </button>
  );
}
