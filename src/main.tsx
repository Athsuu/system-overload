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
    upgrades: save.upgrades,
    prestigeUnlocked: save.prestigeUnlocked,
    prestigeLevel: save.prestigeLevel,
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
