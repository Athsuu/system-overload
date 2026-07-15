import { useEffect, useState } from 'react';
import { DARK_HEX } from '../../theme/darkHexTerminal';
import { HexGridBackdrop } from './HexGridBackdrop';

export type TerminalBackdropVariant = 'menu' | 'hub' | 'arena';

interface TerminalBackdropProps {
  patternId: string;
  variant?: TerminalBackdropVariant;
}

export function TerminalBackdrop({ patternId, variant = 'hub' }: TerminalBackdropProps) {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const onResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isArena = variant === 'arena';
  const isHubLike = variant === 'hub' || variant === 'menu';
  const centerY = isArena ? '50%' : '42%';
  const edgeFadeStart = isArena ? '32%' : '40%';

  return (
    <div className="pointer-events-none absolute inset-0">
      <HexGridBackdrop
        patternId={patternId}
        width={size.width}
        height={size.height}
        showVignette={false}
        gridTone={isArena ? 'arena' : 'hub'}
      />
      <div
        className={`so-terminal-vignette absolute inset-0 ${isArena ? 'so-terminal-vignette--arena' : ''}`}
        aria-hidden
      />
      <div className="so-terminal-scanlines absolute inset-0" aria-hidden />
      {isHubLike && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 58% 48% at 50% 48%, ${DARK_HEX.hubCenterGlow} 0%, transparent 68%)`,
          }}
          aria-hidden
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% ${centerY}, transparent ${edgeFadeStart}, ${DARK_HEX.canvasBgDeep} 100%)`,
        }}
        aria-hidden
      />
    </div>
  );
}
