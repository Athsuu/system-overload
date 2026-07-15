import { DARK_HEX } from '../../theme/darkHexTerminal';
import { SettingsPanel } from '../settings/SettingsPanel';

export function SettingsOverlay() {
  return (
    <div className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center">
      <div
        className="so-animate-fade-in-slow absolute inset-0"
        style={{ backgroundColor: 'rgba(8, 8, 12, 0.92)' }}
      />
      <div
        className="so-animate-fade-in-slow absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 55% 45% at 50% 50%, ${DARK_HEX.vignette} 0%, transparent 70%)`,
        }}
      />
      <SettingsPanel />
    </div>
  );
}
