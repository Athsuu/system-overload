# Dialogues — Zero Archive

> Référence exhaustive de tous les dialogues du jeu. Toute nouvelle ligne ajoutée au jeu **DOIT** être répercutée ici (voir `.cursorrules`).  
> **Clé i18n** = clé technique dans `src/i18n/locales/en.ts` / `fr.ts`. **EN** = texte in-game officiel. **FR** = traduction si présente dans `fr.ts`.  
> Source catalogue tutoriel : `src/tutorial/tutorialCatalog.ts` · ambient : `src/tutorial/archAmbientCatalog.ts`.

**Légende** : `[NON IMPLÉMENTÉ]` = texte prévu (narrative / design) mais absent du code actuel.

---

## 1. Tutoriel — Groupe `menu_intro`

| ID étape | Clé i18n (corps) | Titre EN | Titre FR | Texte EN (corps) | Texte FR (corps) | Déclencheur | Ancre HUD |
|----------|------------------|----------|----------|------------------|------------------|-------------|-----------|
| `signal_handshake` | `tutorial.signalHandshake` | INCOMING SIGNAL | SIGNAL ENTRANT | …noi—se… [ERR_702] Node-0, parse th—is! Send a re—turn code, wak—e up... pl--ea--se... Connection stable. Do not drop. | …br—uit… [ERR_702] Node-0, parse ç—a ! Envoie un code de ré—ponse, ré—veille-toi... s'il t—e pl—aît... Connexion stable. Ne coupe pas. | Hub `MENU`, première visite ; `unlockWhen: true` | `featured-center` |
| `welcome` | `tutorial.archIntro` + `tutorial.welcomeContext` | ARCH | ARCH | I'm ARCH — Archive Recovery & Containment Heuristic. I compiled you into quarantine. Listen — we don't have much time. Corrupted processes flood the Zero Archive. The Breach is rising. I compiled Node-0 in a quarantined execution thread — the last bubble still stable inside a dying archive. The Seed is the original pure source code of the Zero Archive. I am trying to save it. You keep it isolated. | Je suis ARCH — Heuristique de récupération et de confinement d'archive. Je t'ai compilé en quarantaine. Écoute — on n'a pas beaucoup de temps. Les processus corrompus inondent l'Archive Zéro. La Brèche monte. J'ai compilé Node-0 dans un thread d'exécution en quarantaine — la dernière bulle encore stable dans une archive qui meurt. La Graine est le code source originel pur de l'Archive Zéro. J'essaie de la sauver. Tu la gardes isolée. | `signal_handshake` dismissé (Skip / Got it) | `featured-center` |
| `node0_role` | `tutorial.node0Role` | Quarantined Thread | Thread en quarantaine | You are Node-0 — a child process I compiled into quarantine. This thread is all that stands between the corruption and the Seed. Corrupted processes hammer the quarantine wall. Every purge hit and every passing second feeds the Breach closer to Meltdown. | Tu es Node-0 — un processus enfant que j'ai compilé en quarantaine. Ce thread est tout ce qui sépare la corruption de la Graine. Les processus corrompus martèlent le mur de quarantaine. Chaque purge et chaque seconde rapproche la Brèche de la fusion. | `welcome` dismissé | `featured-center` |
| `mission_loop` | `tutorial.missionLoop` | Contain the Breach | Contenir la Brèche | Stop corrupted processes before they break quarantine. Launch a Run — purge in the arena, salvage Shards from every kill. When the thread ends, spend them on the Skill Tree. I advise. You execute. Each upgrade buys us time toward the Uplink. | Stoppe les processus corrompus avant qu'ils ne brisent la quarantaine. Lance une run — purge dans l'arène, récupère des éclats à chaque kill. Quand le thread se termine, dépense-les sur l'arbre de compétences. Je conseille. Tu exécutes. Chaque amélioration nous rapproche de l'Uplink. | `node0_role` dismissé | `start-run` (spotlight) |
| `skill_tree_intro` | `tutorial.skillTreeIntro` | Skill Tree | Arbre de compétences | This hex grid is our best shot — permanent modules between runs. I can't install them. Select a node and you execute the repair. I don't have a clean repair map. I'm routing recovery protocols I've never run before — we improvise, or we lose the Seed. | Cette grille hex est notre meilleure chance — modules permanents entre les runs. Je ne peux pas les installer. Sélectionne un nœud et tu exécutes la réparation. Je n'ai pas de carte de réparation propre. Je route des protocoles de récupération que je n'ai jamais lancés — on improvise, ou on perd la Graine. | `mission_loop` dismissé · se complète si `skillNodeSelected` | `skill-tree` (spotlight) |

