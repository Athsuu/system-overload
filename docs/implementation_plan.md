# Phase 1 : Système de Prestige — Plan d'Implémentation

## Résumé

Le Prestige est une couche de méta-progression profonde : le joueur **sacrifie volontairement** tout son arbre de modules, ses Hex Shards, ses Anchor Fragments et ses cycles débloqués en échange d'une **monnaie permanente** qui achète des **modules spéciaux** survivant à tous les resets futurs.

---

## Lore : La Recompilation depuis la Graine

> [!NOTE]
> **Concept narratif** : L'Archive Zéro est en phase terminale. ARCH constate que les patchs incrémentaux (le Module Tree normal) ne suffisent plus. La seule option restante : **recompiler Node-0 depuis la Graine elle-même** — le code source originel pur. Ce processus détruit le thread actuel (hard reset) mais permet d'intégrer des optimisations fondamentales impossibles à atteindre par simple amélioration.

**Termes canoniques proposés :**

| Concept | Terme UI (EN) | Terme FR | Justification Lore |
|---------|---------------|----------|---------------------|
| Acte de prestige | **Recompile** | Recompilation | Node-0 est recompilé depuis la Graine, pas "réparé" |
| Monnaie prestige | **Seed Fragments** | Fragments de Graine | Données extraites du code source pur lors de la recompilation |
| Modules prestige | **Core Protocols** | Protocoles Fondamentaux | Optimisations gravées dans le code source même de Node-0 |
| Écran prestige | **Seed Protocols** | Protocoles de la Graine | Interface d'accès aux modules permanents |
| Compteur prestige | **Recompile Depth** | Profondeur de Recompilation | Nombre de fois que Node-0 a été recompilé |

**Dialogue ARCH (proposition) :**
- *Déclenchement (Cycle 3 clear)* : `"Node-0. I've been modelling this for a while. Incremental patches aren't enough anymore. I can recompile you from the Seed itself. You lose everything. But what you gain... is written into your source code. Permanent. Think about it."`
- *Confirmation Recompile* : `"Initiating Seed Recompilation. Stand by. This will hurt."`
- *Post-Recompile (retour hub)* : `"Recompile complete. Depth {n}. You feel different because you ARE different. The old modules are gone, but what the Seed gave you... that stays."`

---

## Mécanique : Hard Reset & Économie

### Ce qui est PERDU (reset)
- Hex Shards (coffre vidé)
- Anchor Fragments
- Tous les niveaux du Module Tree (remis à `DEFAULT_UPGRADES`)
- Cycles débloqués (retour Cycle 1)
- Progression tutoriel (optionnel, à confirmer)

### Ce qui est CONSERVÉ (permanent)
- **Seed Fragments** (nouvelle monnaie permanente, jamais perdue)
- **Core Protocols** achetés (modules prestige)
- **Recompile Depth** (compteur de prestiges)
- Réglages joueur (volume, langue)

### Gains de Seed Fragments
Le joueur gagne des Seed Fragments **au moment du Recompile**, pas pendant les runs.

Formule proposée : `seedFragments = baseSeedReward + bonusPerCycleCleared`
- **Base** : 1 Seed Fragment par Recompile
- **Bonus** : +1 par cycle clear au moment du Recompile (Cycle 3 clear = 3+1 = 4 fragments)
- À terme, le Recompile Depth pourrait donner un petit bonus multiplicateur

---

## Core Protocols — Modules Prestige

### Esthétique & Accès

> [!IMPORTANT]
> **Différenciation visuelle cruciale** : Les Core Protocols doivent être visuellement distincts du Module Tree normal pour que le joueur comprenne immédiatement qu'il s'agit d'une couche différente.

| Aspect | Module Tree (normal) | Core Protocols (prestige) |
|--------|---------------------|--------------------------|
| Couleur dominante | Or / Rouge / Orange (branches) | **Cyan / Bleu glacé** (couleur de la Graine) |
| Forme des nœuds | Hexagones | Hexagones avec **contour double** ou **halo pulsé** |
| Fond | Grille hex standard | Grille hex avec **effet de profondeur** (parallaxe subtile) |
| Accès | Hub principal | **Onglet/bouton dédié** sur le hub (à côté du Module Tree), ou sous-section intégrée au Module Tree |

**Proposition d'accès UI** : Un bouton "Seed Protocols" dans le Hub (visible uniquement après le premier Recompile), qui ouvre un écran dédié avec le même pattern SVG radial mais en palette cyan/bleu.

### Idées de Core Protocols (5 modules de lancement)

| Module | Effet | Max | Coût (Seed Fragments) |
|--------|-------|-----|----------------------|
| **Residual Memory** | Les Hex Shards de départ après un Recompile = +50 par rang | 3 | 2 / 3 / 5 |
| **Accelerated Boot** | Node-0 Boot est automatiquement acheté au rang 1 dès le début | 1 | 1 |
| **Thermal Baseline** | Réduit la montée passive d'Overload de base de 5% par rang | 3 | 2 / 4 / 6 |
| **Extraction Protocol** | +10% de Hex Shards gagnés par kill (multiplicateur global) | 3 | 3 / 5 / 8 |
| **Seed Resonance** | +1 Seed Fragment gagné par Recompile futur | 2 | 4 / 7 |

