# Prestige — résumé d'intégration (Phase 1) — HISTORIQUE

> **Document historique.** Décrit la livraison Phase 1 (juillet 2026).  
> **Ne plus utiliser** comme source de vérité pour les chiffres ou la structure cible.  
> Canon actuel des Fondamentaux : `docs/narrative.md` · `docs/lexique-jeu.md` §3 · `src/store/coreProtocolCatalog.ts`.  
> **Philosophie cible** (compétences + branches + UI) : **`.cursor/rules/prestige-philosophy.mdc`**.

Itération livrée le 13 juillet 2026. Système **Recompile** + **Seed Protocols** + **Core Protocols** selon `docs/implementation_plan.md`, avec les choix PO suivants :

- Bouton hub **séparé** (Seed Protocols)
- **Pas de tutoriel** prestige (skip auto après Recompile ; lore à ajouter plus tard)
- Condition de déclenchement : **Cycle 2 clear**
- **Accelerated Boot** remplacé par **Boot Reinforcement** (Renfort d'amorçage) : renforce Node-0 Boot
- **Profondeur de Recompilation** = compteur UI uniquement (plus de multi auto ×1.08 sur dégâts / éclats)

---

## Ce qui a changé dans le jeu

1. Après avoir **clear le Cycle 2**, le joueur peut **Recompiler** depuis le hub ou l'écran de fin de run (victoire boss Cycle 2).
2. Le Recompile **efface** Éclats hex, Fragments d'ancre, arbre de modules et cycles, puis **accorde des Fragments de Graine**.
3. L'écran **Protocoles de la Graine** (bouton hub cyan) permet d'acheter **5 Protocoles Fondamentaux** permanents — **seule** source de puissance permanente prestige.
4. Les protocoles achetés **survivent** à tous les futurs Recompiles et modifient le gameplay (dégâts boot, overload, rendement éclats, etc.).
5. Les **tutoriels ARCH ne se rejouent pas** après un Recompile.

---

## Mécaniques

| Élément | Détail |
|---------|--------|
| Condition Recompile | `cyclesCleared` contient le cycle **2** |
| Gain Fragments de Graine | formule superlinéaire sur le nombre de cycles clear (+ Résonance) |
| Reset | shards, ancres, upgrades (sauf Node-0 Boot = 1), cycles → 1 |
| Conservé | Fragments de Graine, niveaux Core Protocols, Profondeur de Recompilation (compteur), réglages |
| Buff auto profondeur | **Aucun** — puissance = Protocoles achetés seulement |

### Core Protocols (coûts SF)

| ID | EN | Effet | Max | Coûts |
|----|-----|-------|-----|-------|
| `residualMemory` | Residual Memory | +50 Éclats hex au départ après Recompile / rang | 3 | 2 / 3 / 5 |
| `bootReinforcement` | Boot Reinforcement | +5 dégâts purge (boot renforcé) | 1 | 1 |
| `thermalBaseline` | Thermal Baseline | −5 % overload passive / rang | 3 | 2 / 4 / 6 |
| `extractionProtocol` | Extraction Protocol | +10 % éclats par kill / rang | 3 | 3 / 5 / 8 |
| `seedResonance` | Seed Resonance | +1 Fragment de Graine par Recompile / rang | 2 | 4 / 7 |

---

## Fichiers touchés (liste précise)

### Store & données

| Fichier | Rôle |
|---------|------|
| `src/store/prestigeTypes.ts` | Types `CoreProtocolId`, `CoreProtocolLevels`, `PrestigeState` |
| `src/store/coreProtocolCatalog.ts` | Catalogue des 5 protocoles, coûts, constantes d'effet |
| `src/store/prestigeLogic.ts` | `canRecompile`, calcul gains SF et shards résiduels |
| `src/store/persistence.ts` | Sauvegarde `seedFragments`, `recompileDepth`, `coreProtocols` |
| `src/store/useGameStore.ts` | État Zustand, `recompile()`, `purchaseCoreProtocol()`, navigation `SEED_PROTOCOLS` |
| `src/store/playerReset.ts` | `skipTutorialsAfterRecompile()` |
| `src/main.tsx` | Hydratation save prestige au boot |

### Gameplay

| Fichier | Rôle |
|---------|------|
| `src/game/moduleEffects.ts` | Effets runtime des Core Protocols dans `computeRunConfig()` |
| `src/game/runConfig.ts` | `getRunConfig()` lit `coreProtocols` du store |

### UI

| Fichier | Rôle |
|---------|------|
| `src/ui/SeedProtocolsScreen.tsx` | Écran radial cyan des Core Protocols |
| `src/ui/RecompileConfirmModal.tsx` | Modal confirmation Recompile |
| `src/ui/HubPrestigeControls.tsx` | Boutons hub Recompile + Seed Protocols |
| `src/ui/ModuleTreeScreen.tsx` | Intègre `HubPrestigeControls` |
| `src/ui/CurrencyBadge.tsx` | Affiche Fragments de Graine |
| `src/ui/currencyIcons.tsx` | Icône `SeedFragmentIcon` |
| `src/ui/seedProtocolLayout.ts` | Positions SVG des nœuds prestige |
| `src/ui/seedProtocolTheme.ts` | Palette cyan / bleu glacé |
| `src/ui/RunEndScreen.tsx` | Bandeau « Recompile available » (victoire Cycle 2) |
| `src/App.tsx` | Écran `SEED_PROTOCOLS`, badge monnaies hub |

### i18n

| Fichier | Rôle |
|---------|------|
| `src/i18n/types.ts` | Interface `SeedProtocolsStrings`, clés currency SF |
| `src/i18n/locales/en.ts` | Textes EN prestige + protocoles |
| `src/i18n/locales/fr.ts` | Textes FR prestige + protocoles |

### Dev & docs

| Fichier | Rôle |
|---------|------|
| `src/dev/devActions.ts` | Persist save prestige dans outils dev |
| `docs/lexique-jeu.md` | Termes Recompile / Seed Protocols / Core Protocols |
| `docs/prestige-integration-summary.md` | Ce document |

### Non modifiés (volontaire)

- Tutoriel prestige (`tutorialCatalog.ts` / `prestigeReveal`) : **non branché** au nouveau flux (skip PO)
- `docs/dialogues.md` : pas de nouvelles lignes ARCH dédiées Recompile (lore futur)

---

## Comment tester

1. `npm run dev`
2. Menu dev → **Mark cycle 2 cleared** (ou jouer jusqu'au boss Cycle 2)
3. Hub : bouton **Protocoles de la Graine** + **Recompiler**
4. Confirmer Recompile → vérifier reset modules/shards/cycles + gain SF
5. Acheter un protocole → lancer une run → vérifier l'effet (ex. Renfort d'amorçage = +5 dégâts)
6. Recompiler à nouveau → protocoles et SF conservés

---

## Vérification build

- `npm run build` : OK
