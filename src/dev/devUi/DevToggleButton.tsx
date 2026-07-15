import { DevButton } from '../DevButton';

interface DevToggleButtonProps {
  label: string;
  active: boolean;
  onToggle: () => void;
}

export function DevToggleButton({ label, active, onToggle }: DevToggleButtonProps) {
  return (
    <DevButton onClick={onToggle}>
      {label} {active ? 'ON' : 'OFF'}
    </DevButton>
  );
}
