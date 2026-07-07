# Références effets visuels — Zero Archive

Document de référence pour l'agent et les futures features visuelles (glitch, surcharge, terminal Dark Hex).
**À consulter avant** d'ajouter des effets CSS, Canvas 2D, WebGL ou shaders PixiJS.

---

## Sources intégrées

| Source | URL | Usage pour Zero Archive |
|--------|-----|---------------------------|
| MDN WebGL best practices | https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices | Performance PixiJS/WebGL, limites GPU, batching |
| Kirupa — Advanced Glitch Effect | https://www.kirupa.com/codingexercises/advanced_glitch_effect.htm | Glitch Canvas 2D : pixel shift, slices, distortion |
| Alvaro Trigo — CSS Glitch Effect | https://alvarotrigo.com/fullPage/css-glitch-effect/ | Glitch CSS pur : texte, images, scanlines, RGB split |
| Luciano Lupo — Digital Garden | https://lucianolupo.com/ | Veille créative / méthode « digital garden » (docs vivantes) |

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
- **Back buffer plus petit** acceptable pour effets d'arrière-plan (upscale CSS) — pas pour le Kernel/ennemis lisibles.

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
- Couleurs breach : cyan `#0ff` / magenta `#f0f` **ou** tokens `darkHexTerminal` (orange `#ff4d00`, ambre).
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

| Effet glitch | Token / couleur projet |
|--------------|------------------------|
| Urgence / breach | `#ff4d00`, `#ff6b2b` (`DARK_HEX.breach`) |
| Glow / scanline | `#e8b896` flux atténué |
| Fond | `#0a0a0f` |
| Texte HUD | anglais, sans-serif ; titres serif doré `#c5a059` |

**Feel cible** : terminal en surcharge, corruption de signal — pas vaporwave pastel, pas glassmorphism.

### Quand activer le glitch in-game

| État | Intensité suggérée | Technique |
|------|-------------------|-----------|
| Breach < 80 % | Aucun glitch HUD | — |
| Breach 80–95 % | Subtle / Scanline léger | CSS overlay React |
| Breach > 95 % | Classic + RGB split faible | CSS + pulse Kernel Pixi existant |
| Meltdown | Heavy / Chaos, 0.3–0.5 s puis écran fin | CSS plein écran + flash Pixi |

---

## Luciano Lupo — digital garden

https://lucianolupo.com/ — jardin numérique (notes evergreen, projets, agents).

Pertinence indirecte pour Zero Archive :
- Documenter les choix visuels et lore dans `docs/` de façon **vivante** (mise à jour incrémentale).
- Pas de technique glitch directe ; référence pour **organisation de la connaissance** projet.

---

## Checklist agent avant implémentation

- [ ] L'effet est-il dans `src/ui/` (CSS) ou `src/game/` (Pixi) ?
- [ ] Respecte-t-il la séparation UI / Game (pas de useState 60 FPS) ?
- [ ] Le glitch est-il **ponctuel ou seuil-driven**, pas permanent partout ?
- [ ] Pas de `getImageData` en boucle dans l'arène ?
- [ ] Couleurs alignées `darkHexTerminal.ts` ?
- [ ] Textes UI en **anglais** ?
- [ ] Nouvelle lib npm ? → **demander validation**.
