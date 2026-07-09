# Zero Archive: Narrative Bible (v0.7)

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
- **Anchor Fragments**, données d'ancrage extraites **uniquement** en tuant le **Breach Anchor** (boss) ; débloquent les modules **capstone**.

ARCH ne **répare** pas seulement à l'échec : elle fait tourner un **modèle heuristique en continu** sur chaque run, victoire ou défaite. Le **Meltdown** est le signal le plus critique (renforcement ciblé immédiat) ; mais chaque run nourrit aussi des **optimisations plus lentes**, thermique, rendement d'extraction, modélisation de la menace.

Au départ, un seul module est visible : **Node-0 Boot**, l'initialisation du thread quarantaine. Chaque achat **révèle** les branches suivantes. ARCH improvise les protocoles, il n'existe pas de plan propre.

**Objectif long terme (narratif)** : l'**Uplink**, extraire la Graine hors de l'Archive en collapse. Pas de mécanique dédiée dans cette version.

**Rythme cible** : runs ≤ **4 minutes** (échecs souvent 1,5–3 min) ; méta complète ~~**4–5 h** (~~60–80 runs).

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
| Que se passe-t-il si je réussis ? | **Breach Contained**, Breach Anchor détruit ; Hex Shards → vault ; **+1 Anchor Fragment** (boss uniquement) ; données de run intégrées à l'optimisation continue d'ARCH.        |


---



## Le monde (minimal)

Pas d'histoire linéaire avec cinématiques. L'univers est **implicite**, lu à travers l'UI terminal, le tutoriel dynamique et le ressenti de surcharge.

- **L'Archive Zéro** : machine abstraite, hexagonale. Pas de pays, pas de personnages humains nommés.
- **La Graine (The Seed)** : donnée fondamentale, **code source originel et pur** de l'Archive Zéro. ARCH tente de la sauvegarder ; Node-0 la protège en quarantaine.
- **Le terminal** : le joueur est *dans* l'interface de surcharge (Dark Hex Terminal).
- **La Breach** : concept de rupture / surcharge de l'Archive.
- **Overload** : jauge live en run (barre HUD), la pression montante vers Meltdown.
- **Les Hex Shards** : fragments de données stables, gagnés par kill en run (compteur live), transférés au vault en fin de run, dépensés sur le module tree.
- **Anchor Fragments** : données d'ancrage du Breach Anchor, **+1 au premier clear boss de chaque Cycle** (replays du même cycle = shards uniquement).
- **Quarantaine** : bulle d'exécution isolée par ARCH, Node-0 combat **depuis** la dernière zone tenable.
- **Uplink** : objectif de fin de jeu (narratif), extraction / sauvetage de la Graine.

Pas de fantasy biologique. Pas de personnages humains nommés.

**Antagoniste** : l'**Archive qui collapse** + les corrupted processes. Pas de méchant humain.

---



## Économie narrative (méta v4)


| Monnaie              | Terme UI (EN)    | Comment on la gagne                                                                 | À quoi elle sert                       |
| -------------------- | ---------------- | ----------------------------------------------------------------------------------- | -------------------------------------- |
| **Hex Shards**       | Hex Shards       | Kills en run (compteur live) ; transférés au vault en fin de run                  | Presque tous les modules du module tree |
| **Anchor Fragments** | Anchor Fragments | **Premier clear boss par Cycle** (+1) ; replays = shards seulement                           | Modules **capstone** marqués anchor      |


**Pas de minijeu de conversion**, Hex Shards et Anchor Fragments restent distinctes. ARCH commente les moments (premier fragment, victoire boss) ; elle ne gère pas d'échange.

**Bonus victoire boss** : Hex Shards de run + bonus fixe ; fragment d'ancre en plus.

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


**Présentation (1ère carte tuto)** :  
*« I'm ARCH, Archive Recovery & Containment Heuristic. I compiled you into quarantine. Listen. we don't have much time. »*

**Premier Anchor Fragment** (écran de fin, une seule fois) :  
*« Anchor data secured. Capstone modules are online. spend fragments on the marked nodes. »*

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
| **Anchor Fragments**   | Monnaie boss, modules capstone                                  |
| **the Seed**           | Code source originel pur de l'Archive Zéro                       |
| **Zero Archive**       | Le monde / la machine en collapse                                |
| **Uplink**             | Objectif narratif fin de jeu, extraction de la Graine           |
| **Module Enhancements** | Titre écran UPGRADING                                            |
| **Module Tree**         | Arbre hex **radial** de meta-progression                         |
| **Start Run**          | Lancer une tentative                                             |
| **Overclock**          | Module actif (Space), purge accélérée                            |
| **Flux Drive**         | Module capstone anchor, ×2 vitesse simulation                   |
| **ARCH**               | Voix advisory, tutoriel et dialogues système                    |




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
- **1er clear boss** d'un cycle : +1 Anchor Fragment + déblocage du cycle suivant.
- **Re-clear** : Hex Shards seulement.
- Victoire boss → **retour hub** (nouvelle run).

---

## Prestige

**Découplé des Cycles** pour cette version. Couche de reconfiguration profonde (reset partiel, bonus permanents), déblocage **manuel / futur** — plus lié automatiquement au boss.

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


