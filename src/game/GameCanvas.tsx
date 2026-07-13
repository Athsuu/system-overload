import { Application, extend } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { GameArena } from './GameArena';

extend({ Container, Graphics });

export function GameCanvas() {
  return (
    <div className="absolute inset-0 z-0 cursor-none">
      <Application resizeTo={window} backgroundAlpha={0} antialias>
        <GameArena />
      </Application>
    </div>
  );
}
