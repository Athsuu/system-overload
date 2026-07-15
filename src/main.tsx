import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { loadSave } from './store/persistence';
import { useGameStore } from './store/useGameStore';
import './index.css';

const save = loadSave();
if (save) {
  useGameStore.setState({
    bankShards: save.bankShards,
    bankAnchorFragments: save.bankAnchorFragments,
    upgrades: save.upgrades,
    seedFragments: save.seedFragments,
    recompileDepth: save.recompileDepth,
    coreProtocols: save.coreProtocols,
    prestigeUnlocked: save.prestigeUnlocked,
    prestigeLevel: save.prestigeLevel,
    highestCycleUnlocked: save.highestCycleUnlocked,
    selectedCycle: save.selectedCycle,
    cyclesCleared: save.cyclesCleared,
    cyclesSinceLastAnchor: save.cyclesSinceLastAnchor,
    anchoredNodes: save.anchoredNodes,
    bestWaveByCycle: save.bestWaveByCycle,
    activeCycle: save.selectedCycle,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
