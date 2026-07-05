/** Tokens visuels partagés — DA "Dark Hex Terminal" (skill tree + gameplay). */

export const DARK_HEX = {
  canvasBg: '#0a0a0f',
  hexGrid: 'rgba(90, 20, 20, 0.12)',
  breach: '#ff4d00',
  breachGlow: '#ff6b2b',
  breachStroke: '#ff5533',
  edgeLocked: '#4a0000',
  lockedStroke: '#5c1515',
  gold: '#c5a059',
  goldMuted: 'rgba(197, 160, 89, 0.45)',
  vignette: 'rgba(255, 77, 0, 0.06)',
  tooltipBg: '#1a0a0a',
  tooltipBorder: 'rgba(197, 160, 89, 0.35)',
  coreFillTop: '#2a0808',
  coreFillBottom: '#120404',
  nodeFill: '#120808',
  corruptViolet: '#8b5cf6',
  corruptCyan: '#22d3ee',
} as const;

/** Couleurs Pixi (0xRRGGBB). */
export const DARK_HEX_PIXI = {
  flux: 0xe8b896,
  fluxGlow: 0xff6b2b,
  coreFill: 0x2a0808,
  coreStroke: 0xff5533,
  coreGlow: 0xff4d00,
  breach: 0xff4d00,
  breachGlow: 0xff6b2b,
  corruptViolet: 0x8b5cf6,
  corruptCyan: 0x22d3ee,
} as const;

export const BREACH_URGENT_THRESHOLD = 80;
