/** Ajuste automatiquement libellés + typo pour tenir dans l'hex intérieur d'un HexActionButton. */

export interface HexButtonLayout {
  width: number;
  height: number;
  innerR: number;
  cx: number;
  cy: number;
  baseFontPx: number;
}

export interface HexButtonLabelFit {
  lines: string[];
  fontSizePx: number;
  letterSpacingEm: number;
  lineHeightRatio: number;
}

const VIEWBOX_W = 100;
const VIEWBOX_H = 88;
const MIN_FONT_PX = 8;
const MIN_LETTER_SPACING_EM = 0.03;
const MAX_LETTER_SPACING_EM = 0.12;
const LINE_HEIGHT_RATIO = 1.14;
const HORIZ_INSET = 0.16;
const VERT_INSET = 0.14;
const MAX_LINES = 6;

const FONT_FAMILY = "'Rajdhani', system-ui, sans-serif";

let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureCtx(): CanvasRenderingContext2D {
  if (!measureCtx) {
    const canvas = document.createElement('canvas');
    measureCtx = canvas.getContext('2d');
    if (!measureCtx) {
      throw new Error('Canvas 2D unavailable for hex label measurement');
    }
  }
  return measureCtx;
}

function buildFont(fontPx: number): string {
  return `700 ${fontPx}px ${FONT_FAMILY}`;
}

export function measureHexLabelLineWidth(text: string, fontPx: number, letterSpacingEm: number): number {
  const ctx = getMeasureCtx();
  ctx.font = buildFont(fontPx);
  const upper = text.toUpperCase();
  const base = ctx.measureText(upper).width;
  if (upper.length <= 1) return base;
  return base + letterSpacingEm * fontPx * (upper.length - 1);
}

function hexHalfWidthAt(innerR: number, dyViewBox: number): number {
  const r = innerR * (1 - HORIZ_INSET);
  return Math.max(0, r - Math.abs(dyViewBox) / Math.sqrt(3));
}

function verticalSpanPx(innerR: number, sy: number): number {
  return innerR * Math.sqrt(3) * sy * (1 - VERT_INSET * 2);
}

function wrapParagraph(text: string, maxWidthPx: number, fontPx: number, letterSpacingEm: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (measureHexLabelLineWidth(candidate, fontPx, letterSpacingEm) <= maxWidthPx) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (measureHexLabelLineWidth(word, fontPx, letterSpacingEm) > maxWidthPx) {
      lines.push(word);
      current = '';
    }
  }

  if (current) lines.push(current);
  return lines;
}

function expandLabelLines(label: string, maxWidthPx: number, fontPx: number, letterSpacingEm: number): string[] {
  const paragraphs = label.split('\n');
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) continue;
    lines.push(...wrapParagraph(paragraph, maxWidthPx, fontPx, letterSpacingEm));
  }

  return lines;
}

function verifyLinesFit(
  lines: string[],
  layout: HexButtonLayout,
  fontPx: number,
  letterSpacingEm: number,
): boolean {
  if (lines.length === 0 || lines.length > MAX_LINES) return false;

  const sx = layout.width / VIEWBOX_W;
  const sy = layout.height / VIEWBOX_H;
  const cyPx = layout.cy * sy;
  const lineHeightPx = fontPx * LINE_HEIGHT_RATIO;
  const totalHeight = lines.length * lineHeightPx;

  if (totalHeight > verticalSpanPx(layout.innerR, sy) + 0.5) return false;

  for (let i = 0; i < lines.length; i += 1) {
    const lineCenterPx = cyPx - ((lines.length - 1) / 2) * lineHeightPx + i * lineHeightPx;
    const dyViewBox = (lineCenterPx - cyPx) / sy;
    const maxWidthPx = hexHalfWidthAt(layout.innerR, dyViewBox) * 2 * sx;

    if (measureHexLabelLineWidth(lines[i], fontPx, letterSpacingEm) > maxWidthPx + 0.5) {
      return false;
    }
  }

  return true;
}

function fitAtFontSize(
  label: string,
  layout: HexButtonLayout,
  fontPx: number,
  letterSpacingEm: number,
): string[] | null {
  const sx = layout.width / VIEWBOX_W;
  const sy = layout.height / VIEWBOX_H;
  const lineHeightPx = fontPx * LINE_HEIGHT_RATIO;

  for (let targetLines = 1; targetLines <= MAX_LINES; targetLines += 1) {
    const maxDyViewBox = (((targetLines - 1) / 2) * lineHeightPx) / sy;
    const wrapWidthPx = hexHalfWidthAt(layout.innerR, maxDyViewBox) * 2 * sx;
    const lines = expandLabelLines(label, wrapWidthPx, fontPx, letterSpacingEm);

    if (lines.length === 0 || lines.length > targetLines) continue;
    if (verifyLinesFit(lines, layout, fontPx, letterSpacingEm)) return lines;
  }

  return null;
}

export function fitHexButtonLabel(label: string, layout: HexButtonLayout): HexButtonLabelFit {
  const normalized = label.trim();
  if (!normalized) {
    return {
      lines: [''],
      fontSizePx: layout.baseFontPx,
      letterSpacingEm: MAX_LETTER_SPACING_EM,
      lineHeightRatio: LINE_HEIGHT_RATIO,
    };
  }

  for (let fontPx = layout.baseFontPx; fontPx >= MIN_FONT_PX; fontPx -= 0.5) {
    for (let letterSpacingEm = MAX_LETTER_SPACING_EM; letterSpacingEm >= MIN_LETTER_SPACING_EM; letterSpacingEm -= 0.015) {
      const lines = fitAtFontSize(normalized, layout, fontPx, letterSpacingEm);
      if (lines) {
        return { lines, fontSizePx: fontPx, letterSpacingEm, lineHeightRatio: LINE_HEIGHT_RATIO };
      }
    }
  }

  const sx = layout.width / VIEWBOX_W;
  const fallbackWidth = hexHalfWidthAt(layout.innerR, 0) * 2 * sx * 0.85;

  return {
    lines: expandLabelLines(normalized, fallbackWidth, MIN_FONT_PX, MIN_LETTER_SPACING_EM),
    fontSizePx: MIN_FONT_PX,
    letterSpacingEm: MIN_LETTER_SPACING_EM,
    lineHeightRatio: LINE_HEIGHT_RATIO,
  };
}
