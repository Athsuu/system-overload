export {
  createOverclockState,
  getOverclockCooldownMs,
  getOverclockDurationMs,
  tryActivateOverclock,
  type OverclockState,
} from './state';
export { overclockDisplayRef, syncOverclockDisplay, type OverclockDisplayState } from './display';
export {
  consumeOverclockActivationRequest,
  overclockInputRef,
  requestOverclockActivation,
} from './input';
export { tickOverclock } from './tick';
