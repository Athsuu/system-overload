import type { ModuleGlyphId } from '../../store/moduleTree';

const ICON_SIZE = 24;

interface ModuleGlyphIconProps {
  glyph: ModuleGlyphId;
  size?: number;
  color?: string;
}

function GlyphPaths({ glyph }: { glyph: ModuleGlyphId }) {
  switch (glyph) {
    case 'degats':
      return (
        <path
          d="M13 2 L8 13 H12 L10 22 L18 10 H14 L16 2 Z"
          fill="currentColor"
        />
      );
    case 'cadence':
      return (
        <path
          d="M7 6 L13 12 L7 18 M13 6 L19 12 L13 18"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'reach':
      return (
        <>
          <circle cx="12" cy="12" r="3.25" fill="currentColor" />
          <circle
            cx="12"
            cy="12"
            r="7.25"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeOpacity={0.85}
          />
        </>
      );
    case 'splash':
      return (
        <>
          <circle cx="12" cy="12" r="2.75" fill="currentColor" fillOpacity={0.92} />
          <circle
            cx="12"
            cy="12"
            r="6.25"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.35}
            strokeOpacity={0.78}
          />
          <circle
            cx="12"
            cy="12"
            r="9.75"
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            strokeOpacity={0.42}
            strokeDasharray="2.5 3.5"
          />
        </>
      );
    case 'shard':
      return (
        <>
          <polygon
            points="12 3 18 6.5 18 17.5 12 21 6 17.5 6 6.5"
            fill="currentColor"
            fillOpacity={0.18}
            stroke="currentColor"
            strokeWidth={1.25}
            strokeOpacity={0.9}
          />
          <polygon
            points="12 8 15 10 15 14 12 16 9 14 9 10"
            fill="currentColor"
            fillOpacity={0.5}
            stroke="currentColor"
            strokeWidth={0.75}
            strokeOpacity={0.65}
          />
        </>
      );
    case 'victory':
      return (
        <>
          <path
            d="M8 8 H16 V11 C16 15 12 18 12 18 C12 18 8 15 8 11 Z"
            fill="currentColor"
            fillOpacity={0.22}
            stroke="currentColor"
            strokeWidth={1.25}
            strokeOpacity={0.9}
          />
          <path
            d="M12 18 V21 M9 21 H15"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeOpacity={0.75}
          />
          <path
            d="M10 11 L11.5 12.5 L14.5 9.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      );
    case 'magnet':
      return (
        <>
          <path
            d="M7.5 7.5 V13.5 C7.5 16.4 9.4 18.5 12 18.5 C14.6 18.5 16.5 16.4 16.5 13.5 V7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <rect x="6" y="5" width="4.5" height="3.5" rx="1" fill="currentColor" />
          <rect x="13.5" y="5" width="4.5" height="3.5" rx="1" fill="currentColor" />
          <circle cx="12" cy="13.5" r="1.35" fill="currentColor" fillOpacity={0.45} />
        </>
      );
    case 'thermique':
      return (
        <>
          <path
            d="M12 3 C10.5 7.5 7 9.5 7 14 C7 17.5 9.2 20 12 20 C14.8 20 17 17.5 17 14 C17 10.5 13.5 8.5 12 3 Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M12 10 C11 12 10 13 10 14.5 C10 16 11 17 12 17 C13 17 14 16 14 14.5 C14 13 13 12 12 10 Z"
            fill="#0a0a0f"
            opacity="0.55"
          />
        </>
      );
    case 'flux':
      return (
        <>
          <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 7 V12 L15.5 13.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 4.5 L18.5 7.5 L15.5 10.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 4.5 L21.5 7.5 L18.5 10.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
          <path
            d="M3 10 H5.5 M2 14 H5 M4 17.5 H6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            opacity="0.45"
          />
        </>
      );
    case 'dissipate':
      return (
        <>
          <path
            d="M12 4 V20 M8 8 H16 M8 16 H16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeOpacity={0.85}
          />
          <path
            d="M9 12 H15"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            opacity={0.55}
          />
        </>
      );
    case 'seal':
      return (
        <>
          <polygon
            points="12 4 18 7 18 17 12 20 6 17 6 7"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeOpacity={0.9}
          />
          <path
            d="M8 12 H16"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </>
      );
    case 'amplify':
      return (
        <>
          <path
            d="M13 2 L8 13 H12 L10 22 L18 10 H14 L16 2 Z"
            fill="currentColor"
            fillOpacity={0.75}
          />
          <path
            d="M4 14 L7 11 M4 18 L8 18"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinecap="round"
            opacity={0.55}
          />
        </>
      );
  }
}

/** Icône pour tooltips / panneaux HTML. */
export function ModuleBranchIcon({ glyph, size = ICON_SIZE, color = 'currentColor' }: ModuleGlyphIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${ICON_SIZE} ${ICON_SIZE}`}
      fill="none"
      style={{ color }}
      aria-hidden
    >
      <GlyphPaths glyph={glyph} />
    </svg>
  );
}

interface ModuleTreeBranchGlyphProps {
  glyph: ModuleGlyphId;
  x: number;
  y: number;
  color: string;
  scale?: number;
}

/** Glyphe SVG inline pour les nœuds du module tree. */
export function ModuleTreeBranchGlyph({ glyph, x, y, color, scale }: ModuleTreeBranchGlyphProps) {
  const resolvedScale = scale ?? 0.85;
  const offset = (ICON_SIZE * resolvedScale) / 2;
  return (
    <g
      transform={`translate(${x - offset}, ${y - offset}) scale(${resolvedScale})`}
      style={{ color }}
    >
      <GlyphPaths glyph={glyph} />
    </g>
  );
}
