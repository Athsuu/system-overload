import { DARK_HEX } from '../theme/darkHexTerminal';
import { hexPatternPath } from './skillTreeGeometry';

const HEX_CELL = 90;

function buildHexGridPaths(width: number, height: number): string[] {
  const hexW = HEX_CELL * Math.sqrt(3);
  const hexH = HEX_CELL * 1.5;
  const cols = Math.ceil(width / hexW) + 2;
  const rows = Math.ceil(height / hexH) + 2;
  const paths: string[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const offsetX = row % 2 === 0 ? 0 : hexW / 2;
      const cx = col * hexW + offsetX;
      const cy = row * hexH;
      paths.push(hexPatternPath(cx, cy, HEX_CELL * 0.48));
    }
  }

  return paths;
}

interface HexGridBackdropProps {
  patternId: string;
  width: number;
  height: number;
  showVignette?: boolean;
  gridTone?: 'hub' | 'arena';
}

export function HexGridBackdrop({
  patternId,
  width,
  height,
  showVignette = true,
  gridTone = 'arena',
}: HexGridBackdropProps) {
  const paths = buildHexGridPaths(width, height);
  const gridStroke = gridTone === 'hub' ? DARK_HEX.hexGridHub : DARK_HEX.hexGrid;

  return (
    <>
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <pattern id={patternId} width="100%" height="100%" patternUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill={DARK_HEX.canvasBg} />
            <g fill="none" stroke={gridStroke} strokeWidth={1}>
              {paths.map((d, index) => (
                <path key={index} d={d} />
              ))}
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      {showVignette && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 72% 58% at 50% 48%, ${DARK_HEX.vignette} 0%, transparent 62%)`,
          }}
        />
      )}
    </>
  );
}
