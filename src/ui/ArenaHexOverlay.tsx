import { TerminalBackdrop } from './hub/TerminalBackdrop';

export function ArenaHexOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <TerminalBackdrop patternId="arenaHexGrid" variant="arena" />
    </div>
  );
}
