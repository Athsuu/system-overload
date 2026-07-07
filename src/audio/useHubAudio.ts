import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  applyAudioVolumes,
  startHubAmbient,
  stopHubAmbient,
  unlockHubAudioNow,
} from './hubAudio';

export function useHubAudio(): void {
  const masterVolume = useSettingsStore((state) => state.masterVolume);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);

  useEffect(() => {
    applyAudioVolumes(masterVolume, musicVolume, sfxVolume);
  }, [masterVolume, musicVolume, sfxVolume]);

  useEffect(() => {
    startHubAmbient();

    const unlockOnGesture = () => {
      unlockHubAudioNow();
    };

    window.addEventListener('pointerdown', unlockOnGesture, { once: true });
    window.addEventListener('keydown', unlockOnGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
      stopHubAmbient();
    };
  }, []);
}

export function ensureHubAudioUnlocked(): void {
  unlockHubAudioNow();
}
