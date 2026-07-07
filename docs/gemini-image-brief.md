# Zero Archive ? Brief visuel pour Gemini Image

> **Usage :** copie-colle ce document (ou les sections pertinentes) au d?but d?une session Gemini Image, puis indique **sur quoi tu travailles** (ex. ? mockup HUD ?, ? ennemi NODE-ALPHA tier 2 ?, ? ?cran Module Bay ?).  
> **Langue des textes in-game :** anglais. Ce brief est en fran?ais pour toi ; les libell?s UI dans les images doivent rester en **anglais**.

---

## 1. Contexte projet

**Jeu :** *Zero Archive* ? roguelite arena survivor, d?marrage instantan?, vue top-down 2D.

**Lore en une phrase :** un syst?me informatique s?effondre ; tu es **Node-0** ; des **Corrupted Processes** convergent ; si la **Breach** (surcharge) explose ? **Meltdown**.

**Univers :** machine abstraite, hexagonal, terminal froid. Pas de fantasy biologique (pas de c?ur, sang, organes). Tout parle de **processus, chaleur, surcharge, donn?es**.

**Outil de prototypage :** **Gemini Image** (g?n?ration / variation d?images de r?f?rence).

**Outil de production r?el :** le jeu est cod? en **TypeScript** ? UI **React + Tailwind**, ar?ne **PixiJS** (formes vectorielles, d?grad?s, scanlines proc?durales). Les images Gemini servent de **direction artistique**, pas d?assets PNG finaux import?s tels quels.

---

## 2. Direction artistique globale ? ? Dark Hex Terminal ?

| Pilier | Description |
|--------|-------------|
| **Esth?tique** | Minimaliste, premium, ?pur?e (r?f?rence : finition type Apple, mais univers cyber-terminal sombre) |
| **UI** | **Glassmorphism** ? panneaux semi-transparents, `backdrop-blur`, bordures fines subtiles |
| **Gameplay (WebGL)** | Lisible ? 60 FPS ; le fond reste discret pour laisser la sc?ne Pixi respirer |
| **Ambiance** | Froid, urgent, syst?me en surchauffe ? pas hero-fantasy, pas horror gore |
| **Formes dominantes** | Hexagones flat-top, cercles / orbites, lignes fines type terminal |
| **Texture** | Corruption = grain digital, scanlines, micro-glitches ? **pas** photor?aliste, **pas** peinture organique |

---

## 3. Palette ? tons ? respecter

Pas besoin de hex exacts ? chaque pixel ; respecter **l?intention** des familles de couleur :

