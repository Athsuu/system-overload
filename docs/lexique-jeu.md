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
| **Hub** / **écran entre les runs** | Zero Archive + skill tree | Grille d’upgrades, bouton Start Run, Hex Shards (coffre) | `MENU` |
| **Écran upgrades** (post-run) | Skill Enhancements | Même hub mais après une run, titre « améliorations » | `UPGRADING` |
| **Run** / **partie** / **arène** |, | Combat en direct, zone de purge (souris), ennemis, jauge | `PLAYING` |
| **Pause** | SYSTEM HALT | Jeu figé, stats run, Reprendre / Abandonner | `PAUSED` |
| **Fin de run** | Breach Contained / Meltdown | Victoire ou défaite, éclats gagnés | `RUN_END` |
| **Réglages** | System Config / Settings | Volume, langue, retour menu | `SettingsPanel` · `SettingsOverlay` |
| **Menu dev** | DEV | Outils debug (développement seulement) | `DevMenu` |

**Flux habituel :** Menu titre → Hub → Start Run → Arène → Fin de run → Hub (ou skill tree upgrades).

---

## 2. Lore et identité (fantasy du jeu)

| Mot à utiliser | Terme UI (EN) | Explication simple |
|--------------|---------------|-------------------|
| **Node-0** | Node-0 | Processus enfant compilé en quarantaine: tu joues via la **zone de purge**, pas un avatar visible |
| **ARCH** | ARCH | Voix conseil / tutoriel, modèle heuristique continu sur chaque run ; ton urgent, parental, attaché (Archive Recovery & Containment Heuristic) |
| **Breach** / **Brèche** / **Surcharge** | Overload (jauge) · Breach (lore) | Pression du système ; si ça explose → défaite |
| **Meltdown** / **Fusion du noyau** | Meltdown | Défaite à 100 % surcharge |
| **Breach Contained** / **Brèche contenue** | Breach Contained | Victoire (boss vaincu) |
| **Processus corrompus** | Corrupted processes | Ennemis |
| **Dissipation Nodes** | (nom technique ennemis) | Hex ennemis dans l’arène, OK de garder ce nom en interne |
| **Quarantaine** | quarantine | Lore : bulle isolée où tourne Node-0 |
| **Archive Zéro** / **Zero Archive** | Zero Archive | Nom du hub / skill tree |
| **La Graine** / **the Seed** | the Seed | Objectif long terme (Uplink) |
| **Heuristique ARCH** |, (implicite) | ARCH ne réagit **pas qu'à l'échec** : modèle heuristique **en continu** sur chaque run (victoire ou défaite). **Meltdown** = signal le plus critique → renforcement ciblé immédiat. Chaque run nourrit aussi des optimisations **plus lentes** (thermique, extraction, modélisation de la menace). **Skill tree** = corrections d'urgence + optimisation continue. **Même Node-0**, jamais remplacé. |
| **Ton narratif** |, | Urgent, terminal, lien au personnage, pas heroic fantasy, **pas froid** |

**À ne plus utiliser :** Heart / Cœur, WASD, sprite joueur en arène, gardien externe, « redirection de flux », ton **froid** ou distant pour ARCH.

---

## 3. Économie et progression

| Mot à utiliser | Terme UI (EN) | C’est quoi ? |
|--------------|---------------|--------------|
| **Éclats hex** / **Hex Shards** | Hex Shards | Monnaie unique, gagnée par kill en run (compteur live), transférée au coffre en fin de run, dépensée sur le skill tree |
| **Fragments d’ancre** | Anchor Fragments | 2e monnaie permanente, **+1 au premier clear boss d’un Cycle** (replays = shards seulement) ; modules « capstone » |
| **Cycle** / **Cycles** | Cycle | Couche de progression hub : 10 vagues + boss par cycle ; scaling plus dur ; Cycle 2+ débloqué après 1er clear du cycle précédent |
| **Coffre** / **vault** | vault | Où vont les Hex Shards après une run |
| **Skill tree** / **arbre de compétences** | Skill tree | Arbre hex **radial** : somme des deux boucles ARCH (urgence Meltdown + optimisation continue) ; un seul nœud visible au départ, branches qui se révèlent |
| **Node-0 Boot** / **amorçage Node-0** | Node-0 Boot | **Nœud racine** achetable, seul module visible au tout début |
| **Révélation** (arbre) |, | Dès qu’un parent est acheté **1 fois**, ses enfants **apparaissent** (visible ≠ achetable) |
| **Placeholder** / **module réservé** | Module pending (placeholder_XX) | Case grise « RESERVED », visible mais **non achetable** (contenu futur) |
| **Nœud** / **module** | (nom de l’upgrade) | Une case sur l’arbre (shards ou Anchor Fragments selon le module) |
| **Prestige** | Prestige | Couche de progression avancée (**séparée des Cycles**, déblocage futur / dev) |
| **Sauvegarde** / **Continue** | Continue | Progression stockée (éclats, upgrades), pas une run en cours |
| **Nouvelle partie** | New Game | Repartir à zéro (avec confirmation si vraie progression) |

