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
| **Menu dev** | DEV | Outils debug (dev local). Grille 6 onglets : Nav (kills / boss, breach, écrans), Stats (overrides run), Progression (monnaie, modules, snapshot), Robot (playtest), Arbre (éditeur placeholders), Debug (visuels, tuto, **suivi équilibrage**). Raccourcis : `` ` `` / Ctrl+Shift+D, arrêt robot Ctrl+Shift+X | `DevMenu` |
| **Snapshot équilibrage** | balance snapshot | Menu dev → Progression (ou Robot après run) : copie progression, stats et pression ennemie pour Cursor |
| **Suivi équilibrage** | balance tracker | Menu dev → Debug : Start/Stop enregistrement ; log auto à chaque fin de run (shards run + cumul, modules + delta, surcharge passive vs hit) ; rapport markdown copiable / téléchargeable ; persisté localStorage |
| **Record kills max** | best kills by cycle | Meilleur score kills **par cycle** (`bestKillsByCycle`), sauvegardé automatiquement (persiste entre sessions, survit au Recompile) ; inclus dans le snapshot équilibrage |
| **Robot playtest** | autoplay bot | Menu dev → Robot : ton build actuel ; skill Faible/Moyen/Fort ; cycles = ceux déjà débloqués ; pas d’Overclock auto |
| **Éditeur arbre modules** | module tree editor | Menu dev → Arbre. **2 modes**, **2 outils** (§15). Panneau **Modules non placés** (catalogue absent du plan, cartes cyan visibles). |

**Flux habituel :** Menu titre → Hub → Start Run → Arène → Fin de run → Hub (ou module tree upgrades).

---

## 2. Lore et identité (fantasy du jeu)

| Mot à utiliser | Terme UI (EN) | Explication simple |
|--------------|---------------|-------------------|
| **Node-0** | Node-0 | Processus enfant compilé en quarantaine: tu joues via la **zone de purge**, pas un avatar visible |
| **ARCH** | ARCH | Voix conseil / tutoriel, modèle heuristique continu sur chaque run ; ton urgent, parental, attaché (Archive Recovery & Containment Heuristic) |
| **Breach** / **Brèche** / **Surcharge** | Overload (jauge) · Breach (lore) | Pression du système ; si ça explose → défaite |
| **Meltdown** / **Fusion du noyau** | Meltdown | Défaite à 100 % surcharge |
| **Surcharge passive (base run)** | passive heat | Base modules **2,8 / s** sans Coolant (`RUN_STAT_BASE.basePassiveHeatPerSec`) ; en run / UI hub : **×1,30 composé par Cycle** (`CYCLE_HEAT_GROWTH_PER_LEVEL`) — la fiche stats et Coolant affichent la valeur **effective du cycle sélectionné** |
| **Fuite / leak** | — | **Retiré** : plus de pic Breach en fin de trajet. L’ennemi **réapparaît** sur un autre mur (wrap). |
| **Surcharge au hit** | hit heat / riposte | Chaque hit = **échange** : riposte = **PV max × 7 %** (boss via ses PV), puis **Blindage** mitige `brut × (10 / (10 + blindage))`. **Chaque ennemi touché** riposte (zone, splash, explosion) |
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
| **Éclats hex** / **Hex Shards** | Hex Shards | Monnaie unique : **drop au sol** quand un ennemi meurt, **ramassée** en passant la zone de purge à proximité ; créditée au coffre à la collecte ; dépensée sur le module tree. **Base / kill = numéro du Cycle** (C1→1, C2→2, …), puis × Récupération d’éclats / Extraction (protocoles) |
| **Fragments d’ancre** / **Puces matérielles** | Anchor Fragments | 2e monnaie permanente, **+1 tous les 3 Cycles réussis** (`cyclesSinceLastAnchor`) ; sert à **Surcharger** un module (Hardware Supercharge, voir §3bis) — n'achète plus de module directement |
| **Cycle** / **Cycles** | Cycle | Couche de progression hub : horde continue + boss à 75 kills ; soft-block PV/Surcharge plus dur par cycle ; Cycle 2+ débloqué après 1er clear du cycle précédent |
| **Coffre** / **vault** | vault | Où vont les Hex Shards après une run |
| **Module tree** / **arbre de modules** | Module tree | Arbre hex **radial** : somme des deux boucles ARCH (urgence Meltdown + optimisation continue) ; un seul nœud visible au départ, branches qui se révèlent |
| **Node-0 Boot** / **amorçage Node-0** | Node-0 Boot | **Nœud racine** — baseline **gratuit** (niveau 1 dès le départ, non achetable), seul module visible au tout début |
| **Révélation** (arbre) |, | Dès qu’un parent est acheté **1 fois**, ses enfants **apparaissent** (visible ≠ achetable) |
| **Placeholder** / **module réservé** | Module pending (placeholder_XX) | Case grise libellée **P01 / P02…** (identifiant visible), **non achetable** (contenu futur). Canon : `src/store/moduleTreePlaceholders.ts` |
| **Nœud** / **module** | (nom de l’upgrade) | Une case sur l’arbre, achetée en **Éclats hex** (tous les modules, y compris Overclock et Flux Drive **tant que la migration prestige Vague 1 n’est pas livrée**) — les Anchor Fragments servent uniquement au Hardware Supercharge (§3bis) |
| **Prestige** / **Recompile** | Recompile | Hard reset volontaire après **Cycle 2 clear** : perd modules, éclats, ancres, cycles ; garde **Fragments de Graine**, protocoles prestige achetés, **Profondeur de Recompilation** (compteur) |
| **Fragments de Graine** | Seed Fragments | Monnaie permanente prestige, gagnée à chaque Recompile — paie Fondamentaux, compétences et branches |
| **Protocoles de la Graine** | Seed Protocols | Écran hub dédié (cyan) pour la couche prestige permanente |
| **Protocoles Fondamentaux** | Core Protocols | 5 modules permanents illimités (Mémoire résiduelle, Renfort d'amorçage, Ligne thermique, Protocole d'extraction, Résonance de Graine) — onglet **Fondamentaux** |
| **Compétence** (prestige) | Skill unlock | Protocole max rang 1 nommé (ex. **Purge explosive**) — onglet **Compétences** ; jamais appelé « jouet » |
| **Branche de compétence** | Skill branch | Mini-**arbre** SF plafonné visible **après** unlock de la compétence (fork : parent → 3 cases, ex. Rayon / Dégâts / Chaîne) |
| **Purge explosive** | Explosive Purge | Compétence prestige : chaque kill de purge déclenche une explosion (40 % des dégâts de purge, rayon 80 px de base) |
| **Profondeur de Recompilation** | Recompile Depth | Compteur de Recompiles effectuées (affichage) — **aucun** bonus combat automatique |
| **Sauvegarde** / **Continue** | Continue | Progression stockée (éclats, upgrades), pas une run en cours |
| **Nouvelle partie** | New Game | Repartir à zéro (avec confirmation si vraie progression) |

### Philosophie prestige (cible + Vague 1 livrée)

Règle agent : **`.cursor/rules/prestige-philosophy.mdc`**. Résumé PO :

1. **Fondamentaux** (les 5) — socle stats **illimité**, pas la carotte principale.
2. **Compétences (unlock max 1)** — gameplay nommé (ex. Purge explosive) ; achetable dès le **1er Recompile** (**2 SF**).
3. **Branche d’amélioration** — une fois la compétence achetée, nœuds SF plafonnés pour spécialiser (builds différents entre joueurs).

UI : onglets **Fondamentaux / Compétences** ; après achat d’une compétence, **mini-arbre** d’améliorations (spine + barre + cases en rangée).  
Mémoire résiduelle : **+200** éclats / rang **à l’achat** et au prochain Recompile (départ).

**Checklist Vague 1** :

1. [x] Modèle `fundamental` | `skillUnlock` | `skillBranchNode`
2. [x] Purge explosive = unlock + 3 nœuds (Rayon, Dégâts, Chaîne)
3. [x] Overclock + Flux Drive → unlocks prestige (retrait arbre shards)
4. [x] Soft comfort : unlock 2 SF + Mémoire résiduelle +200
5. [x] UI onglets + mini-arbre branche (après unlock)
6. [x] i18n FR+EN + lexique + effets runtime

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

Arbre radial — **15 modules** actifs + **2 placeholders** :

| Mot à utiliser (FR) | Branche (agent) | Thème |
|---------------------|-----------------|--------|
| **Dégâts** | `degats` | **Purge Strike**, **Amplificateur de purge**, **Purge Cadence**, **Critique de purge**, **Purge Reach**, **Éclat de purge**, **Injection de latence** |
| **Thermique** | `thermique` | **Node-0 Boot**, **Récupération d'éclats**, **Flux de menace**, **Aimant d'éclats**, **Thread Coolant**, **Kill Vent**, **Blindage de quarantaine**, **Meltdown Threshold** |
| **Flux** (icône hub) | `flux` | Icône **Node-0 Boot** |

| Module (FR) | Terme UI (EN) | Position hex (q, r) | Parent | Effet |
|-------------|---------------|---------------------|--------|-------|
| **Node-0 Boot** | Node-0 Boot | (0, 0) | racine | Baseline gratuit |
| **Frappe de purge** | Purge Strike | (0, +2) | Node-0 Boot | +3 flat/rang dégâts purge (max 10) — 10 / 12 / 15… / 50 (total 255) |
| **Cadence de purge** | Purge Cadence | (−2, +4) | Frappe de purge | Purge plus rapide |
| **Critique de purge** | Purge Crit | (−3, +4) | Cadence de purge | +2 % chance crit / rang (base 8 % → max 18 %), multi ×2 |
| **Portée de purge** | Purge Reach | (+2, +2) | Frappe de purge | Zone principale en **hex** (+2,5 % / rang) ; 1 hex = taille de base Node-0 |
| **Éclat de purge** | Purge Splash | (+3, +1) | Portée de purge | Rayon splash en **hex** (+70/+105/+140 % vs zone) ; dégâts 40/70/100 % (rang 3 = purge) |
| **Amplificateur de purge** | Purge Amplifier | (0, +4) | Cadence + Portée | +7 flat dégâts purge / rang (max +35) — 50 / 75 / 100 / 125 / 150 |
| **Injection de latence** | Latency Injection | (0, +3) | Amplificateur de purge | Ralentit les processus sous la zone de purge |
| **Seuil de fusion** | Meltdown Threshold | (+2, −4) | Refroidissement de thread | Cap Breach +8 % / rang → 180 % au rang 10 |
| **Refroidissement de thread** | Thread Coolant | (0, −2) | Node-0 Boot | −0,10/s Overload passive / rang (plancher 1,8/s) |
| **Évacuation de kill** | Kill Vent | (−2, −2) | Refroidissement de thread | −0,3 % Breach / kill / rang → −1,5 % au rang 5 |
| **Blindage de quarantaine** | Quarantine Plating | (0, −4) | Refroidissement de thread | +3 blindage / rang, max 5 → **15** — mitige la Surcharge **au hit** (id technique `leakSealing`) |
| **Récupération d'éclats** | Shard Salvage | (+4, −3) | Aimant d'éclats | +1 Éclat hex / kill (1 rang) — ticket **25** |
| **Flux de menace** | Threat Feed | (+4, −1) | Aimant d'éclats | +50 % spawn / maxAlive / rang — **35 / 50 / 75** |
| **Aimant d'éclats** | Shard Magnet | (+2, −1) | Node-0 Boot | QoL collecte early — **5 / 12 / 22** |

**Compétences prestige (SF, onglet Compétences)** :

| Compétence | Coût unlock (SF) | Prérequis | Effet |
|------------|------------------|-----------|--------|
| **Purge explosive** | 2 | — | Kills explosent (branche Rayon / Dégâts / Chaîne) |
| **Overclock** | 3 | — | Bouton Overclock (Espace / HUD) — permanent |
| **Flux Drive** | 5 | Overclock | Toggle ×2 vitesse — permanent |

**Retiré de l'arbre shards** : Overclock, Flux Drive (→ Protocoles de la Graine).

**Retiré (ancien arbre)** : `attackSpeed`, `purgeAoe`, `shards`, `enemies`, `breachDissipation`, `placeholder_02`, `placeholder_03`, placeholders design.

---

## 5. Gameplay en run (mécaniques)

| Mot à utiliser | Terme UI (EN) | C’est quoi ? | Fichiers / zone (agent) |
|--------------|---------------|--------------|-------------------------|
| **Zone de purge** | Purge zone | Zone sous la souris qui détruit les ennemis | `purgeZone` · `PurgeZoneEngine` |
| **Shockwave Purge Splash** | Splash shockwave | Anneau cyan qui s’étend du bord purge au rayon max ; visible à **chaque purge hit** si Purge Splash est installé | `effects.ts` · `purgeZone.ts` · `EffectEngine.tsx` |
| **Purge** | Purge | Attaque principale (pas des « projectiles » classiques) | `enemyCombat` · HUD |
| **Overload** (jauge HUD) | Overload | Jauge en bas = Breach en % pendant la run | `HUD` · `breachProgress` |
| **Overclock** | Overclock | Compétence prestige (SF) — bouton hex HUD, boost temporaire | `overclock` · `OverclockButton` · `prestigeUnlocks` |
| **Flux Drive** | Flux Drive | Compétence prestige (SF) — toggle ×2 vitesse | `fluxDrive` · HUD · `prestigeUnlocks` |
| **Horde** | Horde | Spawn continu d’ennemis dès le Start Run ; plafond `maxAlive` ; s’arrête pendant le boss | `src/game/horde/` · `HordeEngine` · `hordeConfig` |
| **Niveau ennemi** | Enemy level | = **numéro de Cycle** ; PV trash = **20 × cycle** ; boss = trash × **6**. Les éclats / kill suivent le **Cycle** | `enemyScaling.ts` · `cycleScaling.ts` · `runConfig.ts` |
| **Boss** / **Ancre de brèche** | Breach Anchor | Boss à **75 kills** — **×6 PV** vs trash du même cycle, plus grand visuellement ; spawn horde stoppé | `runPhase: boss` · `BOSS_KILL_THRESHOLD` · `BOSS_ENCOUNTER_HP_MULT` |
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

## 5c. Registre Pression → Contre (pierre / feuille / ciseaux)

Philosophie : chaque **pression** a **un contre dédié et lisible**. Pas de module fourre-tout.  
Règle agent : [`.cursor/rules/mechanic-counters.mdc`](../.cursor/rules/mechanic-counters.mdc).

| Pression | Contre officiel | Statut |
|----------|-----------------|--------|
| **Surcharge au hit** | **Blindage de quarantaine** (`leakSealing`) | OK |
| **PV ennemis** (trash + boss) | **Dégâts de purge** (Strike, Amp, Crit, Splash, Reach…) | OK |
| **Chaleur passive** | **Thread Coolant** | OK (plancher 1,8 / s) |
| **Jauge Overload** (accumulation) | Pack **4 piliers** : Coolant + Kill Vent + Seuil Meltdown + Blindage | OK — sous-mécaniques |
| **Vitesse ennemie** | Latence (sous zone seulement) | **GAP** — pas de contre global dédié |
| **Densité / spawn horde** | Aucun dédié (DPS indirect ; wrap mur sans Breach) | **GAP** / by-design |
| **Friction loot** | Aimant d’éclats | OK |
| **Rendement éclats** | Récupération d’éclats | OK |

Hors scope immédiat : inventer anti-vitesse / anti-densité.

---

## 6. Interface en run (HUD)

| Élément | Où c’est | Ancre tutoriel (`data-tutorial-anchor`) |
|---------|----------|----------------------------------------|
| Jauge **Overload** | Bas écran | `overload-bar` |
| **Hex Shards** | Badge haut-droite (hub + run), total unique `bankShards`, monte à chaque **collecte** d’éclat en run | `hex-shards` |
| Bouton **Overclock** | Bas droite | `overclock` |
| **Flux Drive** | HUD | `flux-drive` |
| Compteur **kills / 75** (+ état boss) + **timer run** (`MM:SS`) | Haut centre | — |

### Fiche stats Node-0 (hub)

Bouton stats coin hub · `PlayerStatsPanel` · `getPlayerStatSheet()` · **4 onglets** : Dégâts · Surcharge · Économie · Divers.

| Onglet | Contenu typique |
|--------|-----------------|
| **Dégâts** | Dégâts / cadence / zone purge, éclaboussure, amplificateur, ralentissement |
| **Surcharge** | Chaleur passive, Kill Vent, Blindage de quarantaine, seuil Meltdown |
| **Économie** | Bonus rendement, éclats / kill, prime victoire |
| **Divers** | Réserve (vide pour l’instant) |

| Toujours visible (base Node-0) | Révélé si module acheté (≥ 1 rang) |
|--------------------------------|-------------------------------------|
| Dégâts purge, cadence, zone principale, Surcharge passive / s, seuil Meltdown | Éclat de purge, Récupération, Flux de menace, Kill Vent, etc. |

Les tooltips module tree affichent **uniquement le bonus du module** (ex. `+2 %` crit) — **jamais** le total global base+modules (doublon avec la fiche stats). La fiche stats hub affiche les **totaux finaux**.

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
| Menus, HUD, module tree, écrans | `src/ui/` (voir sous-dossiers ci-dessous) |
| Éclats, saves, upgrades, états jeu | `src/store/` |
| Couleurs, thème | `src/theme/` |
| Textes FR/EN | `src/i18n/locales/` |
| Tutoriels ARCH | `src/tutorial/` + `src/ui/arch/TutorialCoach.tsx` |
| Sauvegarde fichier | `persistence.ts` · clé `system-overload-save` |
| Réglages joueur | `settingsPersistence.ts` · `src/ui/settings/` |

Sous-dossiers `src/ui/` :

| Dossier | Contenu |
|---------|---------|
| `screens/` | Menu principal, hub arbre, protocoles Seed, pause, fin de run |
| `hud/` | HUD run, Overclock, fond hex arène |
| `hub/` | Lanceur run, monnaie, stats, backdrops, Recompile |
| `module-tree/` | Rendu arbre modules, tooltips, pan/zoom |
| `arch/` | Canal ARCH, tutoriels, glitch text |
| `shared/` | Boutons hex, popovers, hooks transverses |
| `settings/` | Panneau réglages, modales |
| `transitions/` | Transitions plein écran entre hub et arène |

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
| 5 | **Tooltip** | `src/ui/module-tree/upgradeTooltipStats.ts` | Stats affichées au survol du nœud |
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
| Récupération d'éclats | `runConfig.killBonusShards` | +1 Éclat hex garanti / kill (1 rang) ; non multiplié par Extraction prestige |
| Flux de menace (`victoryShardBonus`) | `runConfig.hordeSpawnIntervalMs`, `runConfig.hordeMaxAlive` | +50 % cadence spawn & maxAlive / rang (max 3) |
| Aimant d'éclats | `loot.hexShardRadii` | Collecte / aspiration au sol |
| Purge Strike | `runConfig.purgeHitDamage` | +3 flat/rang (max 10) ; les % permanents viennent du prestige (**Boot Reinforcement** uniquement, pas la profondeur) |
| Purge Cadence | `runConfig.purgeIntervalMs` | Purge plus rapide |
| Critique de purge | `runConfig.criticalChance` | +2 % / rang (base 8 % → max 18 % au rang 5) ; multi ×2 inchangé |
| Purge Reach | `runConfig.purgeRadius` | Zone principale +2,5 % / rang |
| Éclat de purge | `purge.splashRadius`, `purge.splashDamage` | Extension éclaboussure +70 / +105 / +140 % vs zone principale ; dégâts 40 / 70 / 100 % hors zone directe (rang 3 = dégâts purge) |
| Injection de latence | `purge.latencySlow` | Ralentit les processus corrompus sous la zone de purge |
| Thread Coolant | `runConfig.passiveHeatPerSec` | −0,10 / rang sur la base (plancher 1,8 / s) ; l’UI affiche le débit **après** mult cycle |
| Kill Vent | `breach.killRelief` | −0,3 % Breach / kill / rang → −1,5 % au rang 5 |
| Meltdown Threshold | `breach.cap` | +8 % / rang additif sur le cap Breach de base → 180 % au rang 10 |
| Overclock | `overclock.unlock` | Débloque le bouton Overclock (Espace / HUD) |
| Flux Drive | `runConfig.timeScale` | Débloque le toggle Flux Drive (×2 vitesse de simulation) |
| **Blindage de quarantaine** | `breach.hitHeatArmor` | +3 blindage / rang (max 15 auj.) ; riposte nette = `brut × (10 / (10 + blindage))` ; brut = **PV max × 0,07** |
| Amplificateur de purge | `runConfig.purgeHitDamage` | +7 flat dégâts purge / rang (max +35, tous cycles) |

### Système AOE purge (zone principale + dérivés)

Source : `computePurgeAoeProfile()` dans `src/game/moduleEffects.ts`.

| Couche | Module | Affichage joueur | Calcul interne |
|--------|-------|------------------|----------------|
| **Zone principale** | Portée de purge | `X,X hex` (+ bonus %) | `basePurgeRadius × (1 + reachBonus)` |
| **Éclaboussure** | Éclat de purge | `X,X hex` | `mainRadius × (1 + splashBonus)` |

**Unité joueur : hex** — `1 hex` = rayon de purge de base Node-0 (`basePurgeRadius` = 72 px moteur). Les px restent moteur uniquement ; stats, tooltips et descriptions affichent des hex.

Les futurs modules AOE doivent **dériver de la zone principale** (même scale), pas ajouter des bonus px isolés.

### Ce qui ne change pas

- **Store Zustand** (`useGameStore`) : `purchaseUpgrade` est déjà générique, pas besoin de le modifier par module.
- **Sauvegarde** : les niveaux sont dans `UpgradeLevels` ; ajouter un id met à jour la persistence automatiquement si le type est étendu.

### Planchers de sécurité (soustractions linéaires)

Les modules qui **soustraient** par rang (`subtractPerLevel` dans `moduleEffects.ts`) ont un **plancher absolu** pour éviter des valeurs 0 ou négatives si les niveaux max ou constantes évoluent :

| Stat | Constante | Plancher | Module |
|------|-----------|----------|--------|
| Cadence purge | `MIN_PURGE_INTERVAL_MS` | **150 ms** | Purge Cadence |
| Overload passive / s | `MIN_PASSIVE_HEAT_PER_SEC` | **1,8 / s** | Thread Coolant |

Les stats affichées au tooltip reflètent ces planchers une fois le cap atteint.

### Phrase type pour demander un module

> « Ajoute le module **[nom FR]** sur la branche **[dégâts / thermique]**, parent **[module parent]**, effet **[en une phrase]**, coût **[idée de prix]**. »

---

## 15. Export éditeur arbre → production

Workflow PO pour **promouvoir un plan dev** vers le jeu (mission agent séparée).

### Modes éditeur (rappel)

| Mode | Stockage | Export bouton | Fichier(s) cible |
|------|----------|---------------|------------------|
| **Ajouts locaux** | `localStorage` dev draft | Copier export placeholders | `src/store/moduleTreePlaceholders.ts` |
| **Brouillon global** | `localStorage` plan global | Copier export TS global | `src/store/moduleTree.ts` + `moduleTreePlaceholders.ts` |

### Outils éditeur (obligatoires)

| Outil | Action joueur / PO | Pan & zoom |
|-------|-------------------|------------|
| **Déplacer** | Glisser-déposer un nœud plan sur une case libre (fantôme vert/rouge) | Inchangés |
| **Placer** | Cliquer un parent, puis une case libre (nouveau placeholder) ou un nœud existant (lien parent) | Inchangés |

L'éditeur démarre en **Déplacer**. Basculer vers **Placer** via le menu dev → Arbre. Les deux outils sont mutuellement exclusifs (pas de conflit clic / drag). Les placeholders affichent toujours **P01 / P02…** sur l’arbre.

### Panneau « Modules non placés » (menu dev)

Liste **uniquement** les entrées **absentes** du plan en cours. **Cliquer** une carte lance le placement (parent → case libre). **Survol** d’un module sur l’arbre (brouillon global) affiche nom + description sans bloquer le clic parent.

| Mode | Contenu du panneau |
|------|-------------------|
| **Brouillon global** | Modules `MODULE_TREE_GRAPH` + placeholders prod non présents dans le plan global |
| **Ajouts locaux** | Placeholders prod (`moduleTreePlaceholders.ts`) non recréés dans le brouillon local |

### Contenu export global (presse-papiers)

1. **Résumé vs production** : modules / placeholders déplacés ou nouveaux
2. **Plan lisible** : hex, parents, chemins
3. **Bloc `MODULE_TREE_GRAPH[]`** : syntaxe identique à `moduleTree.ts` (`kind: 'upgrade'`, `parentId: 'root' | UpgradeId`, `requireLevel` préservé si parent inchangé)
4. **Bloc `MODULE_TREE_PLACEHOLDERS[]`** : syntaxe `moduleTreePlaceholders.ts`
5. **Checklist agent** : build, lexique, §14 si module jouable

### Promotion manuelle (obligatoire)

L'export **ne modifie jamais** le jeu automatiquement. Le PO valide visuellement en brouillon global, copie l'export, puis demande à l'agent d'appliquer.

### Placeholder vs module jouable

| Type | Fichier | Gameplay |
|------|---------|----------|
| **Placeholder** (RESERVED) | `moduleTreePlaceholders.ts` | Visible, non achetable |
| **Module jouable** | §14 complet | Catalogue, effets, i18n, tooltips |

---

## 12. Mise à jour de ce document

**Règle :** à chaque **nouvelle feature visible** (écran, bouton, mécanique, branche module tree, étape tuto), l’agent doit **ajouter ou mettre à jour une ligne dans ce fichier** dans la même tâche.

Si tu inventes un nouveau mot pour quelque chose, dis : *« Ajoute ça au lexique »*, l’agent complétera la section adaptée.

---

## Index rapide A → Z (français)

| Terme FR | Voir section |
|----------|--------------|
| Blindage de quarantaine / hit heat | §2, §4, §5c |
| Registre Pression → Contre | §5c |
| Arène / run | §1, §5 |
| Arbre de modules | §3, §4 |
| Branche de compétence (prestige) | §3 |
| Boutons menu titre | §1 |
| Brèche / surcharge | §2, §5 |
| Continue / sauvegarde | §3 |
| Compétence (prestige) | §3 |
| Éclats hex / run | §3 |
| Fragments d’ancre | §3 |
| Fragments de Graine | §3 |
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
| Purge explosive | §3 |
| Protocoles de la Graine | §3 |
| Protocoles Fondamentaux | §3 |
| Purge / zone de purge | §5, §13 |
| Sons purge (hit / kill) | §13 |
| Réglages | §1 |
| Révélation arbre | §3 |
| Module tree | §3, §4, §14, §15 |
| Pipeline nouveau module | §14 |
| Export éditeur arbre | §15 |
| ARCH / tutoriel | §7 |
| Horde / boss | §5 |
