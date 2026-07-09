# Références effets visuels — Zero Archive

Document de référence pour l'agent et les futures features visuelles (glitch, surcharge, terminal Dark Hex, **VFX gameplay**).
**À consulter avant** d'ajouter des effets CSS, Canvas 2D, WebGL, shaders PixiJS ou tout feedback visuel lié au combat.

---

## Sources intégrées

| Source | URL | Usage pour Zero Archive |
|--------|-----|---------------------------|
| MDN WebGL best practices | https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices | Performance PixiJS/WebGL, limites GPU, batching |
| Kirupa — Advanced Glitch Effect | https://www.kirupa.com/codingexercises/advanced_glitch_effect.htm | Glitch Canvas 2D : pixel shift, slices, distortion |
| Alvaro Trigo — CSS Glitch Effect | https://alvarotrigo.com/fullPage/css-glitch-effect/ | Glitch CSS pur : texte, images, scanlines, RGB split |
| Luciano Lupo — Digital Garden | https://lucianolupo.com/ | Veille créative / méthode « digital garden » (docs vivantes) |
| CRYENGINE — Game Dev Tips VFX | https://www.cryengine.com/news/view/game-design-tips-tricks-visual-effects | Message gameplay d'abord, références réelles, tester tôt, simplicité |
| Pixune — Ultimate Guide to Game VFX | https://pixune.com/blog/the-ultimate-guide-to-game-vfx/ | Rôles VFX (feedback, guidage, ambiance), déclenchement gameplay, perf |
| VFX Apprentice — Style Guides | https://www.vfxapprentice.com/blog/creating-vfx-style-guides-for-games | Style guide, lisibilité vs bruit, formes/couleurs/timing |
| Riot — LoL VFX Style Guide (2017) | https://nexus.leagueoflegends.com/en-us/2017/10/dev-leagues-vfx-style-guide/ | Clarté gameplay, hiérarchie, impact visuel = impact gameplay |

---

## Choix de technique selon la zone du projet

| Zone | Stack actuelle | Technique recommandée | Pourquoi |
|------|----------------|----------------------|----------|
| Menus, HUD, écrans fin de run (`src/ui/`) | React + Tailwind | **CSS glitch** (Alvaro Trigo) | Pas de reflow lourd, pas de lib, `steps()` = feel digital |
| Arène gameplay (`src/game/`, PixiJS) | 60+ FPS, pas de re-render React | **PixiJS Graphics/Filters** ou shaders | Respecter la séparation UI/Game ; pas de DOM par frame |
| Urgence Breach ≥ 80 %, Meltdown | Overlay React + Pixi | **CSS scanline / RGB split** sur overlay + pulse Pixi existant | Léger, déclenché par seuil, pas en boucle permanente |
| Effets plein écran lourds (futur) | WebGL custom | **Fragment shader** (Alvaro Trigo WebGL) | Slices + aberration chromatique GPU ; CORS requis sur textures |

**Interdit sans validation utilisateur** : nouvelle lib (three.js, postprocessing, etc.).

---

## Règles MDN WebGL — applicables à PixiJS

PixiJS utilise WebGL en interne. Respecter ces principes :

### Performance (critique pour l'arène 60 FPS)

- **Batch les draw calls** : regrouper sprites/formes similaires ; éviter un draw par particule si possible.
- **Préférer le travail côté vertex** plutôt que fragment quand l'effet le permet.
- **Ne pas appeler** `getError`, `getParameter`, `readPixels` en production sur le thread principal — provoque du jank.
- **Supprimer les objets** (`destroy()`) dès qu'ils ne servent plus ; ne pas attendre le GC.
- **Réutiliser** textures, géométries, VAO — éviter recréer chaque frame.
- **Budget VRAM** : estimer `pixels × bytes/pixel` ; adapter au `devicePixelRatio` et à la taille fenêtre.
- **Back buffer plus petit** acceptable pour effets d'arrière-plan (upscale CSS) — pas pour les ennemis lisibles.

### Robustesse