**Labels carte (menu_intro)** : `signal_handshake` → `arch.signalBufferLabel` · autres étapes → `arch.channelLabel` (`ARCH // ADVISORY CHANNEL`).

---

## 2. Tutoriel — Groupe `run_intro` et étapes contextuelles run / hub

Étapes avec `groupId: run_intro` : `purge_zone`, `overload`, `run_shards`.  
Les autres lignes ci-dessous sont des **tutoriels contextuels** (pas de `groupId`) listés ici car déclenchés en run ou post-run.

**Fusion économie (2026-07-08)** : les anciennes étapes `run_shards` (run) et `vault` (hub) sont **une seule carte** — ID technique conservé : **`run_shards`**. L'étape `vault` est retirée du catalogue.

| ID étape | Clé i18n (corps) | Titre EN | Titre FR | Texte EN (corps) | Texte FR (corps) | Déclencheur | Ancre HUD |
|----------|------------------|----------|----------|------------------|------------------|-------------|-----------|
| `purge_zone` | `tutorial.purgeAction` | Purge Zone | Zone de purge | You're live. Your purge zone is the only weapon inside quarantine. Hold it over corrupted processes to destroy them. Every purge hit and every passing second feeds Overload. | Tu es en ligne. Ta zone de purge est la seule arme en quarantaine. Maintiens-la sur les processus corrompus pour les détruire. Chaque coup de purge et chaque seconde qui passe alimente la Surcharge. | `runsStarted >= 1` · écran `PLAYING` | `featured-center` (anchored) |
| `overload` | `tutorial.overloadStakes` + `tutorial.overloadGoal` | Overload | Surcharge | Overload is the live Breach meter on your thread. Keep it under control. At 100% Overload — Meltdown. The quarantine fails. Contain the threat before quarantine breaks. | La Surcharge est le compteur de Brèche en direct sur ton thread. Garde-le sous contrôle. À 100 % de Surcharge — fusion. La quarantaine cède. Contiens la menace avant que la quarantaine ne cède. | `runsStarted >= 1` · `PLAYING` | `overload-bar` (spotlight) |
| `run_shards` | `tutorial.hexShardsUnified` | Hex Shards | Éclats hex | Hex Shards are stable data fragments salvaged from corrupted processes during a run. When the thread ends, they bank in your vault — spend them on the Skill Tree, ARCH's ongoing model for reinforcing Node-0. | Les Éclats hex sont des fragments de données stables récupérés sur les processus corrompus pendant une run. Quand le thread se termine, ils rejoignent ton coffre — dépense-les sur l'arbre de compétences, le modèle continu d'ARCH pour te renforcer. | `runsStarted >= 1` · `PLAYING` | `featured-center` (featured) |
| `overclock` | `tutorial.overclockRisk` | Overclock | Overclock | Overclock surges purge output — but Overload builds faster while active. Press Space when you can handle the pressure. | L'Overclock booste la purge — mais la Surcharge monte plus vite tant qu'il est actif. Espace quand tu peux encaisser la pression. | `[DÉSACTIVÉ]` `unlockWhen: () => false` | `overclock` (spotlight) |
| `skill_tree` | `tutorial.skillTreeLore` | Skill Enhancements | Améliorations | Between runs, spend Hex Shards on hex nodes. Every upgrade hardens the quarantine before the next breach. | Entre les runs, dépense les Éclats hex sur les nœuds hex. Chaque amélioration renforce la quarantaine avant la prochaine brèche. | Écran `UPGRADING` · se complète si `upgradePurchased` | `skill-tree` (anchored) |
| `prestige` | `tutorial.prestigeReveal` | Breach Contained | Brèche contenue | Breach Anchor down. I'm opening a deeper reconfiguration layer — Prestige. Partial reset, permanent gains. The Uplink is still ahead. We take this anyway. | Ancre de Brèche neutralisée. J'ouvre une couche de reconfiguration plus profonde — Prestige. Reset partiel, gains permanents. L'Uplink est encore devant. On y va quand même. | `prestigeUnlocked` · écrans `RUN_END` ou `MENU` | `featured-center` (featured) |
| `flux_drive` | `tutorial.fluxDriveLore` | Flux Drive | Flux Drive | Flux Drive doubles simulation speed inside quarantine — faster combat, faster timers, faster Overload. Toggle only if you can handle the pressure. | Flux Drive double la vitesse de simulation en quarantaine — combat plus rapide, timers plus rapides, Surcharge plus rapide. Active seulement si tu encaisses la pression. | `[DÉSACTIVÉ]` `unlockWhen: () => false` | `flux-drive` (anchored) |

