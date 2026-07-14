import type { Application } from 'pixi.js';

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

/**
 * Dernière position écran (viewport) connue du curseur, mise à jour en continu quel que soit
 * l'état de jeu. Sert à réactiver immédiatement la zone de purge au démarrage d'une run sans
 * attendre un nouveau `pointermove`.
 */
export const lastClientPointer = { x: 0, y: 0, hasMoved: false };

export function resetPurgePointer(): void {
  purgePointerRef.x = 0;
  purgePointerRef.y = 0;
  purgePointerRef.active = false;
}

export function trackClientPointer(clientX: number, clientY: number): void {
  lastClientPointer.x = clientX;
  lastClientPointer.y = clientY;
  lastClientPointer.hasMoved = true;
}

export function clientToPurgeCanvas(
  app: Application,
  clientX: number,
  clientY: number,
): { x: number; y: number } | null {
  const canvas = app.canvas;
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const scaleX = app.screen.width / rect.width;
  const scaleY = app.screen.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

export function activatePurgePointer(app: Application, clientX: number, clientY: number): boolean {
  const pos = clientToPurgeCanvas(app, clientX, clientY);
  if (!pos) return false;

  purgePointerRef.x = pos.x;
  purgePointerRef.y = pos.y;
  purgePointerRef.active = true;
  return true;
}

/** Réactive la zone de purge : dernière position connue, sinon centre du canvas. */
export function seedPurgePointer(app: Application): boolean {
  if (lastClientPointer.hasMoved) {
    if (activatePurgePointer(app, lastClientPointer.x, lastClientPointer.y)) {
      return true;
    }
  }

  const rect = app.canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  return activatePurgePointer(
    app,
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
  );
}
