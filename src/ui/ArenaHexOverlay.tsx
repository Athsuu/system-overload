import { useEffect, useState } from 'react';
import { HexGridBackdrop } from './HexGridBackdrop';

export function ArenaHexOverlay() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const onResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      <HexGridBackdrop patternId="arenaHexGrid" width={size.width} height={size.height} />
    </div>
  );
}
