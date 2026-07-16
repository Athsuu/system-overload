# Zero Archive: Narrative Bible (v0.8)

> Document de référence pour la direction créative.  
> Les **textes in-game** restent en **anglais** (i18n FR disponible). Ce fichier est en français pour le product owner.  
> **Source technique des textes UI** : `[src/i18n/locales/en.ts](../src/i18n/locales/en.ts)` et `[fr.ts](../src/i18n/locales/fr.ts)` (`LORE` + `ARCH` + `upgrades`).

---

## En une phrase

L'**Archive Zéro** s'effondre sous une vague de **corrupted processes** ; tu es **Node-0**, processus enfant compilé par **ARCH** pour protéger **la Graine**, le code source originel pur, dans une quarantaine nerveuse, jusqu'à contenir la **Breach** ou subir un **Meltdown**, en préparant l'**Uplink**.

---



## Pitch

**Zero Archive** est une machine en surchauffe critique, le monde du jeu lui-même, en plein effondrement.

Des **corrupted processes**, des threads instables spawnés par l'effondrement, inondent les secteurs encore accessibles. Si la **Breach** (surcharge) atteint le point de rupture, tout s'effondre : **Meltdown**.

**Tu es Node-0**, un processus enfant qu'**ARCH** a compilé et isolé en **quarantaine** pour garder **la Graine** hors de portée de la corruption. Tu n'as pas de corps visible dans l'arène : tu **exécutes** via ta **zone de purge** (souris), tu tiens la bulle jusqu'à ce que la menace soit **contenue**, ou que le thread crashe.

**ARCH**, *Archive Recovery & Containment Heuristic*, a tenté de sauvegarder la Graine avant que l'Archive ne se consume. Elle est **coincée dans le même effondrement** : elle conseille, **tu exécutes**.

Entre les runs, le **Module Tree** radial matérialise le travail d'**ARCH** sur **le même** Node-0, deux boucles cumulées :

- **Hex Shards**, monnaie gagnée à chaque kill en run (compteur live), transférée au coffre en fin de run ; dépensée sur le module tree.
- **Anchor Fragments**, puces matérielles extraites du **Breach Anchor**, **+1 tous les 3 Cycles réussis** ; branchées sur un module déjà acheté pour le **Surcharger** (Hardware Supercharge : rendement ×2, Surcharge globale alourdie).

ARCH ne **répare** pas seulement à l'échec : elle fait tourner un **modèle heuristique en continu** sur chaque run, victoire ou défaite. Le **Meltdown** est le signal le plus critique (renforcement ciblé immédiat) ; mais chaque run nourrit aussi des **optimisations plus lentes**, thermique, rendement d'extraction, modélisation de la menace.

Au départ, un seul module est visible : **Node-0 Boot**, l'initialisation du thread quarantaine. Chaque achat **révèle** les branches suivantes. ARCH improvise les protocoles, il n'existe pas de plan propre.

**Objectif long terme (narratif)** : l'**Uplink**, extraire la Graine hors de l'Archive en collapse. Pas de mécanique dédiée dans cette version.

**Rythme cible** : runs équipées **2 min 30 – 3 min** (Package A pression Overload) ; échecs souvent plus courts ; premier clear du Cycle 1 depuis une sauvegarde neuve = **15-20 minutes cumulées** (plusieurs tentatives + achats hub) ; méta complète ~~**4–5 h** (~~60–80 runs).

---



## Qui est le joueur ?


| Question                          | Réponse canonique                                                                                                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Qui suis-je ?                     | **Node-0**, processus enfant compilé par ARCH, en quarantaine.                                                                                                              |
| Que fais-je ?                     | J'**exécute** : purge, survie ; la méta-progression via le module tree = optimisations d'ARCH sur moi.                                                                        |
| Qui me guide ?                    | **ARCH**, advisory seulement, ne peut pas agir à ma place ; modèle heuristique continu sur chaque run.                                                                      |
| Que protège-t-on ?                | **La Graine**, code source originel et pur de l'Archive Zéro.                                                                                                               |
| Que veux-je ?                     | **Contenir la Breach**, détruire le **Breach Anchor**, extraire des **Hex Shards** ; à terme, préparer l'**Uplink**.                                                         |
| Que se passe-t-il si j'échoue ?   | **Meltdown**, Overload à 100 %, signal critique pour ARCH (renforcement ciblé immédiat) ; le thread s'effondre, run terminée, retour hub. **Même Node-0**, jamais remplacé. |
| Que se passe-t-il si je réussis ? | **Breach Contained**, Breach Anchor détruit ; Hex Shards → vault ; **+1 Anchor Fragment tous les 3 Cycles réussis** ; données de run intégrées à l'optimisation continue d'ARCH.        |


