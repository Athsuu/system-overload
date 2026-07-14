# Lexique Zero Archive: pour communiquer avec l’agent

Document de référence pour le **créateur / product owner** : comment nommer une zone, une mécanique ou un écran quand tu veux modifier, améliorer ou supprimer quelque chose, **sans connaître le code**.

> **Textes visibles dans le jeu (UI)** : anglais + français (i18n).  
> **Ce lexique** : en français pour toi ; la colonne « Terme UI (EN) » = ce que le joueur voit en anglais.

**Dernière mise à jour** : lore v0.7, ARCH, Node-0, Archive Zéro, la Graine, Uplink ; arène purge-only (pas de sprite joueur).

---

## Comment utiliser ce lexique

Quand tu demandes une modification, essaie d’utiliser le **mot du lexique** + **l’action** + **le ressenti** si besoin.

**Formule simple :**

> « Sur **[zone]**, je veux **[action]** sur **[élément]**, parce que **[ressenti / intention]**. »

**Exemples :**

| Tu veux dire… | Phrase type pour l’agent |
|---------------|-------------------------|
| Boutons menu trop petits | « Sur le **menu titre**, agrandir les **boutons hex** (New Game, Continue…). » |
| Tuto gênant | « Désactiver ou raccourcir le **tutoriel ARCH** étape **Contenir la Brèche** (spotlight sur Start Run). » |
| Jauge qui monte trop vite | « Réduire la montée de **Overload** / **Breach** passive en run. » |
| Pas assez d’éclats | « Augmenter les **Hex Shards** gagnés par kill » ou « buff **Purge Strike** / **Thread Coolant** sur l'arbre. » |

---

## 1. Écrans et navigation (où tu es dans le jeu)

| Mot à utiliser | Terme UI (EN) | C’est quoi ? | Mot technique (agent) |
|--------------|---------------|--------------|---------------------|
| **Menu titre** / **menu principal** | New Game, Continue, Settings, Quit | Premier écran au lancement, avant le hub | `MAIN_MENU` · `MainMenuScreen` |
| **Hub** / **écran entre les runs** | Zero Archive + module tree | Grille d’upgrades, bouton Start Run, Hex Shards (coffre) | `MENU` |
| **Écran upgrades** (post-run) | Module Enhancements | Même hub mais après une run, titre « améliorations » | `UPGRADING` |
| **Run** / **partie** / **arène** |, | Combat en direct, zone de purge (souris), ennemis, jauge | `PLAYING` |
| **Pause** | SYSTEM HALT | Jeu figé, stats run, Reprendre / Abandonner | `PAUSED` |
| **Fin de run** | Breach Contained / Meltdown | Victoire ou défaite, éclats gagnés | `RUN_END` |
| **Réglages** | System Config / Settings | Volume, langue, retour menu | `SettingsPanel` · `SettingsOverlay` |
| **Menu dev** | DEV | Outils debug (développement seulement) | `DevMenu` |

**Flux habituel :** Menu titre → Hub → Start Run → Arène → Fin de run → Hub (ou module tree upgrades).

---

## 2. Lore et identité (fantasy du jeu)

