import { DevButton } from '../DevButton';
import { useDevCopyFeedback } from './useDevCopyFeedback';

interface DevCopyButtonProps {
  label: string;
  copiedLabel?: string;
  onCopy: () => Promise<boolean>;
  disabled?: boolean;
}

export function DevCopyButton({
  label,
  copiedLabel = 'Copié ✓',
  onCopy,
  disabled = false,
}: DevCopyButtonProps) {
  const { copied, runCopy } = useDevCopyFeedback();

  return (
    <DevButton disabled={disabled} onClick={() => void runCopy(onCopy)}>
      {copied ? copiedLabel : label}
    </DevButton>
  );
}
