import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore } from '../store/useGameStore';
import { applyAudioVolumes, ensureAudioUnlocked, startHubAmbient, stopHubAmbient } from './sfxApi';

function shouldPlayHubAmbient(gameState: string): boolean {
  return gameState === 'MAIN_MENU' || gameState === 'MENU' || gameState === 'UPGRADING';
}

export function useHubAudio(): void {
  const gameState = useGameStore((state) => state.gameState);
  const masterVolume = useSettingsStore((state) => state.masterVolume);
  const musicVolume = useSettingsStore((state) => state.musicVolume);
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);

  useEffect(() => {
    applyAudioVolumes(masterVolume, musicVolume, sfxVolume);
  }, [masterVolume, musicVolume, sfxVolume]);

  useEffect(() => {
    if (shouldPlayHubAmbient(gameState)) {
      startHubAmbient();
      return;
    }
    stopHubAmbient();
  }, [gameState]);

  useEffect(() => {
    const unlockOnGesture = () => {
      ensureAudioUnlocked();
    };

    window.addEventListener('pointerdown', unlockOnGesture, { once: true });
    window.addEventListener('keydown', unlockOnGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
    };
  }, []);
}