| Mot à utiliser | Terme UI (EN) | Explication simple |
|--------------|---------------|-------------------|
| **Node-0** | Node-0 | Processus enfant compilé en quarantaine: tu joues via la **zone de purge**, pas un avatar visible |
| **ARCH** | ARCH | Voix conseil / tutoriel, modèle heuristique continu sur chaque run ; ton urgent, parental, attaché (Archive Recovery & Containment Heuristic) |
| **Breach** / **Brèche** / **Surcharge** | Overload (jauge) · Breach (lore) | Pression du système ; si ça explose → défaite |
| **Meltdown** / **Fusion du noyau** | Meltdown | Défaite à 100 % surcharge |
| **Surcharge passive (base run)** | passive heat | **1,5 / s** sans module thermique (`RUN_STAT_BASE.basePassiveHeatPerSec`) ; cap Meltdown 100 → ~67 s sans kill ni relief |
| **Breach Contained** / **Brèche contenue** | Breach Contained | Victoire (boss vaincu) |
| **Processus corrompus** | Corrupted processes | Ennemis |
| **Dissipation Nodes** | (nom technique ennemis) | Hex ennemis dans l’arène, OK de garder ce nom en interne |
| **Quarantaine** | quarantine | Lore : bulle isolée où tourne Node-0 |
| **Archive Zéro** / **Zero Archive** | Zero Archive | Nom du hub / module tree |
| **La Graine** / **the Seed** | the Seed | Objectif long terme (Uplink) |
| **Heuristique ARCH** |, (implicite) | ARCH ne réagit **pas qu'à l'échec** : modèle heuristique **en continu** sur chaque run (victoire ou défaite). **Meltdown** = signal le plus critique → renforcement ciblé immédiat. Chaque run nourrit aussi des optimisations **plus lentes** (thermique, extraction, modélisation de la menace). **Module tree** = corrections d'urgence + optimisation continue. **Même Node-0**, jamais remplacé. |
| **Ton narratif** |, | Urgent, terminal, lien au personnage, pas heroic fantasy, **pas froid** |

**À ne plus utiliser :** Heart / Cœur, WASD, sprite joueur en arène, gardien externe, « redirection de flux », ton **froid** ou distant pour ARCH.

---

## 3. Économie et progression

| Mot à utiliser | Terme UI (EN) | C’est quoi ? |
|--------------|---------------|--------------|
| **Éclats hex** / **Hex Shards** | Hex Shards | Monnaie unique : **drop au sol** quand un ennemi meurt, **ramassée** en passant la zone de purge à proximité ; créditée au coffre à la collecte ; dépensée sur le module tree |
| **Fragments d’ancre** / **Puces matérielles** | Anchor Fragments | 2e monnaie permanente, **+1 tous les 3 Cycles réussis** (`cyclesSinceLastAnchor`) ; sert à **Surcharger** un module (Hardware Supercharge, voir §3bis) — n'achète plus de module directement |
| **Cycle** / **Cycles** | Cycle | Couche de progression hub : 10 vagues + boss par cycle ; scaling plus dur ; Cycle 2+ débloqué après 1er clear du cycle précédent |
| **Coffre** / **vault** | vault | Où vont les Hex Shards après une run |
| **Module tree** / **arbre de modules** | Module tree | Arbre hex **radial** : somme des deux boucles ARCH (urgence Meltdown + optimisation continue) ; un seul nœud visible au départ, branches qui se révèlent |
| **Node-0 Boot** / **amorçage Node-0** | Node-0 Boot | **Nœud racine** — baseline **gratuit** (niveau 1 dès le départ, non achetable), seul module visible au tout début |
| **Révélation** (arbre) |, | Dès qu’un parent est acheté **1 fois**, ses enfants **apparaissent** (visible ≠ achetable) |
| **Placeholder** / **module réservé** | Module pending (placeholder_XX) | Case grise « RESERVED », visible mais **non achetable** (contenu futur) |
| **Nœud** / **module** | (nom de l’upgrade) | Une case sur l’arbre, achetée en **Éclats hex** (tous les modules, y compris Overclock et Flux Drive) — les Anchor Fragments servent uniquement au Hardware Supercharge (§3bis) |
| **Prestige** / **Recompile** | Recompile | Hard reset volontaire après **Cycle 3 clear** : perd modules, éclats, ancres, cycles ; garde **Fragments de Graine**, **Protocoles Fondamentaux**, **Profondeur de Recompilation** |
| **Fragments de Graine** | Seed Fragments | Monnaie permanente prestige, gagnée à chaque Recompile |
| **Protocoles de la Graine** | Seed Protocols | Écran hub dédié (cyan) pour acheter les **Protocoles Fondamentaux** |
| **Protocoles Fondamentaux** | Core Protocols | 5 modules permanents (Mémoire résiduelle, Renfort d'amorçage, Ligne thermique, Protocole d'extraction, Résonance de Graine) — **déplafonnés**, coût croissant exponentiel (`base × growth^rang`), jamais "MAX" |
| **Profondeur de Recompilation** | Recompile Depth | Compteur de Recompiles effectuées — donne aussi un multiplicateur permanent ×1.08/Recompile sur les dégâts de purge et le rendement d'éclats, ressenti dès la run suivante (rééquilibrage) |
| **Sauvegarde** / **Continue** | Continue | Progression stockée (éclats, upgrades), pas une run en cours |
| **Nouvelle partie** | New Game | Repartir à zéro (avec confirmation si vraie progression) |