**Labels carte** : `arch.channelLabel` pour toutes ces étapes.

**Clés i18n présentes mais sans étape tutoriel branchée** : `tutorial.breachVentHint`, `tutorial.bossHint` → `[NON IMPLÉMENTÉ]` (textes dans locales, pas de carte dans `tutorialCatalog.ts`).

---

## 3. Pings ambient (ARCH en run + hub)

Catalogue : `archAmbientCatalog.ts` · clés : `archAmbient.*` · composants : **`ArchRunDialogue`** (`PLAYING`, bas HUD, typewriter, 5 s) · **`ArchAmbient`** (hub `MENU` uniquement, panneau carte, Skip, 5 s).  
Prérequis commun : étape tutoriel `welcome` dismissée (`requiresArchMet: true`).

| ID catalogue | Clé i18n | Texte EN | Texte FR | Déclencheur | Fréquence / persistance |
|--------------|----------|----------|----------|-------------|-------------------------|
| `first_run` | `archAmbient.firstRun` | Quarantine thread active. Purge what breaks through. | Thread de quarantaine actif. Purge ce qui franchit la barrière. | `PLAYING` · `runsStarted >= 1` · vague 1 · pas intermission | 1× par **run** (`persistScope: run`) |
| `wave_midpoint` | `archAmbient.waveMidpoint` | Midpoint confirmed. The Archive isn't stable yet — keep purging. | Mi-parcours confirmé. L'Archive n'est pas encore stable — continue la purge. | `PLAYING` · `waveIndex === 5` · pas intermission | 1× par **run** |
| `overload_critical` | `archAmbient.overloadCritical` | Thread pressure critical. I'm losing the channel. | Pression du thread critique. Je perds le canal. | `PLAYING` · `breachProgress >= 80` | 1× par **run** |
| `boss_incoming` | `archAmbient.bossIncoming` | That's the Breach Anchor — the rupture point. End it. | C'est l'Ancre de Brèche — le point de rupture. Finis-la. | `PLAYING` · `waveIndex >= 11` ou phase boss | 1× par **run** |
| `flux_drive_ready` | `archAmbient.fluxDrive` | Flux Drive online. Double speed — double risk. Your call. | Flux Drive en ligne. Double vitesse — double risque. À toi de voir. | `[DÉSACTIVÉ]` `unlockWhen: () => false` | 1× par **profil** (`persistScope: profile`) |

