# Lexique Zero Archive — pour communiquer avec l’agent

Document de référence pour le **créateur / product owner** : comment nommer une zone, une mécanique ou un écran quand tu veux modifier, améliorer ou supprimer quelque chose — **sans connaître le code**.

> **Textes visibles dans le jeu (UI)** : anglais + français (i18n).  
> **Ce lexique** : en français pour toi ; la colonne « Terme UI (EN) » = ce que le joueur voit en anglais.

**Dernière mise à jour** : lore v0.7 — ARCH, Node-0, Archive Zéro, la Graine, Uplink ; arène purge-only (pas de sprite joueur).

---

## Comment utiliser ce lexique

Quand tu demandes une modification, essaie d’utiliser le **mot du lexique** + **l’action** + **le ressenti** si besoin.

**Formule simple :**

> « Sur **[zone]**, je veux **[action]** sur **[élément]** — parce que **[ressenti / intention]**. »

**Exemples :**

| Tu veux dire… | Phrase type pour l’agent |
|---------------|-------------------------|
| Boutons menu trop petits | « Sur le **menu titre**, agrandir les **boutons hex** (New Game, Continue…). » |
| Tuto gênant | « Désactiver ou raccourcir le **tutoriel TRACE** étape **Contenir la Brèche** (spotlight sur Start Run). » |
| Jauge qui monte trop vite | « Réduire la montée de **Overload** / **Breach** passive en run. » |
| Pas assez d’éclats | « Augmenter les **Run Shards** gagnés par kill » ou « buff branche **Éclats** du **skill tree**. » |

---

## 1. Écrans et navigation (où tu es dans le jeu)

| Mot à utiliser | Terme UI (EN) | C’est quoi ? | Mot technique (agent) |
|--------------|---------------|--------------|---------------------|
| **Menu titre** / **menu principal** | New Game, Continue, Settings, Quit | Premier écran au lancement, avant le hub | `MAIN_MENU` · `MainMenuScreen` |
| **Hub** / **écran entre les runs** | Zero Archive + skill tree | Grille d’upgrades, bouton Start Run, éclats disponibles | `MENU` |
| **Écran upgrades** (post-run) | Skill Enhancements | Même hub mais après une run, titre « améliorations » | `UPGRADING` |
| **Run** / **partie** / **arène** | — | Combat en direct, WASD, ennemis, jauge | `PLAYING` |
| **Pause** | SYSTEM HALT | Jeu figé, stats run, Reprendre / Abandonner | `PAUSED` |
| **Fin de run** | Breach Contained / Meltdown | Victoire ou défaite, éclats gagnés | `RUN_END` |
| **Réglages** | System Config / Settings | Volume, langue, retour menu | `SettingsPanel` · `SettingsOverlay` |
| **Menu dev** | DEV | Outils debug (développement seulement) | `DevMenu` |

**Flux habituel :** Menu titre → Hub → Start Run → Arène → Fin de run → Hub (ou skill tree upgrades).

---

## 2. Lore et identité (fantasy du jeu)

| Mot à utiliser | Terme UI (EN) | Explication simple |
|--------------|---------------|-------------------|
| **Kernel** / **Noyau** | Kernel | **Tu es** le Kernel — hexagone joueur, pas un gardien externe |
| **Breach** / **Brèche** / **Surcharge** | Overload (jauge) · Breach (lore) | Pression du système ; si ça explose → défaite |
| **Meltdown** / **Fusion du noyau** | Meltdown | Défaite à 100 % surcharge |
| **Breach Contained** / **Brèche contenue** | Breach Contained | Victoire (boss vaincu) |
| **Processus corrompus** | Corrupted processes | Ennemis |
| **Dissipation Nodes** | (nom technique ennemis) | Hex ennemis dans l’arène — OK de garder ce nom en interne |
| **TRACE** | TRACE | Voix conseil / tutoriel ; parle en **je** (I / Je) |
| **Quarantaine** | quarantine | Lore : bulle isolée où tourne le Kernel |

**À ne plus demander sans accord :** Heart / Cœur, gardien externe, « redirection de flux ».

---

## 3. Économie et progression

