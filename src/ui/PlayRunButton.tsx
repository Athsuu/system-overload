import { useGameStore } from '../store/useGameStore';
import { HexActionButton } from './HexActionButton';

export function PlayRunButton() {
  const startRun = useGameStore((state) => state.startRun);

  return (
    <HexActionButton
      label={'Start\nRun'}
      onClick={startRun}
      size="lg"
      variant="primary"
      className="hover:scale-[1.03]"
    />
  );
}