**Label run** : `arch.runRelayLabel` (EN : `ARCH // RELAY`) — affiché au-dessus du ping in-run, pas dans le corps du dialogue.

---

## 4. Écran de fin — Victoire (Breach Contained)

Composant : `RunEndScreen.tsx` · condition : `runOutcome === 'victory_boss'`.

| Rôle | Clé i18n | Texte EN | Texte FR | Déclencheur |
|------|----------|----------|----------|-------------|
| Titre système | `runEnd.victoryTitle` | Breach Contained | Brèche contenue | Victoire boss |
| Sous-titre système | `runEnd.victorySubtitle` | Threat contained — Node-0 holds. | Menace contenue — Node-0 tient. | + vague affichée (`ui.wave`) |
| **ARCH** | `runEnd.victoryArch` | Anchor down. Hex Shards to vault. We bought time — don't waste it. | Ancre down. Éclats hex au coffre. On a gagné du temps — ne le gâche pas. | Victoire boss |
| Système (shards) | `currency.shardsEarnedSuffix` + `currency.transferredToVault` | +N Hex Shards · Transferred to vault | +N Éclats hex · Transférés au coffre | Toujours |

---

## 5. Écran de fin — Défaite (Meltdown)

Composant : `RunEndScreen.tsx` · condition : `runOutcome === 'defeat_breach'`.

| Rôle | Clé i18n | Texte EN | Texte FR | Déclencheur |
|------|----------|----------|----------|-------------|
| Titre système | `runEnd.meltdownTitle` | Meltdown | Fusion | Overload 100 % |
| Sous-titre système | `runEnd.meltdownSubtitle` | Node-0 overloaded — the quarantine thread has failed. | Node-0 en surcharge — le thread de quarantaine a cédé. | Défaite |
| Système (shards) | `currency.shardsEarnedSuffix` + `currency.transferredToVault` | +N Hex Shards · Transferred to vault | +N Éclats hex · Transférés au coffre | Hex Shards de run conservés |

### Pool ARCH (rotation, 1 variante aléatoire par Meltdown, cycle complet sans répétition)

Sélection : `pickMeltdownArchVariantIndex()` · deck des indices restants en `sessionStorage` (`zero-archive-meltdown-arch-remaining`).  
**Règle** : à chaque cycle vide, le deck `[0,1,2]` est **mélangé aléatoirement** (Fisher-Yates) ; on tire la première carte, puis la suivante au prochain Meltdown, etc. Une phrase ne revient qu'après les **deux autres**.

| # | Clé i18n | Texte EN | Texte FR |
|---|----------|----------|----------|
| 1 | `runEnd.meltdownArchVariants[0]` | I caught you in time. Margin was thinner than last time — reinforcing now. | Je t'ai rattrapé à temps. La marge était plus fine que la dernière fois — renforcement en cours. |
| 2 | `runEnd.meltdownArchVariants[1]` | Still here. Almost lost the thread — I'm not letting that happen again. | Encore là. J'ai failli perdre le thread — ça ne se reproduira pas. |
| 3 | `runEnd.meltdownArchVariants[2]` | Got you. That was close — closer than I'd like. Reinforcing. | Je te tiens. C'était juste — plus juste que je ne voudrais. Renforcement en cours. |

**Note** : ancienne réplique unique `…thread lost. Signal—` retirée ; ne pas la réintroduire.

---

## 6. Écran de fin — Premier Anchor Fragment (unique, one-shot)

Composant : `RunEndScreen.tsx` · condition : `anchorFragmentEarnedThisRun && bankAnchorFragments === lastRunAnchorFragments` (premier fragment jamais gagné).

| Rôle | Clé i18n | Texte EN | Texte FR | Déclencheur |
|------|----------|----------|----------|-------------|
| **ARCH** | `runEnd.firstAnchorArch` | Anchor data secured. Capstone modules are online — spend fragments on the marked nodes. | Données d'ancre sécurisées. Les modules capstone sont en ligne — dépense les fragments sur les nœuds marqués. | 1ère fois qu'un Anchor Fragment entre au vault |