---



## Le monde (minimal)

Pas d'histoire linéaire avec cinématiques. L'univers est **implicite**, lu à travers l'UI terminal, le tutoriel dynamique et le ressenti de surcharge.

- **L'Archive Zéro** : machine abstraite, hexagonale. Pas de pays, pas de personnages humains nommés.
- **La Graine (The Seed)** : donnée fondamentale, **code source originel et pur** de l'Archive Zéro. ARCH tente de la sauvegarder ; Node-0 la protège en quarantaine.
- **Le terminal** : le joueur est *dans* l'interface de surcharge (Dark Hex Terminal).
- **La Breach** : concept de rupture / surcharge de l'Archive.
- **Overload** : jauge live en run (barre HUD), la pression montante vers Meltdown.
- **Les Hex Shards** : fragments de données stables, gagnés par kill en run (compteur live), transférés au vault en fin de run, dépensés sur le module tree.
- **Anchor Fragments** : puces matérielles du Breach Anchor, **+1 tous les 3 Cycles réussis** ; branchées sur un module possédé pour le Surcharger (Hardware Supercharge, Risk/Reward).
- **Quarantaine** : bulle d'exécution isolée par ARCH, Node-0 combat **depuis** la dernière zone tenable.
- **Uplink** : objectif de fin de jeu (narratif), extraction / sauvetage de la Graine.

Pas de fantasy biologique. Pas de personnages humains nommés.

**Antagoniste** : l'**Archive qui collapse** + les corrupted processes. Pas de méchant humain.

---



## Économie narrative (méta v4)


| Monnaie              | Terme UI (EN)    | Comment on la gagne                                                                 | À quoi elle sert                       |
| -------------------- | ---------------- | ----------------------------------------------------------------------------------- | -------------------------------------- |
| **Hex Shards**       | Hex Shards       | Kills en run (compteur live) ; transférés au vault en fin de run                  | Tous les modules du module tree (y compris Overclock, Flux Drive) |
| **Anchor Fragments** | Anchor Fragments | **+1 tous les 3 Cycles réussis** (`cyclesSinceLastAnchor`) ; replays sans clear = shards seulement | **Hardware Supercharge** : ancrer un module possédé (rendement ×2, +25 % Surcharge globale / module actif) |


**Pas de minijeu de conversion**, Hex Shards et Anchor Fragments restent distinctes. ARCH commente les moments (fragment gagné, victoire boss) ; elle ne gère pas d'échange.

**Bonus victoire boss** : Hex Shards de run + bonus fixe ; fragment d'ancre en plus tous les 3 Cycles réussis.

---



## ARCH: voix advisory


