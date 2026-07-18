# Équilibrage Module Tree — Rapport modules shards

> **Date** : juillet 2026  
> **Périmètre** : modules achetables en **éclats** (Hex Shards) uniquement.  
> **Hors scope** : Node-0 Boot (gratuit), Overclock / Flux Drive (Protocoles de la Graine), ancrage / surcharge Hardware Supercharge.

### Correctifs appliqués (vigilance élevée)

| Module | Statut | Détail |
|--------|--------|--------|
| **Frappe de purge** | ✅ Appliqué | Grille **10…50** (total **255**) ; effet +3/rang inchangé |
| **Amplificateur de purge** | ✅ Appliqué | **+7**/rang (max +35) ; grille **50…150** (total **500**) |
| **Kill Vent** | ✅ Appliqué | **−0,3 %** Breach/kill/rang (max −1,5 %) ; prix inchangé |
| **Aimant d'éclats** | ✅ Appliqué | Parent **Node-0** ; grille **5 / 12 / 22** (playtest early) |
| **Récupération d'éclats** | ✅ Appliqué | **+1**/kill, 1 rang, **25** éclats |
| **Flux de menace** | ✅ Appliqué | Grille **35 / 50 / 75** (playtest early) |

---

## Sommaire

1. [Résumé exécutif](#résumé-exécutif)
2. [Méthode et références](#méthode-et-références)
3. [Données de référence](#données-de-référence)
4. [Inventaire des 14 modules](#inventaire-des-14-modules)
5. [Vigilance ÉLEVÉE](#vigilance-élevée)
6. [Vigilance MOYENNE](#vigilance-moyenne)
7. [Vigilance FAIBLE](#vigilance-faible)
8. [Comparaisons clés](#comparaisons-clés)
9. [Meta implicite actuelle](#meta-implicite-actuelle)
10. [Pistes de correction](#pistes-de-correction)
11. [Fichiers sources](#fichiers-sources)

---

## Résumé exécutif

L'arbre de modules présente un **déséquilibre structurel entre branches**, pas un problème global sur tous les modules.

### Problèmes principaux

| # | Problème | Impact joueur |
|---|---------|---------------|
| 1 | **Économie + dégâts early trop rentables** (Récup. éclats, Frappe L1) | Meta naturelle = snowball éclats + one-shot, peu de choix entre branches |
| 2 | **Amplificateur de purge sous-utilité / sur-prix** | Fin de branche dégâts perçue comme inutile ou piège |
| 3 | **Deux grilles de prix coexistent** | Piliers thermiques polis vs dégâts/économie en formule brute (nombres « moches ») |
| 4 | **Flux de menace mal catégorisé** | Branché « économie » mais augmente la difficulté (+spawn) |

### Ce qui va bien

Les **quatre piliers thermiques** (Coolant, Seuil de fusion, Kill Vent, Blindage) sont **globalement cohérents** entre eux après le polish récent (grilles fluides, totaux alignés).

---

## Méthode et références

### Méthode d'analyse

- Lecture du catalogue de coûts et constantes d'effets
- Lecture des effets runtime et de l'arbre de prérequis
- Simulation indicative des revenus par cycle (victoire ~80 kills + bonus boss 25)
- Croisement avec le registre **Pression → Contre** et la règle **psychologie des prix**

### Références (études et docs projet)

| Source | Apport pour l'analyse |
|--------|----------------------|
| **Thomas & Morwitz (2005)** — effet « chiffre de gauche » | Un 1er rang à **5** éclats ancre une perception « presque gratuit » vs **10** ou **25** |
| **Wadhwa & Zhang (2015)** — prix ronds | Nombres fluides = confiance ; 43, 52, 73 nuisent au ressenti même si la maths est correcte |
| **Kim et al. (2022)** — seuils psychologiques | Franchir 100 / 200 / 500 doit être intentionnel, pas accidentel |
| **Pratiques idle / incrémental** | Les multiplicateurs de revenu sont en général les **plus chers** de l'arbre, pas les moins chers |
| **`pricing-psychology.mdc`** | Grille polish obligatoire ; formule brute invalide sans relecture manuelle |
| **`mechanic-counters.mdc`** | Chaque pression a un contre dédié ; Flux de menace n'est pas un « +éclats » pur |
| **`game-design.mdc`** | Boucle nerveuse, montée prévisible, pas de module fourre-tout |

---

## Données de référence

### Revenus indicatifs par victoire

Hypothèse : ~80 kills + **25** éclats bonus boss. **Sans** Récupération d'éclats.

| Cycle | Éclats estimés / victoire |
|-------|---------------------------|
| C1 | ~105 |
| C2 | ~185 |
| C4 | ~345 |
| C8 | ~665 |

Formule de base : `kills × numéro_du_cycle + 25` (boss).

### Coût total maximum

| Métrique | Valeur |
|----------|--------|
| **Total max les 14 modules** | ~**7 170** éclats |
| **Pack thermique max** (Coolant + Seuil + Kill Vent + Blindage) | ~**1 415** éclats |
| **Branche dégâts seule max** (Frappe → Latence) | ~**3 700+** éclats |

### Stats de base run (sans modules)

| Stat | Valeur |
|------|--------|
| Dégâts purge | 5 |
| Intervalle purge | 1 000 ms |
| Rayon purge | 72 px |
| Chaleur passive | 2,8 / s |
| Cap Breach (base) | 100 |
| Chance crit (base) | 8 % (×2) |

---

## Inventaire des 14 modules

| Module | ID technique | Branche | Max rangs | Coût L1 | Coût total max |
|--------|--------------|---------|-----------|---------|----------------|
| Récupération d'éclats | `shardSalvage` | Économie | 5 | 5 | **34** |
| Flux de menace | `victoryShardBonus` | Économie | 3 | 100 | **560** |
| Aimant d'éclats | `shardMagnet` | Économie | 3 | 130 | **700** |
| Frappe de purge | `purgeStrike` | Dégâts | 10 | 5 | **121** |
| Cadence de purge | `purgeCadence` | Dégâts | 10 | 10 | **292** |
| Portée de purge | `purgeReach` | Dégâts | 10 | 10 | **292** |
| Éclat de purge (Splash) | `purgeSplash` | Dégâts | 3 | 150 | **800** |
| Critique de purge | `purgeCrit` | Dégâts | 5 | 25 | **196** |
| Amplificateur de purge | `purgeAmplifier` | Dégâts | 5 | 200 | **2 000** |
| Injection de latence | `latencyInjection` | Dégâts | 3 | 140 | **760** |
| Coolant de thread | `threadCoolant` | Thermique | 10 | 10 | **255** |
| Kill Vent | `killBreachRelief` | Thermique | 5 | 25 | **255** |
| Seuil de fusion | `meltdownThreshold` | Thermique | 10 | 10 | **255** |
| Blindage de quarantaine | `leakSealing` | Thermique | 5 | 75 | **650** |

### Grilles de prix : polies vs brutes

| Type | Modules concernés | Exemple de rangs |
|------|-------------------|------------------|
| **Polies** (manuel) | Coolant, Seuil, Kill Vent, Blindage, Splash, Amplificateur, Aimant, Flux, Latence | 10, 12, 15, 18… / 75, 100, 125… |
| **Brutes** (formule `ceil(base × growth^n)`) | Frappe, Cadence, Portée, Critique, Récup. | 5, 6, 7, 9… / 10, 13, 15, 19… / 5, 6, 7, 8… |

---

## Vigilance ÉLEVÉE

Modules où l'écart **puissance / prix** ou l'impact **meta** pose un risque fort pour l'expérience.

---

### Récupération d'éclats (`shardSalvage`)

| | |
|---|---|
| **Coût** | L1 : **5** · Total max : **34** |
| **Effet** | +25 % rendement éclats / rang → **+125 %** au rang 5 |
| **Contre officiel** | Friction loot / rendement éclats (`mechanic-counters`) |

**Problème**

- Module **le moins cher** de tout l'arbre alors qu'il **multiplie la monnaie**.
- ROI du pack complet : rentabilisé en environ **1,3 victoire C1** (34 éclats pour +125 % sur ~105 éclats/run).
- En design idle, ce type de bonus est habituellement **le plus taxé**, pas le moins cher.

**Vigilance** : **ÉLEVÉE** — snowball économique.

---

### Frappe de purge (`purgeStrike`)

| | |
|---|---|
| **Coût** | L1 : **5** · Total max : **121** |
| **Effet** | +3 dégâts flat / rang → **+30** au rang 10 |
| **Contre officiel** | PV ennemis (`mechanic-counters`) |

**Problème**

- **L1 = 5 éclats pour +60 % DPS** (5 → 8 dégâts) : meilleur rapport puissance/prix du jeu.
- Coût par point de dégât au max : ≈ **4 éclats/pt**.
- Grille brute (5, 6, 7, 9…) non alignée avec `pricing-psychology`.

**Vigilance** : **ÉLEVÉE** — achat early quasi obligatoire, déséquilibre vs reste de la branche.

---

### Amplificateur de purge (`purgeAmplifier`)

| | |
|---|---|
| **Coût** | L1 : **200** · Total max : **2 000** |
| **Effet** | +5 dégâts flat / rang → **+25** au rang 5 |
| **Prérequis** | Cadence L1 + Portée L1 (min. **+20** éclats avant L1) |
| **Contre officiel** | PV ennemis (même famille que Frappe) |

**Problème**

- **×20 plus cher par point de dégât** que la Frappe (≈ 80 vs ≈ 4 éclats/pt).
- Total max **2 000** pour **moins de dégâts** que la Frappe max (+25 vs +30).
- Risque : le joueur perçoit la fin de branche dégâts comme **inutile** ou **piège**.

**Vigilance** : **ÉLEVÉE** — incohérence majeure avec la Frappe.

---

### Kill Vent (`killBreachRelief`)

| | |
|---|---|
| **Coût** | L1 : **25** · Total max : **255** |
| **Effet** | −0,5 pt jauge Breach / kill / rang → **−2,5** au rang 5 |
| **Contre officiel** | Jauge Overload (pack thermique composite) |

**Problème**

- **Très forte utilité** pour le prix : rang 1 seul ≈ **−40 % de jauge** sur une run à 80 kills (40 pts sur cap 100).
- Récompense l'agressivité (beaucoup de kills) **sans contrepartie directe** (spawn, DPS).
- Peut **trivialiser** la pression Overload en mid-game.

**Vigilance** : **ÉLEVÉE** — rapport effet/prix trop favorable.

---

## Vigilance MOYENNE

Modules corrects ou intéressants, mais avec frictions (prix, timing, clarté, niche).

---

### Cadence de purge (`purgeCadence`)

| | |
|---|---|
| **Coût** | L1 : **10** · Total max : **292** |
| **Effet** | −25 ms intervalle / rang → **−250 ms** au rang 10 (≈ **+33 %** cadence) |

**Points d'attention**

- Puissance correcte mais **grille brute** (10, 13, 15, 19, 23…) — viole `pricing-psychology`.
- Moins attractif que Frappe au même budget early.

**Vigilance** : **MOYENNE**

---

### Portée de purge (`purgeReach`)

| | |
|---|---|
| **Coût** | L1 : **10** · Total max : **292** |
| **Effet** | +2,5 % rayon AOE / rang → **+25 %** au rang 10 |

**Points d'attention**

- Même grille brute que Cadence.
- Valeur surtout visible avec **Éclat de purge** et riposte thermique AOE.
- **Valeur invisible** pour un débutant.

**Vigilance** : **MOYENNE**

---

### Critique de purge (`purgeCrit`)

| | |
|---|---|
| **Coût** | L1 : **25** · Total max : **196** |
| **Effet** | +2 % chance crit absolue / rang → **8 % → 18 %** (multi ×2 inchangé) |

**Points d'attention**

- ≈ **+18 % DPS espéré** au max pour ~2× le coût total de Frappe → module **secondaire**, pas cassé.
- 1er rang à **25** = seuil psychologique plus dur (effet chiffre de gauche).

**Vigilance** : **MOYENNE**

---

### Éclat de purge / Splash (`purgeSplash`)

| | |
|---|---|
| **Coût** | L1 : **150** · Total max : **800** |
| **Effet** | Extension rayon + dégâts splash : L3 = **+140 %** rayon, **100 %** dmg splash |
| **Prérequis** | Portée L1 |

**Points d'attention**

- Fort **si** Portée + DPS déjà en place ; sinon cher pour peu de gain ressenti.
- Chaque cible AOE = **une riposte thermique** → double tranchant (DPS + chaleur).
- Grille manuelle OK ; **timing tardif** dans la progression.

**Vigilance** : **MOYENNE**

---

### Flux de menace (`victoryShardBonus`)

| | |
|---|---|
| **Coût** | L1 : **100** · Total max : **560** |
| **Effet** | +50 % spawn rate & maxAlive / rang → **+150 %** au rang 3 |
| **ID legacy** | `victoryShardBonus` (ex-Prime victoire) |

**Points d'attention**

- **Risk/reward** : plus d'ennemis = plus de kills/éclats **et** plus de chaleur.
- **Pas un contre dédié** au soft-block inter-cycle (`mechanic-counters`).
- Branché côté **économie** : le joueur peut l'acheter en croyant que c'est un « +éclats » pur.

**Vigilance** : **MOYENNE** — clarté rôle + positionnement branche.

---

### Injection de latence (`latencyInjection`)

| | |
|---|---|
| **Coût** | L1 : **140** · Total max : **760** |
| **Effet** | −10 % vitesse ennemie / rang **sous la zone de purge** → **−30 %** au rang 3 |
| **Prérequis** | Amplificateur L1 |

**Points d'attention**

- Contre vitesse **partiel** uniquement (GAP vitesse globale documenté dans `mechanic-counters`).
- Chaîne d'arbre profonde → souvent acheté **trop tard** ou **jamais**.
- Cher pour un effet situé et niche.

**Vigilance** : **MOYENNE**

---

### Aimant d'éclats (`shardMagnet`)

| | |
|---|---|
| **Coût** | L1 : **130** · Total max : **700** |
| **Effet** | QoL : rayon collecte + aspiration magnétique (pas de puissance combat) |
| **Prérequis** | Récup. L1 |

**Points d'attention**

- **Zéro impact combat** ; **700** éclats = taxe confort élevée.
- Acceptable en fin de meta si le joueur a déjà snowballé via Récup.

**Vigilance** : **MOYENNE**

---

### Blindage de quarantaine (`leakSealing`)

| | |
|---|---|
| **Coût** | L1 : **75** · Total max : **650** |
| **Effet** | +3 blindage / rang → score 15 au rang 5 (~**−60 %** riposte via formule `brut × (10 / (10 + blindage))`) |
| **Contre officiel** | Surcharge au hit (`mechanic-counters`) |

**Points d'attention**

- Ticket L1 à **75** volontairement haut — cohérent avec la philosophie « engagement tardif ».
- **L1 seul faible** (~−23 % riposte) : risque que le joueur croie que « ça ne sert à rien » avant L3+.
- Problème surtout **pédagogique**, pas mathématique.

**Vigilance** : **MOYENNE**

---

## Vigilance FAIBLE

Modules alignés avec leur rôle et leur grille de prix.

---

### Coolant de thread (`threadCoolant`)

| | |
|---|---|
| **Coût** | L1 : **10** · Total max : **255** |
| **Effet** | −0,10 chaleur passive / s / rang → **2,8 → 1,8** / s au rang 10 (plancher) |
| **Contre officiel** | Chaleur passive |

**Commentaire** : Grille polie. Rôle clair. Aligné pack Overload.

**Vigilance** : **FAIBLE**

---

### Seuil de fusion (`meltdownThreshold`)

| | |
|---|---|
| **Coût** | L1 : **10** · Total max : **255** |
| **Effet** | +8 % cap Breach / rang → cap **100 → 180** au rang 10 |
| **Contre officiel** | Jauge Overload (pack composite) |

**Commentaire** : Même famille visuelle que Coolant. Complémentaire Kill Vent / Blindage.

**Vigilance** : **FAIBLE**

---

### Node-0 Boot (`node0Boot`)

| | |
|---|---|
| **Coût** | Gratuit (baseline niveau 1) |
| **Effet** | 5 dégâts purge de départ |

**Commentaire** : Point d'entrée correct. Pas de sujet prix.

**Vigilance** : **FAIBLE** (hors périmètre achat, référence seulement)

---

## Comparaisons clés

### Puissance par éclat

| Indicateur | Valeur | Lecture |
|----------|--------|---------|
| Coût par +1 dmg flat — Frappe max | ≈ **4** éclats/pt | Référence « bon plan » de la branche dégâts |
| Coût par +1 dmg flat — Amplificateur max | ≈ **80** éclats/pt | **×20** vs Frappe — incohérence majeure |
| Frappe L1 | **5** éclats, **+60 %** DPS | Meilleur achat du jeu au rapport puissance/prix |
| Récup. L5 | **34** éclats, **+125 %** revenus | Rentabilisé en ~1 run C1 |
| Kill Vent L1 sur 80 kills | **−40** pts jauge (cap 100) | Très fort pour **25** éclats |

### Budgets par famille

| Famille | Modules | Coût total max |
|---------|---------|----------------|
| Pack thermique | Coolant + Seuil + Kill Vent + Blindage | **~1 415** |
| Économie | Récup. + Flux + Aimant | **~1 294** |
| Dégâts (core) | Frappe + Cadence + Portée + Crit | **~901** |
| Dégâts (profond) | Splash + Amplificateur + Latence | **~3 560** |

---

## Meta implicite actuelle

Progression naturelle observée avec l'équilibrage actuel :

```
Run C1
  → Frappe L1 (5 éclats)
  → Récupération d'éclats (snowball)
  → Pack thermique (Coolant / Seuil / Kill Vent — 255 chacun)
  → Branche dégâts profonde ?
       ├─ Oui → Splash / Critique (fort si build AOE)
       └─ Rare → Amplificateur (mauvais ROI, souvent ignoré)
```

**Conséquence** : la branche dégâts raconte **deux histoires contradictoires** — cheap et puissant au début (Frappe), cher et faible à la fin (Amplificateur).

---

## Pistes de correction

> **Non appliquées** — propositions pour validation PO, par ordre d'impact estimé.

| Priorité | Module(s) | Piste |
|----------|-----------|-------|
| 1 | **Récupération d'éclats** | Monter L1 (ex. 10–15) et/ou adoucir le % par rang. Objectif : revenu = investissement long, pas snowball immédiat. |
| 2 | **Frappe de purge** | Monter L1–L3 et/ou adoucir +dmg early. Réserver le « polish » sur les rangs hauts. |
| 3 | **Amplificateur de purge** | Baisser fortement la grille (ex. total 800–1 200) **ou** augmenter +dmg/rang **ou** fusionner partiellement avec Frappe en fin d'arbre. |
| 4 | **Kill Vent** | Réduire 0,5 → 0,3 par rang **ou** plafonner l'effet cumulé par run. |
| 5 | **Grilles brutes** | Appliquer la même passe manuelle que Coolant/Seuil sur Frappe, Cadence, Portée, Critique, Récup. |
| 6 | **Flux de menace** | Clarifier en UI : « +spawn, +pression, +kills » — pas un module économie pur. |

### Principe directeur

Traiter **Frappe ↔ Amplificateur** et **Récup.** **avant** de retoucher les piliers thermiques (déjà polishés).

---

## Fichiers sources

| Fichier | Contenu pertinent |
|---------|-------------------|
| `src/store/upgradeCatalog.ts` | Coûts, constantes d'effets, grilles |
| `src/store/moduleTree.ts` | Arbre, prérequis, branches |
| `src/game/moduleEffects.ts` | Effets runtime, `RUN_STAT_BASE`, registre |
| `src/game/runConfig.ts` | Riposte thermique, breach, rewards |
| `src/game/cycleScaling.ts` | Éclats / kill par cycle |
| `.cursor/rules/pricing-psychology.mdc` | Règles nombres agréables |
| `.cursor/rules/mechanic-counters.mdc` | Registre Pression → Contre |

---

## Annexe — Registre Pression → Contre (modules seuls)

| Pression | Contre module tree | Statut |
|----------|-------------------|--------|
| Surcharge au hit | Blindage de quarantaine | OK |
| PV ennemis | Frappe, Amplificateur, Critique, Splash, Portée… | OK |
| Chaleur passive | Coolant de thread | OK |
| Jauge Overload | Pack Coolant + Kill Vent + Seuil + Blindage | OK |
| Vitesse ennemie | Latence (sous zone seulement) | GAP partiel |
| Densité / spawn horde | Aucun dédié | GAP / by-design |
| Friction loot | Aimant d'éclats | OK |
| Rendement éclats | Récupération d'éclats | OK (prix à revoir) |

**Note** : Flux de menace **augmente** la densité spawn — ce n'est pas un « contre » documenté, c'est du risk/reward.

---

*Document généré à partir de l'audit équilibrage Module Tree — modules shards uniquement.*