---

## 3bis. Hardware Supercharge (Ancrage)

Risk/Reward permanent sur les modules déjà achetés (Éclats hex) — voir `src/game/anchorSupercharge.ts`, `src/store/upgradeCatalog.ts` (`isAnchorSuperchargeEligible`), `src/store/useGameStore.ts` (`purchaseAnchorSupercharge` / `toggleAnchorSupercharge`).

| Mot à utiliser | Terme UI (EN) | C’est quoi ? |
|--------------|---------------|--------------|
| **Surcharge Matérielle** / **Hardware Supercharge** | Hardware Supercharge | Mécanique Risk/Reward : dépenser 1 Anchor Fragment pour **ancrer** un module possédé (niveau ≥ 1, acheté en Éclats hex) |
| **Socket** / **connecteur** | Socket | Petit trapèze inversé sous le hexagone du module (`ModuleTreeNode.tsx`) — invisible si non ancré, gris éteint si ancré OFF, ambré si ancré ON ; cliquable indépendamment (bascule instantanée sans ouvrir le panneau) |
| **Ancré** / **anchored** |, | État persistant (`anchoredNodes[id]`) : `undefined` = jamais surchargé, `false` = surchargé mais OFF, `true` = ON |

**Bonus** (module ON) : rendement de base du module ×2 (générique) — sauf Overclock (durée active ×2, 4s → 8s) et Flux Drive (vitesse ×3 au lieu de ×2, pas de ×4 cumulé) pour rester équilibré.
**Malus** (global, tant qu'au moins un module est ON) : +25 % additif à la génération de Surcharge (Heat) passive, **par module ancré actif** — cumulatif si plusieurs modules sont surchargés en même temps.

---

## 4. Branches du module tree

Arbre radial v4 — **13 modules** actifs :

| Mot à utiliser (FR) | Branche (agent) | Thème |
|---------------------|-----------------|--------|
| **Dégâts** | `degats` | **Purge Strike**, **Briseur d'élite**, **Purge Cadence**, **Purge Reach**, **Éclat de purge**, **Overclock** |
| **Thermique** | `thermique` | **Node-0 Boot**, **Récupération d'éclats**, **Rendement d'extraction**, **Aimant d'éclats**, **Thread Coolant**, **Kill Vent**, **Meltdown Threshold**, **Flux Drive** |
| **Flux** (icône hub) | `flux` | Icône **Node-0 Boot** et **Flux Drive** |

| Module (FR) | Terme UI (EN) | Position hex | Parent | Effet |
|-------------|---------------|--------------|--------|-------|
| **Récupération d'éclats** | Shard Salvage | (−1, 0) | Node-0 Boot | ×1.18^rang composé sur le rendement d'éclats (illimité) |
| **Rendement d'extraction** | Extraction Yield | (−2, 0) | Récupération d'éclats | +20 % / rang sur le rendement de base (5 rangs max) |
| **Aimant d'éclats** | Shard Magnet | (−2, +1) | Récupération d'éclats | Collecte serrée au départ (20 px), aspiration dès le rang 1 ; monte jusqu'à 92 px / 200 px (rangs 0–3) |
| **Briseur d'élite** | Elite Breaker | (0, +2) | Purge Strike | Frappe plus fort les processus lourds (élite / boss) |
| **Éclat de purge** | Purge Splash | (+1, +2) | Portée de purge | Dégâts d'éclaboussure autour du point de purge (hors zone directe) |
| **Injection de latence** | Latency Injection | (−1, +3) | Cadence de purge | Ralentit les processus corrompus se trouvant dans la zone de purge active (−10 % / rang, max 3 rangs) |
| **Overclock** | Overclock | (+1, 0) | Node-0 Boot | Débloque le bouton Overclock (Espace / HUD) — **coûte 200 Éclats hex** ; Supercharge = durée active ×2 |
| **Flux Drive** | Flux Drive | (−1, +1) | Node-0 Boot | Débloque le toggle Flux Drive (×2 vitesse de simulation) — **coûte 280 Éclats hex** ; achetable dès l’hub (prérequis Node-0 Boot actif) ; Supercharge = vitesse ×3 au lieu de ×2 |

**Retiré (ancien arbre)** : `attackSpeed`, `purgeAoe`, `shards`, `enemies`.

---

## 5. Gameplay en run (mécaniques)

| Mot à utiliser | Terme UI (EN) | C’est quoi ? | Fichiers / zone (agent) |
|--------------|---------------|--------------|-------------------------|
| **Zone de purge** | Purge zone | Zone sous la souris qui détruit les ennemis | `purgeZone` · `PurgeZoneEngine` |
| **Shockwave Purge Splash** | Splash shockwave | Anneau cyan qui s’étend du bord purge au rayon max ; visible à **chaque purge hit** si Purge Splash est installé | `effects.ts` · `purgeZone.ts` · `EffectEngine.tsx` |
| **Purge** | Purge | Attaque principale (pas des « projectiles » classiques) | `enemyCombat` · HUD |
| **Overload** (jauge HUD) | Overload | Jauge en bas = Breach en % pendant la run | `HUD` · `breachProgress` |
| **Overclock** | Overclock | Module actif (Espace / bouton hex HUD), boost temporaire | `overclock` · `OverclockButton` |
| **Flux Drive** | Flux Drive | Toggle ×2 vitesse (si débloqué) | `fluxDrive` · HUD |
| **Vagues** | Wave | Vagues d’ennemis | `WaveEngine` · `waveConfig` |
| **Boss** / **Ancre de brèche** | Breach Anchor | Boss de fin | `wavePhase: boss` |
| **Grille hex arène** |, | Fond hex pendant le combat | `ArenaHexOverlay` |
| **Drop d’éclats** / **loot** | Loot pickup | Entité au sol après un kill (ou autre source) ; type `LootKind` (aujourd’hui `hexShard`) ; collecte par proximité zone de purge | `src/game/loot/` |

---

## 5b. Transitions d’écran (Terminal Boot)

| Moment | ID technique | Déclencheur | Ressenti joueur |
|--------|--------------|-------------|-----------------|
| **Hub → Arène** | `hubToArena` | Start Run (hub ou fin de run) | Plein écran terminal : canal ARCH, lignes `>` à gauche, curseur, barre de progression |
| **Arène → Hub** | `arenaToHub` | Module Tree (fin de run) ou abandon pause | Même feed terminal ; accent or (victoire), breach (meltdown) ou or atténué (abandon) |

Fichiers : `src/ui/transitions/` · `src/store/useTransitionStore.ts` · i18n `transitions.*`

---

## 6. Interface en run (HUD)

| Élément | Où c’est | Ancre tutoriel (`data-tutorial-anchor`) |
|---------|----------|----------------------------------------|
| Jauge **Overload** | Bas écran | `overload-bar` |
| **Hex Shards** | Badge haut-droite (hub + run), total unique `bankShards`, monte à chaque **collecte** d’éclat en run | `hex-shards` |
| Bouton **Overclock** | Bas droite | `overclock` |
| **Flux Drive** | HUD | `flux-drive` |
| Indicateur vague / boss + **timer run** (`MM:SS`) | Haut centre | — |

### Fiche stats Node-0 (hub)

Bouton stats coin hub · `PlayerStatsPanel` · `getPlayerStatSheet()`.

| Toujours visible (base Node-0) | Révélé si module acheté (≥ 1 rang) |
|--------------------------------|-------------------------------------|
| Dégâts purge, cadence, zone principale, Surcharge passive / s, seuil Meltdown | Éclat de purge (zone + dégâts), Rendement d'extraction, Évacuation de kill |

Les tooltips module tree gardent les bonus par rang ; la fiche affiche les **totaux finaux**.

---

## 7. Tutoriels ARCH

| Mot à utiliser | C’est quoi ? |
|--------------|--------------|
| **Tutoriel ARCH** / **coach** | Cartes de texte + parfois spotlight |
| **Spotlight** | Zone éclairée (lift chaud léger) + reste assombri, run en pause si en jeu |
| **Fond terminal** | Grille hex + scanlines + vignette breach, menu titre, hub et arène (hub un peu plus vivant) |
| **Glitch hub** | Titre/tagline ARCH, overlay sur l’arbre, halo Node-0, nœud sélectionné |
| **Police Rajdhani** | Titres + UI (latin FR/EN), remplace Georgia / mono système |
| **Featured** | Carte centrée sans ancrage HUD (intro menu) |
| **Skip** | Bouton pour passer le tutoriel |
| **Got it** / **Compris** | Dernier bouton du groupe (remplace ›), ferme tout le groupe |
| **Groupe menu intro** | `menu_intro`, bienvenue + rôle Node-0 + mission |
| **Groupe premier run** | `run_intro`, purge, overload, éclats, etc. |

**Étapes courantes (nom à utiliser) :**

| Nom simple (FR) | ID technique |
|-----------------|--------------|
| Bienvenue ARCH | `welcome` |
| Rôle de Node-0 | `node0_role` |
| Contenir la Brèche / boucle mission | `mission_loop` |
| Intro module tree | `module_tree_intro` |
| Zone de purge | `purge_zone` |
| Enjeu surcharge | `overload` |
| Éclats hex (run + vault) | `run_shards` |
| Overclock | `overclock` |
| Arbre (achat) | `module_tree` |
| Prestige | `prestige` |
| Flux Drive | `flux_drive` |

**Messages ambiants ARCH** (hors tutoriel structuré) : `ArchAmbient`, ex. boss incoming, surcharge critique.

---

## 8. Apparence et ressenti visuel (DA)

| Mot à utiliser | C’est quoi ? |
|--------------|--------------|
| **Dark Hex Terminal** | Style global : sombre, hex, or, breach orange |
| **Scanlines** | Lignes CRT légères à l’écran |
| **Glitch** | Texte qui « casse » brièvement (titre, ARCH) |
| **Vignette breach** | Lueur orange dans les coins |
| **Boutons hex** | Boutons en forme d’hexagone (menu, pause, etc.) |
| **Glow or** | Contour / halo doré `#c5a059` |
| **Glow breach** | Orange surcharge `#ff4d00` |

Référence effets : `docs/visual-effects-references.md`

---

## 9. Audio

| Mot à utiliser | C’est quoi ? |
|--------------|--------------|
| **Ambient hub** | Musique / fond menu et hub |
| **SFX** | Effets (clics, upgrades, etc.) |
| **Volume principal / musique / effets** | Réglages audio |

---

## 10. Zones du projet (pour orienter l’agent)

Tu peux dire « touche **l’arène** » ou « touche **le hub** », l’agent saura :

| Tu dis… | Dossier |
|---------|---------|
| Arène, combat, ennemis, 60 FPS | `src/game/` |
| Menus, HUD, module tree, écrans | `src/ui/` |
| Éclats, saves, upgrades, états jeu | `src/store/` |
| Couleurs, thème | `src/theme/` |
| Textes FR/EN | `src/i18n/locales/` |
| Tutoriels ARCH | `src/tutorial/` + `TutorialCoach` |
| Sauvegarde fichier | `persistence.ts` · clé `system-overload-save` |
| Réglages joueur | `settingsPersistence.ts` |

---

## 11. Actions courantes (vocabulaire)

| Tu veux… | Dis plutôt… | Évite… |
|----------|-------------|--------|
| Supprimer une feature | « Retirer / désactiver **[X]** » | « Enlever le truc là » |
| Rendre plus visible | « Plus lisible / plus gros / plus de contraste sur **[X]** » | « Fais mieux » |
| Ralentir / accélérer | « Réduire / augmenter **[valeur]** de **[mécanique]** » | « C’est trop rapide » seul |
| Changer un texte | « Texte UI de **[écran]** : **[nouvelle phrase]** » (+ préciser FR si besoin) | Modifier seulement en français dans le jeu |
| Déplacer un élément | « Déplacer **[élément]** vers **[haut/bas/gauche/droite]** » ou « de X cm » | « Mets-le ailleurs » |
| Bug | « Quand je **[action]**, il se passe **[attendu vs réel]** » | « Ça marche pas » |

---

## 13. Sons de purge — vocabulaire audio (Pack Warm Descent)

Pour ajuster **PurgeHit** (tick de dégâts) et **PurgeKill** (ennemi détruit) sans jargon technique.  
**Famille actuelle :** Warm Descent — chaleur terminal, contour **descendant** (contrairement au wave clear qui monte).

### Les deux sons

| Mot à utiliser | C’est quoi en jeu ? | Quand tu l’entends |
|--------------|---------------------|-------------------|
| **PurgeHit** / **hit de purge** | Impact quand la zone de purge touche un ennemi (sans le tuer) | Très souvent, en boucle pendant que tu purges |
| **PurgeKill** / **kill de purge** | Même base que le hit + couche supplémentaire | Quand un processus corrompu est détruit |

### Couches du son (comment décrire un changement)

| Mot à utiliser | Rôle | PurgeHit | PurgeKill |
|--------------|------|----------|-----------|
| **Descente** / **couche descente** | Pop chaud qui **tombe** en hauteur (signature Warm Descent) | Oui (seule couche) | Oui (base commune) |
| **Bloom** / **couche bloom** | 2e note un peu plus haute qui s’étire — sensation de « réussi » | Non | Oui (en plus de la descente) |

### Paramètres que tu peux demander à modifier

| Mot à utiliser | Effet si tu dis… | Exemples de phrases |
|--------------|------------------|---------------------|
| **Grave / aigu** | Plus **bas** ou plus **haut** dans le timbre | « Descente plus **grave** » · « Bloom un peu plus **aigu** » |
| **Sec / long** | Plus **court** (sec) ou plus **étiré** | « Hit plus **sec** » · « Kill un peu plus **long** » |
| **Fort / discret** | Volume perçu plus haut ou plus bas | « PurgeHit plus **discret** » · « Bloom kill un peu plus **fort** » |
| **Chaud / froid** | Plus rond (sine doux) vs plus dur / métallique | « Plus **chaud**, comme les events run » |
| **Variation** | Légères différences aléatoires d’une purge à l’autre | « Moins de **variation** entre les hits » |
| **Filtre** | Son plus **boueux** (filtre fermé) ou plus **brillant** (ouvert) | « Descente plus **boueuse** » · « Plus **brillant** mais pas agressif » |

### Contraste avec les autres sons (pour ne pas confondre)

| Son | Gestuelle | Ne pas confondre avec… |
|-----|-----------|------------------------|
| **PurgeHit / PurgeKill** | Chute chaude **courte** | Wave clear (montée longue) |
| **Hex Pulse** (clics UI) | Double pulse sec, tierce mineure | Purge (descente simple) |
| **ARCH typing** | Tic d’écriture très léger | Purge |

### Phrases types pour l’agent

| Tu veux… | Phrase type |
|----------|-------------|
| Hit trop faible | « **PurgeHit** : descente un peu plus **forte**, rester **sec** » |
| Kill pas assez satisfaisant | « **PurgeKill** : renforcer le **bloom**, un peu plus **long** » |
| Trop proche du wave clear | « Garder Warm Descent mais descente plus **courte** et plus **grave** » |
| Fatigue en spam | « **PurgeHit** plus **discret**, ne pas toucher au kill » |

**Pack de design actuel :** Warm Descent (option 1). Alternatives documentées pour plus tard : Ember Double, Satin Friction.

---

## 14. Pipeline ajout module (checklist agent)

Quand tu demandes un **nouveau module** sur l'arbre, l'agent suit cette liste dans **une seule tâche**.

### Étapes obligatoires

| # | Zone | Fichier | Quoi faire |
|---|------|---------|------------|
| 1 | **Catalogue** | `src/store/upgradeCatalog.ts` | `UpgradeId`, niveaux, coûts, constantes d'effet |
| 2 | **Arbre** | `src/store/moduleTree.ts` | Nœud graph, position hex, branche, `requires` |
| 3 | **Effets** | `src/game/moduleEffects.ts` | Ligne dans `MODULE_EFFECT_REGISTRY` + formule dans `compute*` |
| 4 | **Textes** | `src/i18n/locales/en.ts` + `fr.ts` + `types.ts` | Nom + description (les deux langues) |
| 5 | **Tooltip** | `src/ui/upgradeTooltipStats.ts` | Stats affichées au survol du nœud |
| 6 | **Lexique** | `docs/lexique-jeu.md` | §4 (module) + cette section si besoin |

### Étapes optionnelles (selon le module)

| Zone | Fichier | Quand |
|------|---------|-------|
| **Loot** | `src/game/loot/` | Module qui modifie drops ou collecte |
| **Arène** | `src/game/` (moteur Pixi) | Mécanique active en run (pas seulement un bonus passif) |
| **Dialogue** | `docs/dialogues.md` + i18n tutoriel | ARCH explique le module |

### Registre des effets actuels

Source de vérité code : `MODULE_EFFECT_REGISTRY` dans `src/game/moduleEffects.ts`.  
Chaque entrée lie un `upgradeId` à des **cibles gameplay** (`runConfig.*`, `breach.*`, `loot.*`).

| Module | Cible gameplay | Effet résumé |
|--------|----------------|--------------|
| Node-0 Boot | `runConfig.purgeHitDamage` | Active dégâts de base purge |
| Récupération d'éclats | `runConfig.shardsMultiplier` | ×1.18^rang composé sur le rendement d'éclats (illimité) |
| Rendement d'extraction | `runConfig.shardsMultiplier` | +20 % / rang sur éclats de base (max ×2) |
| Aimant d'éclats | `loot.hexShardRadii` | Collecte / aspiration au sol |
| Purge Strike | `runConfig.purgeHitDamage` | Hybride : +2 flat/rang puis ×1.015^rang composé (illimité) |
| Briseur d'élite | `purge.eliteDamageBonus` | +dégâts purge vs processus lourds |
| Purge Cadence | `runConfig.purgeIntervalMs` | Purge plus rapide |
| Purge Reach | `runConfig.purgeRadius` | Zone principale +2,5 % / rang |
| Éclat de purge | `purge.splashRadius`, `purge.splashDamage` | Extension éclaboussure +50 / +75 / +100 % vs zone principale ; dégâts 15 / 30 / 45 % hors zone directe |
| Injection de latence | `purge.latencySlow` | Ralentit les processus corrompus sous la zone de purge |
| Thread Coolant | `runConfig.passiveHeatPerSec` | Moins d'Overload passive |
| Kill Vent | `breach.killRelief` | Soulagement Breach par kill |
| Meltdown Threshold | `breach.cap` | ×1.05^rang composé sur le cap Breach de base (illimité — remplace l'ancien flat +8/rang) |
| Overclock | `overclock.unlock` | Débloque le bouton Overclock (Espace / HUD) |
| Flux Drive | `runConfig.timeScale` | Débloque le toggle Flux Drive (×2 vitesse de simulation) |

### Système AOE purge (zone principale + dérivés)

Source : `computePurgeAoeProfile()` dans `src/game/moduleEffects.ts`.

| Couche | Module | Affichage joueur | Calcul interne |
|--------|-------|------------------|----------------|
| **Zone principale** | Portée de purge | `+X %` | `basePurgeRadius × (1 + reachBonus)` |
| **Éclaboussure** | Éclat de purge | `+X %` vs zone principale | `mainRadius × (1 + splashBonus)` |

Les futurs modules AOE doivent **dériver de la zone principale** (même scale), pas ajouter des bonus px isolés. Les px restent moteur uniquement, jamais dans les tooltips AOE.

### Ce qui ne change pas

- **Store Zustand** (`useGameStore`) : `purchaseUpgrade` est déjà générique, pas besoin de le modifier par module.
- **Sauvegarde** : les niveaux sont dans `UpgradeLevels` ; ajouter un id met à jour la persistence automatiquement si le type est étendu.

### Planchers de sécurité (soustractions linéaires)

Les modules qui **soustraient** par rang (`subtractPerLevel` dans `moduleEffects.ts`) ont un **plancher absolu** pour éviter des valeurs 0 ou négatives si les niveaux max ou constantes évoluent :

| Stat | Constante | Plancher | Module |
|------|-----------|----------|--------|
| Cadence purge | `MIN_PURGE_INTERVAL_MS` | **150 ms** | Purge Cadence |
| Overload passive / s | `MIN_PASSIVE_HEAT_PER_SEC` | **0,5 / s** | Thread Coolant |

Les stats affichées au tooltip reflètent ces planchers une fois le cap atteint.

### Phrase type pour demander un module

> « Ajoute le module **[nom FR]** sur la branche **[dégâts / thermique]**, parent **[module parent]**, effet **[en une phrase]**, coût **[idée de prix]**. »

---

## 12. Mise à jour de ce document

**Règle :** à chaque **nouvelle feature visible** (écran, bouton, mécanique, branche module tree, étape tuto), l’agent doit **ajouter ou mettre à jour une ligne dans ce fichier** dans la même tâche.

Si tu inventes un nouveau mot pour quelque chose, dis : *« Ajoute ça au lexique »*, l’agent complétera la section adaptée.

---

## Index rapide A → Z (français)

| Terme FR | Voir section |
|----------|--------------|
| Arène / run | §1, §5 |
| Arbre de modules | §3, §4 |
| Boutons menu titre | §1 |
| Brèche / surcharge | §2, §5 |
| Continue / sauvegarde | §3 |
| Éclats hex / run | §3 |
| Fragments d’ancre | §3 |
| Fin de run | §1 |
| Flux Drive | §4, §5 |
| Hub | §1 |
| Node-0 | §2 |
| Heuristique ARCH | §2 |
| Node-0 Boot | §3 |
| Meltdown | §2 |
| Menu titre | §1 |
| Overclock | §5 |
| Overload (jauge) | §5, §6 |
| Pause | §1 |
| Placeholder (arbre) | §3 |
| Prestige | §3 |
| Purge / zone de purge | §5, §13 |
| Sons purge (hit / kill) | §13 |
| Réglages | §1 |
| Révélation arbre | §3 |
| Module tree | §3, §4, §14 |
| Pipeline nouveau module | §14 |
| ARCH / tutoriel | §7 |
| Vagues / boss | §5 |