| R?le | Ton | R?f?rence approximative | Usage |
|------|-----|-------------------------|--------|
| **Fond / void** | Noir anthracite, bleu-nuit tr?s profond | `#0a0a0f` | Canvas, ar?ne, vide int?rieur des ennemis |
| **Ennemi ? coque** | Violet ?lectrique, glitch terminal | `#8b5cf6` | Bande hex des Corrupted Processes |
| **Ennemi ? data / core** | Cyan lumineux, data vivante | `#22d3ee` | Noyau, satellites, orbites |
| **Joueur ? identit?** | Dor? ambr? `#c5a059` | Skill tree, accents Node-0 (pas d'ennemi violet) |
| **Purge zone** | Ambre clair + lueur orange | Zone de purge en ar?ne ? pas de sprite joueur |
| **UI neutre** | Gris froid, blanc cass? ? faible opacit? | ? | Labels HUD, textes secondaires |

**Contrastes cl?s :**
- Ennemis = **violet + cyan** vs Joueur = **or + breach orange**
- Plus la Breach monte ? plus d?**orange/rouge** dans l?ambiance (pulse, vignette)

---

## 4. Ce qu?il NE faut PAS g?n?rer

- ? Photor?alisme, textures m?tal photo, personnages humains
- ? Fantasy (?p?es, dragons, runes magiques)
- ? Horror gore, organes, ? c?ur ? biologique
- ? UI color?e type mobile casual (pastel, bulles arrondies enfantines)
- ? Sci-fi generic neon city / cyberpunk Blade Runner satur?
- ? Texte UI en fran?ais dans les mockups (sauf demande explicite)
- ? Spritesheets ou PNG d?taill?s pr?sent?s comme assets finaux ? on **s?inspire**, on ne remplace pas le pipeline Pixi
- ? Ancienne vision gameplay : r?seau de n?uds connect?s par c?bles, phase de pr?paration avant combat

---

## 5. Comment travailler avec moi (workflow Gemini)

1. **Tu colles** les sections 1?4 + la section th?matique (HUD, ennemi, etc.).
2. **Tu pr?cises la t?che du jour**, par exemple :
   - ? G?n?re un mockup HUD in-game, vague 3, Breach ? 70 % ?
   - ? Variante NODE-ALPHA plus corrompue, m?me silhouette ?
   - ? ?cran Module Bay au level-up ?
3. **Optionnel :** joins une **capture** du build actuel ? ? garde la structure, change X ?.
4. **It?re** en rappelant les limites (section 8) si Gemini d?rive.

**Format de prompt sugg?r? :**

```
[Brief Zero Archive ? section HUD]
T?che : mockup HUD combat, Breach 80%, wave 2/5
Contraintes : glassmorphism, fond sombre, textes EN, pas de photor?alisme
```

---

## 6. HUD (in-game)

**R?le :** discret, lisible sous pression ; ne pas masquer l?ar?ne Pixi.

| ?l?ment | Direction |
|---------|-----------|
| **Breach / Overload** | Jauge ou indicateur de surcharge ; devient **urgent orange** pr?s du Meltdown |
| **Wave** | `WAVE X/Y` ? petit, coin ?cran |
| **Level / XP** | Progression de run, sobre |
| **Cycles** | Monnaie temporaire mid-run (level-up) |
| **Run Shards** | Fragments gagn?s pendant le run |
| **Style** | Panneaux glass, typo sans-serif moderne, labels courts EN |

**Textes EN de r?f?rence :** `Overload`, `Stable`, `Meltdown imminent`, `Cycles`, `Run Shards`, `WAVE`.

**? ?viter :** HUD surcharg?, barres HP classiques sur les ennemis (la vie ennemie se lit via le **noyau**, pas une barre UI).

---

## 7. Node-0 (joueur) ? purge-only

**Identit? :** hexagone flat-top **dor? / rouge sombre**, au centre de l?ar?ne ; c?est **le** processus stable.

| ?l?ment | Direction |
|---------|-----------|
| **Silhouette** | Hex compact, glow breach ambiant selon niveau de surcharge |
| **Mouvement** | WASD ? entit? mobile, pas une tourelle fixe |
| **Tir** | **Flux Bolts** ? petits projectiles hex/flux ambre-orange |
| **Overclock** | Surchauffe volontaire ? accent breach temporaire (anneau, pulse) |

**Contraste vs ennemis :** le Kernel **n?est pas violet** ; il est chaud (or / breach), c?t? ? syst?me central en surchauffe contr?l?e ?.

---

## 8. Ennemis ? Corrupted Processes (NODE-ALPHA)

**Nom lore :** *Corrupted Processes*. **Nom interne code :** NODE-ALPHA / DissipationNode.

**Silhouette canon (impl?ment?e en Pixi) :**

```
???????????????????????????
?   ????????????????      ?  ? bande hex VIOLET (coque), rotation lente
?  ?   void circulaire  ?   ?  ? void sombre + scanlines cyan/violet
? ?    ? core cyan      ?  ?  ? noyau = jauge HP (r?tr?cit avec les d?g?ts)
? ?   ?????  satellites ?  ?  ? 2 points cyan sur orbite
?  ?                   ?   ?
?   ?_________________?      ?
???????????????????????????
```

| ?l?ment | Direction |
|---------|-----------|
| **Coque hex** | Violet, d?grad? + grain corruption, double contour, ticks aux sommets |
| **Void int?rieur** | Noir profond, scanlines horizontales, l?ger glitch |
| **Core** | Cyan brillant, bloom ; **taille = PV restants** |
| **Satellites** | 2 boules cyan sur orbite fine |
| **Hit** | Flash / glow cyan au centre ? **pas** de grand cercle violet autour du hex |
| **Animation (impression)** | Rotation hex + orbite lente ; mati?re ? vivante ? mais propre |

**Tiers :** T0 < T1 < T2 ? surtout taille / menace, m?me AD violet/cyan.

**? ?viter :** ennemi sph?re slime, robot humano?de, barre HP cyan plate au-dessus, crochets lat?raux type ? cornes ?, int?rieur hex anguleux (le void est **circulaire**).

---

## 9. Boss ? `core_breach`

**Lore :** overflow critique, seuil de breach incarn?.

| vs ennemi standard | Boss |
|--------------------|------|
| Core | **Orange breach** au lieu de cyan |
| Coque | Violet + accents breach, plus massif |
| Menace | Anneaux / glow plus intenses |

Palette boss : **orange `#ff4d00` + violet corrompu**, pas un ennemi enti?rement orange.

---

## 10. ?crans UI (React ? hors ar?ne Pixi)

### Skill Tree (hub meta)

- Fond sombre, grille hex subtile, arbre **SVG radial** ? module racine **Node-0 Boot** (hex upgrade, pas de sprite central PNG)
- Monnaie : **Hex Shards** (vault permanent)

### Pause

- **SYSTEM HALT** ? Node-0 execution suspended
- Stats : Breach, Wave, Run Shards

### Fin de run

| R?sultat | Titre EN |
|----------|----------|
| Victoire | **Breach Contained** |
| D?faite | **Meltdown** |

Sous-titres courts, style syst?me ? pas de prose longue.

### Settings

- **System Config** ? sections Audio / Language / Controls (glass overlay)

---

## 11. Effets & projectiles

| Effet | Direction |
|-------|-----------|
| **Flux Bolts** | Petits hex ou traits lumineux ambre-orange, trail court |
| **Impact ennemi** | Burst cyan centr? sur le **core** |
| **Spawn ennemi** | Flash violet + bloom cyan |
| **Mort ennemi** | Dissolution hex violette + bloom |
| **Impact Kernel** | Pulse breach orange depuis le centre |

---

## 12. Limites techniques ? respecter (production r?elle)

Gemini doit produire des **r?f?rences visuelles** compatibles avec :

| Contrainte | Pourquoi |
|------------|----------|
| **Formes simples / vector-friendly** | Rendu Pixi = cercles, hex, strokes, d?grad?s ? pas de textures photo complexes |
| **Palette plate + glow** | Pas de shading r?aliste 3D lourd |
| **Lisibilit? ? petite taille** | Ennemis ~32?55 px de rayon ? silhouettes claires |
| **Pas de d?tail micro illisible** | Grain oui, fouillis non |
| **S?paration UI / gameplay** | HUD = React par-dessus ; ennemis = couche Pixi ? mockups peuvent montrer les deux mais en respectant cette hi?rarchie |
| **Texte UI** | Courts, EN ; Gemini peut approximer ? le texte final sera refait en code |

**Ce que le code impl?mente d?j? (ne pas contredire sans discussion) :**
- Noyau ennemi = jauge HP (taille lin?aire)
- Texture corruption (grain, scanlines, glitches sommets)
- Pas de barre HP UI sur les ennemis

---

## 13. Vocabulaire EN (textes dans les mockups)

| Concept | Terme UI |
|---------|----------|
| Joueur | **Kernel** |
| Surcharge | **Breach** / **Overload** |
| D?faite | **Meltdown** |
| Victoire | **Breach Contained** |
| Ennemis | **Corrupted Processes** (lore ; pas besoin sur HUD) |
| Monnaie run | **Run Shards** |
| Monnaie permanente | **Hex Shards** / **Available Shards** |
| Mid-run shop | **Module Bay** |
| Monnaie mid-run | **Cycles** |
| Pause | **SYSTEM HALT** |
| Meta upgrades | **Skill Enhancements** |

---

## 14. Checklist rapide avant validation d?une image

- [ ] Fond sombre anthracite, pas clair
- [ ] Ennemi violet/cyan ; Kernel or/breach ? pas invers?s
- [ ] Glassmorphism si UI
- [ ] Pas de photor?alisme / fantasy / biologie
- [ ] Textes EN courts si texte visible
- [ ] Silhouette ennemi lisible (hex + void rond + core)
- [ ] Ambiance terminal corruption, pas cyberpunk ville
- [ ] Compatible vector / flat (impl?mentable en Pixi)

---

## 15. Exemples de demandes types

**Ennemi :**
> Section 8. NODE-ALPHA tier 1, vue top-down, fond noir, plus de scanlines dans le void, core cyan plus prominent, style flat vector premium.

**HUD :**
> Section 6. HUD minimal top corners, Breach ? 85 % (orange urgent), wave 3/5, glass panels, textes EN.

**Module Bay :**
> Section 10. ?cran level-up, titre Module Bay, 3 cartes modules, monnaie Cycles, glassmorphism dark hex terminal.

**Variation depuis capture :**
> Sections 1?4 + 8. [image jointe] Garde la silhouette hex + void circulaire ; augmente texture corruption sur la bande violette ; ne change pas les couleurs Kernel.

---

*Derni?re mise ? jour : 2026-07-05 ? align? sur `darkHexTerminal.ts`, `gameNarrative.ts`, `corruptedProcessVisual.ts`.*