---

## 4. Branches du skill tree

Arbre radial v4 � **4 modules** actifs :

| Mot à utiliser (FR) | Branche (agent) | Thème |
|---------------------|-----------------|--------|
| **Dégâts** | `degats` | **Purge Strike** |
| **Thermique** | `thermique` | **Node-0 Boot**, **Thread Coolant**, **Kill Vent** |
| **Flux** (icône hub) | `flux` | Icône **Node-0 Boot** uniquement |

**Retir� (ancien arbre)** : `attackSpeed`, `purgeAoe`, `shards`, `enemies`.

---

## 5. Gameplay en run (mécaniques)

| Mot à utiliser | Terme UI (EN) | C’est quoi ? | Fichiers / zone (agent) |
|--------------|---------------|--------------|-------------------------|
| **Zone de purge** | Purge zone | Zone sous la souris qui détruit les ennemis | `purgeZone` · `PurgeZoneEngine` |
| **Purge** | Purge | Attaque principale (pas des « projectiles » classiques) | `enemyCombat` · HUD |
| **Overload** (jauge HUD) | Overload | Jauge en bas = Breach en % pendant la run | `HUD` · `breachProgress` |
| **Overclock** | Overclock | Skill actif (Espace / bouton hex HUD), boost temporaire | `overclock` · `OverclockButton` |
| **Flux Drive** | Flux Drive | Toggle ×2 vitesse (si débloqué) | `fluxDrive` · HUD |
| **Vagues** | Wave | Vagues d’ennemis | `WaveEngine` · `waveConfig` |
| **Boss** / **Ancre de brèche** | Breach Anchor | Boss de fin | `wavePhase: boss` |
| **Grille hex arène** |, | Fond hex pendant le combat | `ArenaHexOverlay` |

---

## 6. Interface en run (HUD)

| Élément | Où c’est | Ancre tutoriel (`data-tutorial-anchor`) |
|---------|----------|----------------------------------------|
| Jauge **Overload** | Bas écran | `overload-bar` |
| **Hex Shards** | Badge haut-droite (hub + run), total unique `bankShards`, monte à chaque kill en run | `hex-shards` |
| Bouton **Overclock** | Bas droite | `overclock` |
| **Flux Drive** | HUD | `flux-drive` |
| Indicateur vague / boss | Haut centre | — |

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
| Intro skill tree | `skill_tree_intro` |
| Zone de purge | `purge_zone` |
| Enjeu surcharge | `overload` |
| Éclats hex (run + vault) | `run_shards` |
| Overclock | `overclock` |
| Arbre (achat) | `skill_tree` |
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
| Menus, HUD, skill tree, écrans | `src/ui/` |
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

## 12. Mise à jour de ce document

**Règle :** à chaque **nouvelle feature visible** (écran, bouton, mécanique, branche skill tree, étape tuto), l’agent doit **ajouter ou mettre à jour une ligne dans ce fichier** dans la même tâche.

Si tu inventes un nouveau mot pour quelque chose, dis : *« Ajoute ça au lexique »*, l’agent complétera la section adaptée.

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
| Purge / zone de purge | §5 |
| Réglages | §1 |
| Révélation arbre | §3 |
| Skill tree | §3, §4 |
| ARCH / tutoriel | §7 |
| Vagues / boss | §5 |