| Mot à utiliser | Terme UI (EN) | C’est quoi ? |
|--------------|---------------|--------------|
| **Éclats hex** / **éclats disponibles** | Available Shards · Hex Shards | Monnaie permanente (skill tree) — achat de la plupart des modules |
| **Fragments d’ancre** | Anchor Fragments | 2e monnaie permanente — gagnés **uniquement** en tuant le boss (victoire) ; modules « capstone » |
| **Éclats de run** | Run Shards | Monnaie gagnée **pendant** une run (transférée au coffre à la fin) |
| **Coffre** / **vault** | vault | Où vont les éclats après une run |
| **Skill tree** / **arbre de compétences** | Skill tree | Arbre hex **radial** : un seul nœud visible au départ, branches qui se révèlent |
| **Node-0 Boot** / **amorçage Node-0** | Node-0 Boot | **Nœud racine** achetable — seul module visible au tout début |
| **Révélation** (arbre) | — | Dès qu’un parent est acheté **1 fois**, ses enfants **apparaissent** (visible ≠ achetable) |
| **Placeholder** / **module réservé** | Module pending (placeholder_XX) | Case grise « RESERVED » — visible mais **non achetable** (contenu futur) |
| **Nœud** / **module** | (nom de l’upgrade) | Une case sur l’arbre (shards ou Anchor Fragments selon le module) |
| **Prestige** | Prestige | Couche de progression avancée (boss / victoire) |
| **Sauvegarde** / **Continue** | Continue | Progression stockée (éclats, upgrades) — pas une run en cours |
| **Nouvelle partie** | New Game | Repartir à zéro (avec confirmation si vraie progression) |

---

## 4. Branches du skill tree

Utilise ces noms quand tu parles d’une **direction d’upgrades** :

| Mot à utiliser (FR) | Branche (agent) | Thème |
|---------------------|-----------------|--------|
| **Cadence** / vitesse d’attaque | `attackSpeed` | Tir / purge plus rapide |
| **Dégâts** | `degats` | Puissance de purge |
| **Thermique** | `thermique` | Refroidissement, seuil meltdown, Breach Vent |
| **AOE Purge** / portée purge | `purgeAoe` | Zone de purge, Overclock, portée |
| **Éclats** | `shards` | Bonus d’éclats par kill |
| **Ennemis** | `enemies` | Moins d’ennemis / HP réduits |
| **Flux** | `flux` | Flux Drive (×2 vitesse simulation) |

---

## 5. Gameplay en run (mécaniques)

| Mot à utiliser | Terme UI (EN) | C’est quoi ? | Fichiers / zone (agent) |
|--------------|---------------|--------------|-------------------------|
| **Zone de purge** | Purge zone | Zone sous la souris qui détruit les ennemis | `purgeZone` · `PurgeZoneEngine` |
| **Purge** | Purge | Attaque principale (pas des « projectiles » classiques) | `enemyCombat` · HUD |
| **Overload** (jauge HUD) | Overload | Jauge en bas = Breach en % pendant la run | `HUD` · `breachProgress` |
| **Overclock** | Overclock | Skill actif (Espace / bouton hex HUD) — boost temporaire | `overclock` · `OverclockButton` |
| **Flux Drive** | Flux Drive | Toggle ×2 vitesse (si débloqué) | `fluxDrive` · HUD |
| **Vagues** | Wave | Vagues d’ennemis | `WaveEngine` · `waveConfig` |
| **Boss** / **Ancre de brèche** | Breach Anchor | Boss de fin | `wavePhase: boss` |
| **Grille hex arène** | — | Fond hex pendant le combat | `ArenaHexOverlay` |

---

## 6. Interface en run (HUD)

| Élément | Où c’est | Ancre tutoriel (`data-tutorial-anchor`) |
|---------|----------|----------------------------------------|
| Jauge **Overload** | Bas écran | `overload-bar` |
| Badge **Run Shards** | Haut droite | `run-shards` |
| Bouton **Overclock** | Bas droite | `overclock` |
| **Flux Drive** | HUD | `flux-drive` |
| Indicateur vague / boss | HUD | — |

---

## 7. Tutoriels ARCH