- **Zéro erreur WebGL** en run normal (hors `OUT_OF_MEMORY` / `CONTEXT_LOST`).
- **Extensions** : traiter comme optionnelles sauf celles universellement supportées (MDN liste : `OES_vertex_array_object`, etc.).
- **Limites système** : ne pas supposer 16k textures ou 16 unités de texture — viser le minimum MDN (`MAX_TEXTURE_SIZE: 4096`, etc.).

### Boucle de jeu Zero Archive

- Gameplay = `useTick` Pixi uniquement — **pas** `requestAnimationFrame` parallèle sur le même canvas.
- Overlays React (HUD) = animations CSS `steps()` ou transitions courtes, pas de `getImageData`/`putImageData` en boucle.

---

## Glitch CSS — patterns Alvaro Trigo (UI React)

### Texte / titres (menus, Meltdown, victoire)

- Deux pseudo-éléments `::before` / `::after` avec `content: attr(data-text)`.
- Couleurs breach : tokens `darkHexTerminal` (orange `#ff4d00`) — purge = blanc/cyan `#e8f4f8` / `#22d3ee`, pas orange.
- Distorsion : `clip-path: inset(...)` + `transform: translate(...)`.
- Timing : `animation: … infinite steps(2)` ou `steps(3)` — **pas** `ease` (le glitch doit « sauter »).
- Durée typique : **0.2–0.4 s** ; déclencher sur `:hover`, seuil breach, ou état `Meltdown` — **pas** en permanence sur tout le HUD.

### Images / fonds

- Container `position: relative; overflow: hidden`.
- Pseudo-éléments avec `background: inherit`, `mix-blend-mode: multiply`, teintes décalées.
- Presets utiles : **Scanline** (bandes fines), **Subtle** (Breach 80–90 %), **Heavy** (Meltdown plein écran).

### Scanlines (overlay terminal)

- Plusieurs couches `background` décalées avec `--gap-h` / `--gap-v`.
- `background-blend-mode: color-dodge` ou `overlay` pour interférence.
- Animation `translate` + `clip-path` décalée par couche.

### RGB split / chromatic aberration (léger)

- Décalage 1–5 px sur une copie `::before` avec `mix-blend-mode: hard-light`, `opacity: 0.5`.

---

## Glitch Canvas 2D — patterns Kirupa (référence si Canvas hors Pixi)

Trois effets combinables avec `intensity` (0–1) et `frequency` (probabilité par frame) :

1. **colorShiftGlitch** — `getImageData` / manipulation canaux R,G,B par offset aléatoire.
2. **imageSliceGlitch** — `drawImage` sur tranches horizontales/verticales repositionnées.
3. **pixelDistortGlitch** — copie de pixels voisins (effet corruption).

**Attention Zero Archive** : `getImageData`/`putImageData` chaque frame = **coûteux**. Réserver à :
- écran de fin de run (1 canvas, pas la boucle arène),
- capture ponctuelle (flash Meltdown 200–400 ms), pas en continu.

Audio (static Web Audio API) : optionnel ; **demander validation** avant tout son automatique (autoplay navigateur).

---

## Glitch WebGL shader — référence Alvaro Trigo

Fragment shader type :

```glsl
float slice = floor(uv.y * sliceCount);
float offset = random(slice + time) * maxOffset;
float r = texture2D(image, vec2(uv.x + offset + chromatic, uv.y)).r;
float g = texture2D(image, vec2(uv.x + offset, uv.y)).g;
float b = texture2D(image, vec2(uv.x + offset - chromatic, uv.y)).b;
```

- Paramètres : `sliceCount`, `chromatic`, `maxOffset`, `time`.
- Images : **same-origin** ou CORS (`crossOrigin`).
- En Pixi : préférer `Filter` / `GlProgram` Pixi v8 plutôt qu'un second canvas WebGL brut.

---

## Mapping aesthetic Dark Hex Terminal

