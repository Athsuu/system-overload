# Suivi équilibrage — session du 18/07/2026 03:02:22

Enregistrement : **ON** · 20 run(s) · 646 shards

| # | Cycle | Résultat | Kills | Durée | Shards run | Shards Σ | Δ build | Source surcharge | Passive | Hit | Build |
|---|------:|----------|------:|------:|-----------:|---------:|---------|------------------|--------:|----:|-------|
| 1 | 1 | Meltdown | 6 | 00:24 | 5 | 5 | +Node-0 Boot L1 | passive | 67.6% | 32.4% | Node-0 Boot L1 |
| 2 | 1 | Meltdown | 5 | 00:24 | 5 | 10 | +Shard Magnet L1 | passive | 69% | 31% | Node-0 Boot L1, Shard Magnet L1 |
| 3 | 1 | Meltdown | 6 | 00:23 | 6 | 16 | — | passive | 66.2% | 33.8% | Node-0 Boot L1, Shard Magnet L1 |
| 4 | 1 | Meltdown | 8 | 00:23 | 8 | 24 | +Purge Strike L1 | passive | 66.2% | 33.8% | Purge Strike L1, Node-0 Boot L1, Shard Magnet L1 |
| 5 | 1 | Meltdown | 7 | 00:23 | 7 | 31 | — | passive | 66.3% | 33.7% | Purge Strike L1, Node-0 Boot L1, Shard Magnet L1 |
| 6 | 1 | Meltdown | 8 | 00:23 | 8 | 39 | — | passive | 64.8% | 35.2% | Purge Strike L1, Node-0 Boot L1, Shard Magnet L1 |
| 7 | 1 | Meltdown | 12 | 00:24 | 12 | 51 | Purge Strike L1→L2 | passive | 69% | 31% | Purge Strike L2, Node-0 Boot L1, Shard Magnet L1 |
| 8 | 1 | Meltdown | 12 | 00:23 | 12 | 63 | Purge Strike L2→L3 | passive | 66.2% | 33.8% | Purge Strike L3, Node-0 Boot L1, Shard Magnet L1 |
| 9 | 1 | Meltdown | 12 | 00:23 | 12 | 75 | Purge Strike L3→L4 | passive | 65.4% | 34.6% | Purge Strike L4, Node-0 Boot L1, Shard Magnet L1 |
| 10 | 1 | Meltdown | 12 | 00:24 | 12 | 87 | — | passive | 67.6% | 32.4% | Purge Strike L4, Node-0 Boot L1, Shard Magnet L1 |
| 11 | 1 | Meltdown | 20 | 00:25 | 19 | 106 | Purge Strike L4→L5 | passive | 71.9% | 28.1% | Purge Strike L5, Node-0 Boot L1, Shard Magnet L1 |
| 12 | 1 | Meltdown | 18 | 00:26 | 36 | 142 | +Shard Salvage L1 | passive | 74.7% | 25.3% | Purge Strike L5, Node-0 Boot L1, Shard Magnet L1, Shard Salvage L1 |
| 13 | 1 | Meltdown | 20 | 00:25 | 40 | 182 | +Threat Feed L1 | passive | 71.9% | 28.1% | Purge Strike L5, Node-0 Boot L1, Shard Magnet L1, Shard Salvage L1, Threat Feed L1 |
| 14 | 1 | Meltdown | 21 | 00:24 | 41 | 223 | — | passive | 69.2% | 30.8% | Purge Strike L5, Node-0 Boot L1, Shard Magnet L1, Shard Salvage L1, Threat Feed L1 |
| 15 | 1 | Meltdown | 23 | 00:29 | 46 | 269 | +Thread Coolant L5 | passive | 67.6% | 32.4% | Purge Strike L5, Node-0 Boot L1, Shard Magnet L1, Shard Salvage L1, Thread Coolant L5, Threat Feed L1 |
| 16 | 1 | Meltdown | 27 | 00:30 | 54 | 323 | +Kill Vent L1 | passive | 64% | 36% | Purge Strike L5, Kill Vent L1, Node-0 Boot L1, Shard Magnet L1, Shard Salvage L1, Thread Coolant L5, Threat Feed L1 |
| 17 | 1 | Meltdown | 32 | 00:34 | 62 | 385 | +Meltdown Threshold L3, −Kill Vent L1 | passive | 63.7% | 36.3% | Purge Strike L5, Meltdown Threshold L3, Node-0 Boot L1, Shard Magnet L1, Shard Salvage L1, Thread Coolant L5, Threat Feed L1 |
| 18 | 1 | Meltdown | 34 | 00:37 | 67 | 452 | +Quarantine Plating L1 | passive | 70.3% | 29.7% | Purge Strike L5, Meltdown Threshold L3, Node-0 Boot L1, Quarantine Plating L1, Shard Magnet L1, Shard Salvage L1, Thread Coolant L5, Threat Feed L1 |
| 19 | 1 | Meltdown | 42 | 00:44 | 84 | 536 | Meltdown Threshold L3→L6 | passive | 68.6% | 31.4% | Purge Strike L5, Meltdown Threshold L6, Node-0 Boot L1, Quarantine Plating L1, Shard Magnet L1, Shard Salvage L1, Thread Coolant L5, Threat Feed L1 |
| 20 | 1 | Meltdown | 55 | 00:52 | 110 | 646 | +Kill Vent L2 | passive | 67.1% | 32.9% | Purge Strike L5, Kill Vent L2, Meltdown Threshold L6, Node-0 Boot L1, Quarantine Plating L1, Shard Magnet L1, Shard Salvage L1, Thread Coolant L5, Threat Feed L1 |

Total session : 20 runs · 646 shards

## Dernière runs enregistrées (19–20)

