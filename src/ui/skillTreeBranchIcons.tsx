import type { SkillIconBranch } from '../store/skillTree';

const ICON_SIZE = 24;

interface SkillBranchIconProps {
  branch: SkillIconBranch;
  size?: number;
  color?: string;
}

function BranchIconPaths({ branch }: { branch: SkillIconBranch }) {
  switch (branch) {
    case 'degats':
      return (
        <path
          d="M13 2 L8 13 H12 L10 22 L18 10 H14 L16 2 Z"
          fill="currentColor"
        />
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
  }
}

/** Icône de branche pour tooltips / panneaux HTML. */
export function SkillBranchIcon({ branch, size = ICON_SIZE, color = 'currentColor' }: SkillBranchIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${ICON_SIZE} ${ICON_SIZE}`}
      fill="none"
      style={{ color }}
      aria-hidden
    >
      <BranchIconPaths branch={branch} />
    </svg>
  );
}

interface SkillTreeBranchGlyphProps {
  branch: SkillIconBranch;
  x: number;
  y: number;
  color: string;
  scale?: number;
}

/** Glyphe SVG inline pour les nœuds du skill tree. */
export function SkillTreeBranchGlyph({ branch, x, y, color, scale = 0.85 }: SkillTreeBranchGlyphProps) {
  const offset = (ICON_SIZE * scale) / 2;
  return (
    <g
      transform={`translate(${x - offset}, ${y - offset}) scale(${scale})`}
      style={{ color }}
    >
      <BranchIconPaths branch={branch} />
    </g>
  );
}