| Rôle visuel | Token / couleur projet |
|-------------|------------------------|
| **Purge zone / Node-0 (arène)** | `#e8f4f8` purge (blanc cassé), `#22d3ee` purgeGlow (cyan exécution) — distinct de la Breach |
| **Urgence / Breach / Meltdown** | `#ff4d00`, `#ff6b2b` (`DARK_HEX.breach`) — jauge Overload, boss, danger uniquement |
| **Hub / menu** | charbon + or `#c5a059`, grille `hexGridHub` dorée, vignette or/orange légère — **pas de bleu froid** |
| **Arène** | vignette orange (`.so-terminal-vignette--arena`), unité chaleur avec le hub |
| **Ennemis corrompus** | `#b3a3f0` violet clair (`corruptVioletLite`), creux sombre `#120820` = HP, scanlines, contour violet ; boss = contour orange breach |
| **Fond** | `#0a0a0f` / `#131018` |
| **Texte HUD** | anglais, sans-serif ; titres serif doré `#c5a059` |

**Feel cible** : terminal en surcharge, corruption de signal — pas vaporwave pastel, pas glassmorphism.

### Quand activer le glitch in-game

| État | Intensité suggérée | Technique |
|------|-------------------|-----------|
| Breach < 80 % | Aucun glitch HUD | — |
| Breach 80–95 % | Subtle / Scanline léger | CSS overlay React |
| Breach > 95 % | Classic + RGB split faible | CSS + pulse HUD / arène existant |
| Meltdown | Heavy / Chaos, 0.3–0.5 s puis écran fin | CSS plein écran + flash Pixi |

---

## Principes game VFX (design industrie)

Synthèse CRYENGINE, Pixune, VFX Apprentice (Sparkball / Hallzy), Riot LoL 2017.

### Priorités (ordre non négociable)

1. **Clarté gameplay** — le joueur comprend la mécanique sans lire de texte.
2. **Réduction du bruit visuel** — pas d'effet décoratif permanent qui pollue l'arène.
3. **Thème / identité** — terminal ARCH, hex, surcharge, pas fantasy biologique.
4. **Satisfaction** — flash court, timing snappy, reward visuel au bon moment.

### Impact visuel = impact gameplay (LoL)

- Purge principale : **forte** (cyan/blanc, shake, scanlines).
- Dégâts secondaires (ex. Purge Splash) : **plus discrets** que la zone centrale si un VFX est ajouté un jour.
- Boss elite : **plus visible** que normal (taille + teinte breach), cohérent avec la menace.

### Cinq leviers du style guide

| Levier | Question | Zero Archive |
|--------|----------|--------------|
| **Gameplay** | Quelle info est critique ? | Creux hex = HP restant ; purge = zone d'exécution |
| **Value** | Qu'est-ce qui doit briller ? | Purge cyan > ennemis violet clair > fond charbon |
| **Couleur** | Friendly vs menace ? | Purge = Node-0 ; violet = ennemis ; orange = breach/boss |
| **Forme** | Net, large, fluide ? | Hex flat-top, scanlines, langage terminal |
| **Timing** | Rapide ou durable ? | Flash impact ~200 ms ; rotation lente (~52 s/tour hex) |

### Primary vs Secondary (LoL / Sparkball)

- **Primary** = porte le gameplay (zone purge, creux HP, flash hit).
- **Secondary** = ambiance (halo, scanlines, glitch sporadique).

Les secondaires **soutiennent** le primary, ne le remplacent pas.

### Timing « snappy » (VFX Apprentice)

- Action principale dans le **premier quart** de la durée de l'effet.
- Puis fade / erosion (ease-out, pas linéaire).
- Glitch : **rare et aléatoire**, jamais la même ligne en boucle fixe.

### Simplicité (CRYENGINE)

- Chaque effet **deliver a message** avant d'être joli.
- Tester **in-game** (plusieurs ennemis + purge active).
- Pas de sur-ingénierie : `Graphics` Pixi procédural suffit pour l'arène actuelle.
- VFX **déclenchés par l'état gameplay** (dégâts, HP, phase), pas par la possession d'un module en UI.

---

## Style guide gameplay Zero Archive (canon v0.1)

