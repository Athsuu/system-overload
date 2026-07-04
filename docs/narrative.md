# System Overload — Narrative Bible (v0.1)

> Document de référence pour la direction créative.  
> Les **textes in-game** restent en **anglais**. Ce fichier est en français pour le product owner.  
> Statut : **brouillon** — à peaufiner.

---

## En une phrase

Un système informatique s'effondre ; tu es le **Kernel**, dernier noyau stable, et tu dois survivre aux vagues de processus corrompus sans provoquer un **Meltdown**.

---

## Pitch

**System Overload** se déroule à l'intérieur d'un système en surchauffe critique.

Des entités corrompues — des **overflows**, des processus qui ne devraient plus exister — convergent vers le centre. Si la **Breach** (niveau de surcharge) atteint le point de rupture, tout s'effondre : **Meltdown**.

Tu n'es pas un opérateur derrière un écran qui « protège » quelque chose de l'extérieur. **Tu es le Kernel** : le cœur logique du système, encore debout. Tu te déplaces, tu ripostes, tu tiens la ligne jusqu'à ce que la menace soit **contenue** — ou que tu craches.

Entre les runs, tu dépenses des **Hex Shards** (éclats hexagonaux récupérés en neutralisant des processus corrompus) pour **reconfigurer** le Kernel via le skill tree : plus de pression, meilleur refroidissement, cadence de tir, etc.

---

## Qui est le joueur ?

| Question | Réponse canonique |
|----------|-------------------|
| Qui suis-je ? | Le **Kernel** — le dernier processus central encore stable. |
| Que fais-je ? | Je **survis** aux vagues, je **tire** sur les menaces, je **gère la Breach**. |
| Que veux-je ? | **Contenir la surcharge** et extraire un maximum de Hex Shards avant le crash ou la victoire. |
| Que se passe-t-il si j'échoue ? | **Meltdown** — le Kernel devient critique, le run s'arrête. |
| Que se passe-t-il si je réussis ? | **Breach Contained** — la vague (ou le boss) est neutralisée, les Shards sont transférés au vault. |

---

## Le monde (minimal)

On ne raconte pas une histoire linéaire avec des cinématiques. L'univers est **implicite**, lu à travers l'UI terminal et le ressenti de surcharge.

- **Le système** : une machine abstraite, froide, hexagonale. Pas de pays, pas de personnages humains nommés.
- **Le terminal** : le joueur est *dans* l'interface de surcharge (Dark Hex Terminal), pas devant une app propre.
- **La Breach** : la chaleur / la surcharge qui monte quand le Kernel subit des impacts, rate des tirs, ou encaisse trop longtemps.
- **Les Hex Shards** : éclats hexagonaux récupérés après un run — monnaie de progression permanente (vault entre les runs).

Pas de fantasy biologique (cœur, sang, organes). Tout est **système, chaleur, surcharge, processus**.

---

## Vocabulaire canonique

### Termes UI (anglais in-game)

| Terme | Usage |
|-------|--------|
| **Kernel** | Entité joueur ; centre du skill tree |
| **Breach** | Jauge de surcharge (HUD) |
| **Meltdown** | Écran de défaite |
| **Breach Contained** | Écran de victoire (vague / boss) |
| **Hex Shards** | Monnaie (Run Shards en run, vault après) |
| **Skill Tree** | Hub de meta-progression entre les runs |
| **Start Run** | Lancer une tentative |

### Ennemis (à trancher plus tard)

**Option A — technique (actuel code)** : *Dissipation Nodes*  
**Option B — lore** : *Corrupted processes* / *Overflow entities*

Pour l'instant, le code parle de « nodes » et « dissipation ». Le lore peut les décrire comme des **fragments de processus corrompus** attirés par le Kernel.

### Branches du skill tree (modules du Kernel)

| Branche (code) | Lecture narrative |
|----------------|-------------------|
| Pressure | Capacité à encaisser / étaler la pression entrante |
| Thermique | Refroidissement, seuils critiques, stabilité |
| Flux | Débit, throttle, contrôle des émissions |
| Dégâts | Puissance de neutralisation |
| Cadence | Vitesse de riposte |

Le nœud central du tree = **KERNEL** — le hub depuis lequel partent tous les modules.

---

## Boucle narrative d'un run

1. **Start Run** — Le Kernel s'initialise dans l'arène. Le système est déjà instable.
2. **Vagues** — Des processus corrompus spawnent et convergent. Le joueur se déplace et tire.
3. **Montée de Breach** — Chaque erreur (impact, tir raté, chaleur passive) rapproche le Meltdown.
4. **Draft** (entre vagues) — Choix tactiques rapides : micro-reconfigurations mid-run.
5. **Fin** — Victoire (*Breach Contained*) ou défaite (*Meltdown — Kernel critical*).
6. **Retour hub** — Shards transférés au vault ; upgrades permanents au skill tree.

---

## Ton et ambiance

- **Froid, urgent, terminal** — pas heroic fantasy, pas horror gore.
- **Lisible sous pression** — le joueur doit comprendre Breach et Shards en un coup d'œil.
- **Surcharge progressive** — plus la Breach monte, plus l'ambiance visuelle (pulse, rouge, glow) doit stresser.
- **Anglais sec** pour l'UI : court, impératif, style système (`Meltdown`, `Breach Contained`, pas de prose longue).

---

## Ce qu'on ne fait PAS (lore mort)

- ❌ **Heart / Cœur** comme métaphore centrale
- ❌ Joueur = gardien externe qui protège un noyau fixe
- ❌ Gameplay « connexions et redirection de flux » (ancienne vision)
- ❌ Lore explicite lourd (dialogues, quêtes, cinématiques longues) — sauf décision future du PO

---

## Textes UI de référence (cibles)

| Écran | Texte cible |
|-------|-------------|
| Skill tree (centre) | **KERNEL** |
| Défaite — titre | **Meltdown** |
| Défaite — sous-titre | **Kernel critical — system failed** |
| Victoire — titre | **Breach Contained** |
| Shards gagnés | **+X Shards** / **Transferred to vault** |

*(Certains écrans utilisent encore « HEART » ou « Core heat critical » — migration à faire.)*

---

## Questions ouvertes (à peaufiner)

1. **Nom public des ennemis** : garder *Dissipation Nodes* ou passer à *Corrupted processes* partout ?
2. **Y a-t-il une entité antagoniste** (IA, virus, admin) ou seulement « le système qui collapse » ?
3. **Prestige** : quel récit pour la reset permanente (fragments de Kernel, recompilation, etc.) ?
4. **Boss** : représentent-ils quoi narrativement (purge finale, fragment maître, seuil de breach incarné) ?
5. **Overclock** (skill actif) : surchauffe volontaire du Kernel — texte UI à définir.

---

## Historique

| Version | Date | Notes |
|---------|------|-------|
| v0.1 | 2026-07-05 | Première rédaction — pivot Heart → Kernel, aligné gameplay arena survivor |
| v0.2 | 2026-07-05 | Rebrand monnaie TFLOPS → Hex Shards (vault, Run Shards) |