> [!WARNING]
> **Équilibrage** : Ces modules doivent rendre le début de chaque nouveau cycle de prestige **un peu plus facile** sans rendre le jeu trivial. Le joueur doit toujours sentir la difficulté des premiers runs post-reset.

---

## Open Questions

> [!IMPORTANT]
> 1. **Accès UI** : Préfères-tu un onglet/bouton séparé sur le Hub ("Seed Protocols") ou une intégration directe dans le Module Tree existant (ex: un anneau extérieur cyan autour de l'arbre actuel) ?
> 2. **Reset du tutoriel** : Après un Recompile, faut-il rejouer le tutoriel ARCH ou le joueur le skip automatiquement ?
> 3. **Condition de déclenchement** : Tu confirmes bien Cycle 3 clear comme condition ? (actuellement `MAX_CYCLES = 3`, donc c'est le dernier cycle jouable)
> 4. **Core Protocols proposés** : Les 5 modules ci-dessus te conviennent comme point de départ, ou tu as d'autres idées ?

---

## Proposed Changes

### Store & Données

#### [MODIFY] [prestigeTypes.ts](file:///d:/Devloppement/src/store/prestigeTypes.ts)
- Remplacer le placeholder par le vrai `PrestigeState` avec `seedFragments`, `recompileDepth`, `coreProtocols` (niveaux des modules prestige)
- Définir `CoreProtocolId`, `CoreProtocolLevels`, `DEFAULT_CORE_PROTOCOLS`

#### [MODIFY] [persistence.ts](file:///d:/Devloppement/src/store/persistence.ts)
- Étendre `SaveData` avec les champs prestige permanents (`seedFragments`, `recompileDepth`, `coreProtocols`)
- Ces champs ne sont **jamais** effacés par le Recompile

#### [MODIFY] [useGameStore.ts](file:///d:/Devloppement/src/store/useGameStore.ts)
- Ajouter les champs prestige au store Zustand
- Implémenter `recompile()` : hard reset + gain de Seed Fragments
- Implémenter `purchaseCoreProtocol(id)`

#### [MODIFY] [playerReset.ts](file:///d:/Devloppement/src/store/playerReset.ts)
- Créer une fonction `performRecompile()` qui reset la progression mais conserve les données prestige

---

### Gameplay & Effets

#### [NEW] `src/store/coreProtocolCatalog.ts`
- Définitions des Core Protocols (id, nom, coûts, niveaux max)
- Pipeline similaire à `upgradeCatalog.ts` mais pour la couche prestige

#### [MODIFY] [moduleEffects.ts](file:///d:/Devloppement/src/game/moduleEffects.ts)
- Intégrer les effets des Core Protocols dans `computeRunConfig()` (ex: Thermal Baseline réduit `basePassiveHeatPerSec`)

---

### UI

#### [NEW] `src/ui/SeedProtocolsScreen.tsx`
- Écran dédié aux Core Protocols (accès depuis le Hub)
- Layout SVG radial en palette cyan/bleu

#### [NEW] `src/ui/RecompileConfirmModal.tsx`
- Modal de confirmation du Recompile avec récapitulatif de ce qui est perdu/gagné

#### [MODIFY] [ModuleTreeScreen.tsx](file:///d:/Devloppement/src/ui/ModuleTreeScreen.tsx)
- Ajouter le bouton "Seed Protocols" (visible post-premier Recompile ou post-Cycle 3)

#### [MODIFY] [CurrencyBadge.tsx](file:///d:/Devloppement/src/ui/CurrencyBadge.tsx)
- Afficher les Seed Fragments dans le Hub (à côté des Hex Shards)

#### [MODIFY] [RunEndScreen.tsx](file:///d:/Devloppement/src/ui/RunEndScreen.tsx)
- Afficher un indicateur "Recompile Available" après Cycle 3 clear

---

### Localisation & Documentation

#### [MODIFY] en.ts / fr.ts / types.ts
- Textes pour tous les termes prestige, Core Protocols, dialogues ARCH

#### [MODIFY] [narrative.md](file:///d:/Devloppement/docs/narrative.md) / [lexique-jeu.md](file:///d:/Devloppement/docs/lexique-jeu.md)
- Ajouter la section Prestige / Recompile

---

## Verification Plan

### Automated Tests
- `npm run lint` et `npm run build` doivent passer sans erreur

### Manual Verification
- Lancer le jeu, atteindre le Cycle 3, vérifier que le bouton Recompile apparaît
- Effectuer un Recompile, vérifier que les shards/upgrades sont reset et les Seed Fragments sont gagnés
- Acheter un Core Protocol, vérifier que son effet persiste après un nouveau Recompile
- Vérifier la sauvegarde/chargement des données prestige
