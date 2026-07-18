# Playtest — Éclats des premières runs (nouveau joueur)

> **Source** : PO, playtest manuel « comme un nouveau joueur », départ à zéro.  
> **Outil** : Balance Tracker (dev) → export Markdown  
> **Sessions** : voir aussi [`balance-session-2026-07-18.md`](../balance-session-2026-07-18.md) (post-patch prix, données enrichies).

---

## Session 1 — manuel (pré-patch prix économie)

> **Date** : juillet 2026 · **10 runs** · grille Frappe seule en évolution.

| Run | Éclats gagnés (run) | Modules achetés avant / pendant la run |
|-----|---------------------|----------------------------------------|
| 1 | **5** | — |
| 2 | **6** | — |
| 3 | **7** | Frappe de purge **L1** |
| 4 | **8** | Frappe de purge **L1** |
| 5 | **12** | Frappe de purge **L2** |
| 6 | **11** | Frappe de purge **L3** |
| 7 | **12** | Frappe de purge **L3** |
| 8 | **12** | Frappe de purge **L3** |
| 9 | **12** | Frappe de purge **L4** |
| 10 | **11** | Frappe de purge **L4** |

| Métrique | Valeur |
|----------|--------|
| Total éclats (10 runs) | **96** |
| Moyenne / run | **9,6** |
| Min / max par run | **5** / **12** |

**Usage** : base pour recalibrer Aimant / Récup. / Flux (grille appliquée ci-dessous).

---

## Session 2 — Balance Tracker (post-patch)

> Fichier canon détaillé : [`balance-session-2026-07-18.md`](../balance-session-2026-07-18.md)  
> **20 runs** · **646** éclats cumulés · **C1** · fin **Meltdown** à chaque run.

| Run | Kills | Shards run | Σ | Achat (Δ build) |
|-----|------:|-----------|---|-----------------|
| 1 | 6 | 5 | 5 | Node-0 Boot (gratuit) |
| 2 | 5 | 5 | 10 | **Aimant L1** (5) |
| 3 | 6 | 6 | 16 | — |
| 4 | 8 | 8 | 24 | **Frappe L1** (10) |
| 5 | 7 | 7 | 31 | — |
| 6 | 8 | 8 | 39 | — |
| 7 | 12 | 12 | 51 | **Frappe L2** (12) |
| 8 | 12 | 12 | 63 | **Frappe L3** (15) |
| 9 | 12 | 12 | 75 | **Frappe L4** (18) |
| 10 | 12 | 12 | 87 | — |
| 11 | 20 | 19 | 106 | **Frappe L5** (20) |
| 12 | 18 | **36** | 142 | **Récup. L1** (25) |
| 13 | 20 | **40** | 182 | **Flux L1** (35) |
| 14 | 21 | **41** | 223 | — (Flux actif) |
| 15 | 23 | **46** | 269 | **Coolant L5** (75 cumulé) |
| 16 | 27 | **54** | 323 | **Kill Vent L1** (25) |
| 17 | 32 | **62** | 385 | **Seuil L3** (37) · Kill Vent retiré |
| 18 | 34 | **67** | 452 | **Blindage L1** (75) |
| 19 | 42 | **84** | 536 | **Seuil L4→L6** (63) |
| 20 | 55 | **110** | 646 | **Kill Vent L2** (60) |

| Métrique | Valeur |
|----------|--------|
| Record session | **55 kills · 110 éclats · 0:52** (run 20) |
| Courbe éclats/run (17→20) | 62 → 67 → **84** → **110** |
| Courbe kills (17→20) | 32 → 34 → **42** → **55** |
| Banque estimée fin run 20 | **~171** |

**Validation** : combo **Seuil L6 + Kill Vent L2 + Récup.** = montée forte mais **2/kill** stable · vigilance si le joueur farm C1 sans passer C2

---

## Grille prix appliquée (playtest early, juillet 2026)

Calibrée sur **5–12 éclats/run** (Meltdown C1), pas sur victoire complète théorique.

| Module | Grille |
|--------|--------|
| Aimant d'éclats | **5 / 12 / 22** |
| Récupération d'éclats | **25** (1 rang) |
| Flux de menace | **35 / 50 / 75** |

---

*Mettre à jour en ajoutant un nouveau `balance-session-YYYY-MM-DD.md` exporté depuis le dev Balance Tracker.*