| Mot à utiliser | C’est quoi ? |
|--------------|--------------|
| **Tutoriel ARCH** / **coach** | Cartes de texte + parfois spotlight |
| **Spotlight** | Zone éclairée (lift chaud léger) + reste assombri, run en pause si en jeu |
| **Fond terminal** | Grille hex + scanlines + vignette breach — menu titre, hub et arène (hub un peu plus vivant) |
| **Glitch hub** | Titre/tagline TRACE, overlay sur l’arbre, singularité KERNEL, nœud sélectionné |
| **Police Rajdhani** | Titres + UI (latin FR/EN) — remplace Georgia / mono système |
| **Featured** | Carte centrée sans ancrage HUD (intro menu) |
| **Skip** | Bouton pour passer le tutoriel |
| **Got it** / **Compris** | Dernier bouton du groupe (remplace ›) — ferme tout le groupe |
| **Groupe menu intro** | `menu_intro` — bienvenue + rôle Node-0 + mission |
| **Groupe premier run** | `run_intro` — purge, overload, éclats, etc. |

**Étapes courantes (nom à utiliser) :**

| Nom simple (FR) | ID technique |
|-----------------|--------------|
| Bienvenue ARCH | `welcome` |
| Rôle de Node-0 | `node0_role` |
| Contenir la Brèche / boucle mission | `mission_loop` |
| Intro skill tree | `skill_tree_intro` |
| Zone de purge | `purge_zone` |
| Enjeu surcharge | `overload` |
| Éclats de run | `run_shards` |
| Overclock | `overclock` |
| Arbre (achat) | `skill_tree` |
| Coffre / éclats dispo | `vault` |
| Prestige | `prestige` |
| Flux Drive | `flux_drive` |

**Messages ambiants ARCH** (hors tutoriel structuré) : `ArchAmbient` — ex. boss incoming, surcharge critique.

---

## 8. Apparence et ressenti visuel (DA)

| Mot à utiliser | C’est quoi ? |
|--------------|--------------|
| **Dark Hex Terminal** | Style global : sombre, hex, or, breach orange |
| **Scanlines** | Lignes CRT légères à l’écran |
| **Glitch** | Texte qui « casse » brièvement (titre, TRACE) |
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

Tu peux dire « touche **l’arène** » ou « touche **le hub** » — l’agent saura :

| Tu dis… | Dossier |
|---------|---------|
| Arène, combat, ennemis, 60 FPS | `src/game/` |
| Menus, HUD, skill tree, écrans | `src/ui/` |
| Éclats, saves, upgrades, états jeu | `src/store/` |
| Couleurs, thème | `src/theme/` |
| Textes FR/EN | `src/i18n/locales/` |
| Tutoriels TRACE | `src/tutorial/` + `TutorialCoach` |
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

## 12. Mise à jour de ce document

**Règle :** à chaque **nouvelle feature visible** (écran, bouton, mécanique, branche skill tree, étape tuto), l’agent doit **ajouter ou mettre à jour une ligne dans ce fichier** dans la même tâche.

Si tu inventes un nouveau mot pour quelque chose, dis : *« Ajoute ça au lexique »* — l’agent complétera la section adaptée.

---

## Index rapide A → Z (français)

| Terme FR | Voir section |
|----------|--------------|
| Arène / run | §1, §5 |
| Arbre de compétences | §3, §4 |
| Boutons menu titre | §1 |
| Brèche / surcharge | §2, §5 |
| Continue / sauvegarde | §3 |
| Éclats hex / run | §3 |
| Fragments d’ancre | §3 |
| Fin de run | §1 |
| Flux Drive | §4, §5 |
| Hub | §1 |
| Kernel / Noyau | §2 |
| Kernel Boot | §3 |
| Meltdown | §2 |
| Menu titre | §1 |
| Overclock | §5 |
| Overload (jauge) | §5, §6 |
| Pause | §1 |
| Placeholder (arbre) | §3 |
| Prestige | §3 |
| Purge / zone de purge | §5 |
| Réglages | §1 |
| Révélation arbre | §3 |
| Skill tree | §3, §4 |
| TRACE / tutoriel | §7 |
| Vagues / boss | §5 |
