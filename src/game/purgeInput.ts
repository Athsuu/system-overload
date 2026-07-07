/** Position curseur en coords arène Pixi (mise à jour par GameArena). */
export interface PurgePointerState {
  x: number;
  y: number;
  active: boolean;
}

export const purgePointerRef: PurgePointerState = {
  x: 0,
  y: 0,
  active: false,
};

export function resetPurgePointer(): void {
  purgePointerRef.x = 0;
  purgePointerRef.y = 0;
  purgePointerRef.active = false;
}