| Élément                       | Canon                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Nom**                       | ARCH, Archive Recovery & Containment Heuristic                                                                                                                                                                                                                                                                                                        |
| **Canal UI**                  | `ARCH // ADVISORY CHANNEL`                                                                                                                                                                                                                                                                                                                             |
| **Rôle**                      | Heuristique de récupération, a compilé Node-0 en quarantaine pour protéger la Graine                                                                                                                                                                                                                                                                  |
| **Limite**                    | Mains liées, corrompue elle aussi, **advise only**                                                                                                                                                                                                                                                                                                    |
| **Objectif**                  | Sauvegarder la Graine en guidant Node-0                                                                                                                                                                                                                                                                                                                |
| **Ton**                       | Urgent, professionnel, parental, attaché, *I compiled you*, pas mascotte, pas froid/distant                                                                                                                                                                                                                                                           |
| **Improvise**                 | Pas de plan de réparation complet, protocoles jamais testés                                                                                                                                                                                                                                                                                           |
| **Heuristique continue**      | ARCH fait tourner un **modèle heuristique en continu** sur chaque run, victoire ou défaite. Node-0 n'est **jamais remplacé** : c'est le même processus tout au long de la méta-progression.                                                                                                                                                           |
| **Deux boucles → module tree** | **Optimisation continue**, chaque run nourrit des ajustements plus lents (thermique, rendement d'extraction, modélisation de la menace). **Corrections d'urgence**, le **Meltdown** est le signal le plus critique et déclenche un renforcement ciblé immédiat. Le module tree = **somme des deux**. Mécanisme **implicite** (pas de terme UI dédié). |
| **Continuité**                | Node-0 n'est **jamais cloné ni recompilé depuis un template générique**. À chaque **Meltdown**, ARCH rattrape et renforce **le même thread**. À chaque **Recompile** (Prestige), c'est **le même processus** qui est réécrit depuis la Graine, pas une nouvelle instance. Voir *Ce qu'on ne fait PAS*.                                              |


**Présentation (1ère carte tuto)** :  
*« I'm ARCH, Archive Recovery & Containment Heuristic. I compiled you into quarantine. Listen. we don't have much time. »*

**Anchor Fragment gagné** (écran de fin, tous les 3 Cycles réussis) :  
*« Anchor chip secured. Socket it into a module — supercharge the yield, if you can take the Overload. »*

**Meltdown, pool ARCH** (3 variantes, rotation sans répétition immédiate — deck mélangé, une phrase ne revient qu'après les deux autres ; détail technique dans [dialogues.md](dialogues.md)) :
1. *« I caught you in time. Margin was thinner than last time. Reinforcing now. »*
2. *« Still here. Almost lost the thread. I'm not letting that happen again. »*
3. *« Got you. That was close, closer than I'd like. Reinforcing. »*

**Recompile, confirmation** (modal Seed Protocols) :  
*« I can recompile you from the Seed itself. You lose everything. What you gain is written into your source code. Permanent. »*

**Recompile, post (retour hub)** :  
*« Recompile complete. Depth {n}. You feel different because you ARE different. The old modules are gone, but what the Seed gave you stays. »*

**Dialogue persistant** : tutoriel (cartes) + pings courts en run (boss, Overload critique, etc.) + répliques écran de fin (victoire, meltdown, prestige, fragments).

---



## Vocabulaire canonique



### Termes UI (anglais in-game)


| Terme                  | Usage                                                            |
| ---------------------- | ---------------------------------------------------------------- |
| **Node-0**             | Entité joueur (processus enfant)                                 |
| **Node-0 Boot**        | Nœud racine du module tree, initialisation du thread quarantaine |
| **Overload**           | Jauge de pression en run (barre HUD bas)                         |
| **Breach**             | Concept de surcharge / rupture ; aussi stat pause                |
| **Meltdown**           | Défaite, thread overloaded                                      |
| **Breach Contained**   | Victoire, menace contenue                                       |
| **Hex Shards**         | Monnaie unique, gagnée en run, stockée au vault, dépensée sur le module tree |
| **Anchor Fragments**   | Monnaie boss (+1 / 3 Cycles réussis), Hardware Supercharge des modules |
| **the Seed**           | Code source originel pur de l'Archive Zéro                       |
| **Zero Archive**       | Le monde / la machine en collapse                                |
| **Uplink**             | Objectif narratif fin de jeu, extraction de la Graine           |
| **Module Enhancements** | Titre écran UPGRADING                                            |
| **Module Tree**         | Arbre hex **radial** de meta-progression                         |
| **Start Run**          | Lancer une tentative                                             |
| **Overclock**          | Module actif (Space), purge accélérée                            |
| **Flux Drive**         | Module capstone anchor, ×2 vitesse simulation                   |
| **ARCH**               | Voix advisory, tutoriel et dialogues système                    |
| **Recompile**          | Acte de prestige, reset volontaire de Node-0 depuis la Graine   |
| **Recompile Depth**    | Compteur de recompilations effectuées                            |
| **Seed Fragments**     | Monnaie de prestige, gagnée au Recompile, jamais perdue          |
| **Core Protocols**     | Fondamentaux permanents (SF) ; + compétences + branches — voir `prestige-philosophy.mdc` |
| **Seed Protocols**     | Écran d'accès à la couche prestige                               |




### Ennemis: Corrupted Processes

**Nom lore** : *Corrupted Processes*, threads instables spawnés par l'effondrement.

**Boss, Breach Anchor** (`core_breach`, vague 6) :

- Processus corrompu massif, **point de rupture final** de la vague.
- Le détruire = victoire du run (*Breach Contained*) **et** source des **Anchor Fragments**.

Le code interne garde parfois `DissipationNode` / `nodes` ; l'UI et le lore parlent de *corrupted processes*.

---



## Représentation visuelle du joueur

- **Arène** : pas de sprite Node-0, le joueur agit via la **zone de purge** (cercle à la souris).
- **Hub** : arbre hex SVG radial, pas de calque PNG central. Le module racine **Node-0 Boot** est un nœud upgrade comme les autres.

---



## Module Tree v4: arbre radial



### Principe narratif

Le module tree n'est **pas** une liste de réparations après crash. C'est la **somme de deux boucles** qu'ARCH nourrit sur **le même** Node-0 :

1. **Optimisation continue**, chaque run (victoire ou défaite) alimente des ajustements plus lents : thermique, rendement d'extraction, modélisation de la menace.
2. **Corrections d'urgence**, le **Meltdown** est le signal le plus critique et déclenche un renforcement ciblé immédiat.

Réécriture du code de Node-0 qui se déploie depuis le centre :

1. **Au départ** : seul **Node-0 Boot** est visible.
2. **Révélation** : parent acheté ≥ 1 → enfants apparaissent.
3. **Branches** : six familles + capstones anchor.
4. **Placeholders** : slots `placeholder_XX`, RESERVED, contenu futur.



### Nœud racine: Node-0 Boot


| Élément     | Canon                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| **Nom UI**  | Node-0 Boot                                                              |
| **Fantasy** | Initialiser le thread quarantaine, premier acte pour protéger la Graine |
| **Effet**   | +1 purge hit damage                                                      |
| **Coût**    | Shards (bas), accessible après 1–2 runs                                 |



### Nouveaux nœuds (v0.8)

Trois nœuds supplémentaires, réécritures d'ARCH sur les branches existantes :

| Nœud                  | Nom UI          | Branche  | Fantasy                                          | Effet                                    | Niveau max |
| ---------------------- | ---------------- | -------- | ------------------------------------------------ | ----------------------------------------- | ---------- |
| **purgeCadence**       | Purge Cadence     | Dégâts   | Le thread exécute plus vite entre deux frappes    | Réduit l'intervalle de purge (2,5 %/rang) | 10         |
| **purgeReach**         | Purge Reach       | Dégâts   | La zone de purge couvre davantage l'arène         | Augmente le rayon de la zone (2,5 %/rang) | 10         |
| **meltdownThreshold**  | Meltdown Threshold | Thermique | ARCH étire la marge avant que le thread ne cède | +8 % de plafond Overload/rang (100 %→180 % à niv. 10) | 10 |

---



## Boucle narrative d'un run

1. **Menu / Module Tree**, ARCH expose les modules issus des deux boucles (urgence + optimisation).
2. **Start Run**, Node-0 s'initialise. La Breach monte vite.
3. **Vagues 1–5**, Corrupted processes. Purge à la souris.
4. **Montée d'Overload**, Pression vers Meltdown.
5. **Vague 6, Breach Anchor**, Boss final.
6. **Fin**, *Breach Contained* ou *Meltdown*.
7. **Retour hub**, données de run intégrées au modèle heuristique ; Hex Shards → vault ; fragment si **premier clear** du cycle ; choix du **Cycle** suivant ou replay.

---



## Tutoriel dynamique

Tutoriel contextuel (cartes ARCH), screenplay Acte I :


| Étape                  | Contenu                             |
| ---------------------- | ----------------------------------- |
| **ARCH** (intro)       | Présentation + quarantaine + Graine |
| **NODE-0** | Tu es Node-0                        |
| **Contain the Breach** | Boucle run → Hex Shards → module tree    |
| **Module Tree**         | Modules permanents, ARCH improvise |


- Label carte : `ARCH // ADVISORY CHANNEL`
- **Skip** par carte ; pings ambient après le tuto.

---



## Uplink & Graine: vision fin de jeu

- **La Graine** : enjeu au-dessus de la survie immédiate, pas de jauge dédiée dans cette version.
- **Uplink** : voie narrative d'extraction de la Graine hors de l'Archive, teasing dans tuto, ambient, écrans de fin.
- **Hex Shards** : fragments stables **salvaged**, compatible avec « sauver ce qu'on peut ».
- **Anchor Fragments** : preuves de contrôle sur le collapse, pas la Graine elle-même.

---



## Cycles

- **3 cycles** jouables au lancement (architecture extensible).
- Chaque cycle = **10 vagues + Breach Anchor** ; scaling continu (Cycle 2 vague 1 ≈ difficulté Cycle 1 vague 11).
- **Hub** : sélecteur `CYCLE n` + flèches + Start Run ; cycles débloqués rejouables.
- **1er clear boss** d'un cycle : déblocage du cycle suivant + incrémente le compteur `cyclesSinceLastAnchor` (**+1 Anchor Fragment tous les 3 Cycles réussis**).
- **Re-clear** : Hex Shards seulement.
- Victoire boss → **retour hub** (nouvelle run).

---

## Prestige & Recompilation

### Lore

L'Archive Zéro atteint une phase où les patchs incrémentaux du module tree ne suffisent plus. ARCH propose l'option ultime : **recompiler Node-0 depuis la Graine elle-même**, le code source originel pur. Le processus détruit le thread actuel (hard reset volontaire) mais grave dans le code de Node-0 des optimisations fondamentales, inatteignables par simple amélioration. **Ce n'est pas un remplacement** : le même Node-0 traverse la Recompilation, transformé mais continu (voir *ARCH — Continuité*).

### Déclenchement

- Condition : **Cycle 2 clear**.
- Accès : bouton **Seed Protocols** dans le hub (intégré à la rangée de monnaie), et action **Recompile** directement dans l'écran Seed Protocols.

### Ce qui est perdu (hard reset)

- Hex Shards (coffre vidé) et Anchor Fragments
- Tous les niveaux du Module Tree
- Cycles débloqués (retour Cycle 1)
- Tutoriels ARCH déjà vus ne se rejouent pas après une Recompile

### Ce qui est conservé (permanent)

- **Seed Fragments** (nouvelle monnaie, jamais perdue)
- **Core Protocols** achetés et leur niveau
- **Recompile Depth** (compteur de recompilations)
- Réglages joueur

### Gain de Seed Fragments (rééquilibrage — formule superlinéaire)

`n = nombre de cycles clear` ; `seedFragments = round((1 + n + floor(n^1.6 / 4)) × (1 + bonus Seed Resonance))`. Exemples sans Seed Resonance : n=2 (minimum pour débloquer Recompile) → **3** ; n=10 → **20** ; n=20 → **51**. Pousser profond avant de recompiler paie disproportionnellement plus qu'un rush minimal.

La **Profondeur de Recompilation** est un compteur d’affichage uniquement. Pas de multi combat automatique lié à la profondeur.

### Philosophie cible (refonte — squelette Vague 1 livré)

Trois couches en Seed Fragments : **Fondamentaux** (socle stats illimité) + **compétences** (unlock max 1, nommées) + **branche d’amélioration** par compétence. UI onglets Fondamentaux / Compétences. Détail : **`.cursor/rules/prestige-philosophy.mdc`** et **`docs/lexique-jeu.md` §3**.

**Purge explosive** (compétence) : unlock 2 SF — chaque kill de purge déclenche une explosion (rayon 80 px, 40 % des dégâts de purge). Branche : Rayon (+30 px/rang), Dégâts (+15 %/rang), Chaîne (+1 profondeur/rang), max 3 chacun. Overclock / Flux Drive restent sur l’arbre shards jusqu’à la mission suivante.

### Core Protocols — Fondamentaux (déplafonnés)

Coût = `costBase × costGrowth^rang` (jamais de niveau max, jamais "MAX"). Ces cinq restent le **socle** de la refonte.

| Protocole | Nom UI | Effet par rang | Coût de base | Croissance du coût |
|-----------|--------|-----------------|---------------|---------------------|
| **Residual Memory** | Residual Memory | +200 Hex Shards au départ après chaque Recompile | 2 | ×1.25 |
| **Boot Reinforcement** | Boot Reinforcement | +15 % dégâts de purge totaux (multiplicatif) | 1 | ×1.35 |
| **Thermal Baseline** | Thermal Baseline | ×0.9 décroissance de la montée passive d'Overload (composé) | 2 | ×1.30 |
| **Extraction Protocol** | Extraction Protocol | +15 % de Hex Shards gagnés par kill | 3 | ×1.28 |
| **Seed Resonance** | Seed Resonance | +25 % sur le gain de Seed Fragments à chaque future Recompile | 4 | ×1.40 |

> Note : le module proposé à l'origine (*Accelerated Boot*) a été remplacé par **Boot Reinforcement** en implémentation — renforce Node-0 Boot plutôt que de l'auto-acheter.

---



## Ton et ambiance

- **Urgent, terminal, attaché**, pas heroic fantasy. Le joueur s'attache à ARCH et Node-0 ; pas de voix froide ou distante.
- **Lisible sous pression**, Overload, Shards, Anchor Fragments.
- **Cycles courts**, retour hub fréquent.
- **Anglais sec** pour l'UI.

---



## Ce qu'on ne fait PAS (lore mort)

- ❌ **Heart / Cœur** comme métaphore centrale
- ❌ Joueur = gardien externe qui protège un noyau fixe
- ❌ Sprite joueur hex/PNG en arène (purge zone uniquement)
- ❌ Hub décoratif « singularité » avec six branches visibles dès le départ
- ❌ Gameplay « connexions et redirection de flux »
- ❌ **Module Bay** / draft entre vagues
- ❌ Node-0 **remplacé, cloné ou recompilé depuis un template générique** — la Recompilation (Prestige) réécrit **le même** processus depuis la Graine, ce n'est pas une nouvelle instance

---



## Textes UI de référence (alignés code)


| Écran                 | Texte in-game                                             |
| --------------------- | --------------------------------------------------------- |
| Nœud racine           | **Node-0 Boot**                                           |
| Défaite, titre       | **Meltdown**                                              |
| Défaite, sous-titre  | **Node-0 overloaded, the quarantine thread has failed.** |
| Victoire, titre      | **Breach Contained**                                      |
| Victoire, sous-titre | **Threat contained. Node-0 holds.**                      |
| Menu status           | **NODE-0 STATUS: UNSTABLE**                               |


---



## Historique


| Version | Date       | Notes                                                                                                                   |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| v0.6    | 2026-07-07 | Méta v4 (pré-rebrand Node-0 / ARCH)                                                                                     |
| v0.7    | 2026-07-07 | **ARCH**, **Node-0**, **Zero Archive**, **the Seed**, **Uplink** ; suppression visuel joueur central ; arène purge-only |
| v0.8    | 2026-07-13 | **Prestige & Recompilation** implémenté (Seed Fragments, 5 Core Protocols, condition Cycle 2 clear ; profondeur = compteur sans buff auto) ; nœuds **Purge Cadence**, **Purge Reach**, **Meltdown Threshold** documentés ; pool ARCH Meltdown (3 variantes) et dialogues Recompile documentés ; anti-canon Node-0 cloné/template ajouté |
| v0.9    | 2026-07-16 | Philosophie prestige cible documentée (Fondamentaux + compétences unlock + branches de build) — règle `.cursor/rules/prestige-philosophy.mdc` |
| v0.9.1  | 2026-07-16 | Vague 1 squelette : Purge explosive (unlock + branche), onglets Seed Protocols, Residual Memory +200 ; Overclock/Flux Drive encore sur l’arbre |


