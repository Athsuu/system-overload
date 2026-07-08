/** Tokens visuels partagés — DA "Dark Hex Terminal" (skill tree + gameplay). */

export const DARK_HEX = {
  /** Charbon relevé — surface principale (hub, menus). */
  canvasBg: '#131018',
  /** Bords et vignettes — plus profond que canvasBg. */
  canvasBgDeep: '#0a0a0f',
  hexGrid: 'rgba(120, 42, 32, 0.2)',
  hexGridHub: 'rgba(197, 160, 89, 0.1)',
  breach: '#ff4d00',
  breachGlow: '#ff6b2b',
  breachStroke: '#ff5533',
  /** Purge zone — exécution Node-0 (blanc/cyan), distinct de la menace Breach. */
  purge: '#e8f4f8',
  purgeGlow: '#22d3ee',
  edgeLocked: '#4a0000',
  lockedStroke: '#5c1515',
  gold: '#c5a059',
  goldMuted: 'rgba(197, 160, 89, 0.45)',
  vignette: 'rgba(255, 77, 0, 0.1)',
  hubCenterGlow: 'rgba(197, 160, 89, 0.07)',
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
  fluxGlow: 0xc5a059,
  purge: 0xe8f4f8,
  purgeGlow: 0x22d3ee,
  coreFill: 0x2a0808,
  coreStroke: 0xff5533,
  coreGlow: 0xff4d00,
  breach: 0xff4d00,
  breachGlow: 0xff6b2b,
  corruptViolet: 0x8b5cf6,
  corruptCyan: 0x22d3ee,
} as const;

export const BREACH_URGENT_THRESHOLD = 80;