### Langage visuel arène

| Élément | Rendu | Fichier(s) |
|---------|-------|------------|
| Zone de purge | Cercle cyan/blanc, scanlines horizontales, shake court à l'impact | `purgeZone.ts`, `PurgeZoneEngine.tsx` |
| Ennemi normal | Hex violet clair, dégradé radial, halo discret, scanlines alternées + glitch rare, creux hex sombre = HP | `corruptedProcessVisual.ts` |
| Ennemi elite | Même skin, rayon plus grand, **contour orange breach** | `enemyClass.ts`, `corruptedProcessVisual.ts` |
| Hit purge | Anneau hex ambre sur la cible | `EffectEngine.tsx` |
| Purge Splash (gameplay) | Dégâts en anneau autour de la zone ; **shockwave cyan** à chaque purge hit (module installé) | `PurgeZoneEngine.tsx`, `effects.ts`, `purgeZone.ts` |

### Couches ennemi (ordre de draw)

1. Halo violet (respiration, détachement du fond)
2. Fill hex + dégradé radial (volume)
3. Creux HP (hex sombre central, grandit quand HP baisse)
4. Scanlines (clip hex, masquées sur le creux)
5. Contour hex (alpha lié au HP)
6. Flash impact si `flashTimer > 0`

### Règles scanlines ennemi

- Synchronisées avec la **rotation** de l'hex (repère local, pas horizontal écran).
- **Clippées** sur le contour hex (pas de débordement).
- **Absentes** sur le creux sombre (anneau violet uniquement).
- Alternance clair / foncé (effet CRT).
- Glitch : 1–2 lignes aléatoires par slot temporel, décalage horizontal + trait fantôme.

### Tokens couleurs VFX arène

| Token | Hex | Usage |
|-------|-----|-------|
| `purge` / `purgeGlow` | `#e8f4f8` / `#22d3ee` | Zone de purge Node-0 |
| `corruptVioletLite` | `#b3a3f0` | Corps ennemi |
| `corruptVoid` | `#120820` | Creux HP |
| `corruptScanline` / `corruptScanlineDim` | `#e9e0ff` / `#6b5a9e` | Scanlines ennemi |
| `breach` / `breachGlow` | `#ff4d00` / `#ff6b2b` | Boss, urgence |

Source canonique code : `src/theme/darkHexTerminal.ts`.

---

## Luciano Lupo — digital garden

https://lucianolupo.com/ — jardin numérique (notes evergreen, projets, agents).

Pertinence indirecte pour Zero Archive :
- Documenter les choix visuels et lore dans `docs/` de façon **vivante** (mise à jour incrémentale).
- Pas de technique glitch directe ; référence pour **organisation de la connaissance** projet.

---

## Checklist agent avant implémentation

### Technique

- [ ] L'effet est-il dans `src/ui/` (CSS) ou `src/game/` (Pixi) ?
- [ ] Respecte-t-il la séparation UI / Game (pas de useState 60 FPS) ?
- [ ] Le glitch est-il **ponctuel ou seuil-driven**, pas permanent partout ?
- [ ] Pas de `getImageData` en boucle dans l'arène ?
- [ ] Couleurs alignées `darkHexTerminal.ts` ?
- [ ] Textes UI en **i18n EN + FR** si visible joueur ?
- [ ] Nouvelle lib npm ? → **demander validation**.

### Design gameplay (LoL / CRYENGINE)

- [ ] **Quel message** le joueur doit-il lire ? (obligatoire)
- [ ] Effet **primary** (gameplay) ou **secondary** (ambiance) ?
- [ ] **Impact visuel** proportionnel à l'impact gameplay ?
- [ ] Lisible avec **5–10 ennemis** + purge active ?
- [ ] **Timing snappy** (flash court, fade ease-out) ?
- [ ] Déclenché par **état gameplay** (dégâts, HP, phase), pas par UI/module tree seul ?
- [ ] Mise à jour **`docs/lexique-jeu.md`** si nouvelle mécanique ou zone visible nommable ?
