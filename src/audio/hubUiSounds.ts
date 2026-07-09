import { playArchTypingTick } from './archTypingSounds';
import { HUB_SFX_ROUTES } from './frequencyMap';
import { playHexPulse } from './hexPulse';
import { playUiBack, playUiConfirm } from './uiFeedbackSounds';
import type { HubSfxId } from './types';

export function playHubSfx(context: AudioContext, destination: AudioNode, id: HubSfxId): void {
  const route = HUB_SFX_ROUTES[id];

  switch (route.source) {
    case 'archTyping':
      playArchTypingTick(context, destination);
      break;
    case 'uiConfirm':
      playUiConfirm(context, destination);
      break;
    case 'uiBack':
      playUiBack(context, destination);
      break;
    case 'hexPulse':
      playHexPulse(context, destination, route.hexPulseVariant ?? 'normal');
      break;
  }
}