| Run | Kills | Durée | Shards | Δ build |
|-----|------:|------|-------:|---------|
| 19 | **42** | 0:44 | **84** | Seuil **L3→L6** (63 éclats) |
| 20 | **55** | 0:52 | **110** | **Kill Vent L2** (60 éclats cumulés) |

---

## Notes équilibrage (runs 12–20)

### Run 12 — Récupération
- **Récup. L1 (25)** après run 11 (~26 en banque) — timing prévu ✓
- **18 kills → 36 éclats** = **2/kill** (base + flat) — effet conforme

### Run 13 — Flux de menace
- **Flux L1 (35)** acheté après run 12 (~37 en banque) — timing prévu ✓
- **20 kills → 40 éclats** — toujours **2/kill** avec Récup.
- Branche économie **complète** (Aimant → Récup. → Flux) en **13 runs**

### Run 14 — avec Flux actif
- **21 kills / 41 éclats** (+1 kill vs run 13, +50 % spawn Flux)
- Gain modeste : le Flux **ne double pas** les revenus, il **dose** la pression + un peu plus de kills
- Surcharge stable (~69 % passive) — pas d’emballement thermique flagrant sur 1 run
- Banque estimée fin run 14 : **~83**

### Run 15 — Coolant (pack L5)
- **Coolant L1→L5** en un achat (**75** éclats : 10+12+15+18+20) — banque ~83, choix thermique massif
- **23 kills / 46 éclats** / **00:29** — run la plus longue de la session (+spawn Flux + plus de marge thermique ?)
- Toujours **2/kill** (23×2=46) — économie stable
- Surcharge affichée **67,6 % passive** — peu de changement vs run 14 sur **1 run** (effet Coolant surtout sur durée de survie)
- Passif module : **2,8 → 2,3 /s** (−0,10/rang × 5) avant mult cycle — palpable en run longue, pas forcément visible sur % Meltdown d’une seule run
- Banque estimée fin run 15 : **~54** (83−75+46)

### Run 16 — Kill Vent L1
- **Kill Vent L1 (25)** acheté avec banque ~54 — timing cohérent ✓
- **27 kills / 54 éclats / 00:30** — **meilleure run** de la session (+4 kills vs run 15)
- **−0,3 % jauge / kill** : plus de kills = plus de survie ; combo logique avec Coolant L5 + Flux
- Surcharge **64 % passive / 36 % hit** — part **hit** en hausse (plus de contacts) ; passive légèrement ↓
- Banque estimée fin run 16 : **~83** (54−25+54)
- **Pack thermique amorcé** : Coolant L5 + Kill Vent L1 — Seuil / Blindage pas encore achetés

### Run 17 — Seuil de fusion L3 (sans Kill Vent)
- **Δ build** : **Seuil L3** (+24 % cap Breach) et **Kill Vent L1 retiré** — pivot « marge » vs « soulagement par kill »
- **32 kills / 62 éclats / 00:34** — **record session** sans Kill Vent (+5 kills vs run 16)
- **Seuil > Kill Vent** ici pour allonger la run : plus de cap → plus de temps → plus de kills/éclats
- Coût **Seuil L1→L3** = **37** (10+12+15) — abordable avec banque ~83
- Surcharge ~**64 %** passive / **36 %** hit — stable malgré run plus longue
- Banque estimée fin run 17 : **~108** (83−37+62, hors remboursement éventuel Kill Vent)
- **Piste design** : Kill Vent et Seuil se **concurrencent** en mid-C1 ; les deux restent valides selon le style de jeu

### Run 18 — Blindage de quarantaine L1
- **Blindage L1 (75)** acheté avec banque ~108 — ticket d’engagement prévu, timing OK ✓
- **34 kills / 67 éclats / 00:37** — **nouveau record** session (+2 kills, +3 s vs run 17)
- **Part hit 36 % → 30 %** malgré **plus de kills** — le Blindage **fonctionne** (riposte thermique mitigée)
- **Part passive 64 % → 70 %** — run plus longue : le passif **domine** la jauge sur la durée ; le Blindage ne touche pas le passif (comportement attendu)
- **67 vs 68** éclats attendus — 1 pickup manqué (Aimant L1 seulement ?)
- Banque estimée fin run 18 : **~100** (108−75+67)
- **Pack thermique** : Coolant L5 + Seuil L3 + Blindage L1 — trio cohérent, Kill Vent optionnel

### Run 19 — Seuil de fusion L6
- **Seuil L4→L6** = **63** éclats (18+20+25) — cap Breach **+48 %** (6 rangs)
- **42 kills / 84 éclats / 00:44** — saut net vs run 18 (+8 kills, +17 éclats, +7 s)
- **84 = 42×2** — économie Récup. toujours parfaite
- Surcharge **69 % passive / 31 % hit** — retour vers l’équilibre ~2/3–1/3
- Banque estimée fin run 19 : **~121** (100−63+84)

### Run 20 — Kill Vent L2 (combo complet)
- **Kill Vent L2** = **60** éclats cumulés (25+35) — réintroduit après test Seuil-only
- **55 kills / 110 éclats / 00:52** — **record session** ; **110 = 55×2**
- **+13 kills** vs run 19 : **Seuil L6 + Kill Vent L2** = run très longue ; le duo **tank + soulagement kill** scale fort
- **−0,6 % jauge/kill** × 55 ≈ **−33 pts** de soulagement sur la run — visible en durée
- Surcharge stable **67 % / 33 %** — pas de dérapage malgré 52 s de run
- Banque estimée fin run 20 : **~171**
- **Point de vigilance** : à partir de run 19–20, la **courbe éclats/kills s’accélère** (84→110/run) — normal avec build thermique maxi + Récup., mais à surveiller si le joueur **reste en C1** trop longtemps sans montée de cycle