Référence narrative validée : `docs/narrative.md` § ARCH — *Premier Anchor Fragment*.

---

## 7. Écran de fin — Prestige

Composant : `RunEndScreen.tsx` · condition : `prestigeUnlockedThisRun` (première victoire boss de la session / run).

| Rôle | Clé i18n | Texte EN | Texte FR | Déclencheur |
|------|----------|----------|----------|-------------|
| Bannière système | `runEnd.prestigeUnlocked` | Prestige system unlocked | Système Prestige débloqué | 1ère victoire Breach Anchor (prestige débloqué) |
| **ARCH** | `runEnd.prestigeArch` | Deeper layer unlocked. You can rewrite more of the archive than I can reach now. | Couche plus profonde débloquée. Tu peux réécrire plus de l'archive que je ne peux l'atteindre maintenant. | Même condition |

**Carte tutoriel liée** (pas écran de fin) : `tutorial.prestigeReveal` — voir §2, étape `prestige`.

---

## 8. Historique des ajouts

| Date | Dialogue ajouté | Contexte | Version narrative.md liée |
|------|-----------------|----------|---------------------------|
| 2026-07-08 | Création du fichier — inventaire complet tutoriel, ambient, run end | Référence agent / PO | v0.7 |
| 2026-07-08 | `archAmbient.waveMidpoint` | Ping run vague 5 | v0.7 |
| 2026-07-08 | Retrait `runEnd.meltdownArch` (…thread lost…) | Écran Meltdown — ARCH silencieux | v0.7 |
| 2026-07-08 | Intégration pool 3 variantes `runEnd.meltdownArchVariants` (rotation cycle complet — les 2 autres avant réapparition) | Écran Meltdown — renforcement d'urgence ARCH | v0.7 |
| 2026-07-08 | Unification terminologique **Hex Shards** — fusion tuto `run_shards` + `vault` (ID conservé : `run_shards`) ; retrait de « Run Shards » / « Available Shards » des textes joueur | Économie méta v4 · HUD · hub · run end | v0.7 |
| — | `[NON IMPLÉMENTÉ]` `tutorial.breachVentHint`, `tutorial.bossHint` | Clés i18n sans carte tuto | v0.7 |

---

## Annexe — Textes ARCH / lore affichés hors dialogues carte

| Contexte | Clé i18n | Texte EN | Texte FR |
|----------|----------|----------|----------|
| Menu titre + hub (tagline) | `tagline` | The Zero Archive collapses under a wave of corrupted processes. | L'Archive Zéro s'effondre sous une vague de processus corrompus. |
| Hub upgrades (sous-titre) | `hub.upgradesSubtitle` | Between runs, spend Hex Shards on hex nodes. Every upgrade hardens the quarantine before the next breach. | Entre les runs, dépense les Éclats hex sur les nœuds hex. Chaque amélioration renforce la quarantaine avant la prochaine brèche. |
| Constantes ARCH (non affichées seules) | `arch.intro` | I'm ARCH — Archive Recovery & Containment Heuristic. I compiled you into quarantine. Listen — we don't have much time. | Je suis ARCH — Heuristique de récupération et de confinement d'archive. Je t'ai compilé en quarantaine. Écoute — on n'a pas beaucoup de temps. |
| Constantes ARCH | `arch.role` | Recovery heuristic — trapped inside the same collapse as you. I can guide. I cannot execute. | Heuristique de récupération — piégée dans le même effondrement que toi. Je peux guider. Je ne peux pas exécuter. |
| Constantes ARCH | `arch.improvises` | I don't have a clean repair map. I'm routing recovery protocols I've never run before — we improvise, or we lose the Seed. | Je n'ai pas de carte de réparation propre. Je route des protocoles de récupération que je n'ai jamais lancés — on improvise, ou on perd la Graine. |
