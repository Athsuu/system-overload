export type HubSfxId =
  | 'nodeSelect'
  | 'nodeLocked'
  | 'purchase'
  | 'startRun'
  | 'settingsOpen'
  | 'settingsClose'
  | 'uiConfirm'
  | 'uiBack'
  | 'archTyping';

export type GameSfxId = 'purgeHit' | 'purgeKill';

export type RunEventSfxId =
  | 'waveClear'
  | 'waveResume'
  | 'bossIncoming'
  | 'breachWarning'
  | 'meltdown'
  | 'victory';

/** Audio bus categories — each has its own gain + EQ in AudioManager. */
export type SfxBusCategory = 'music' | 'ui' | 'combat' | 'runEvent';

export type SfxId = HubSfxId | GameSfxId | RunEventSfxId;
