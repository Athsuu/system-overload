# System Overload

**The system collapses under a wave of corrupted processes.**

You are the **Kernel** — the last stable core. Move, auto-fire Flux Bolts, survive escalating waves, and keep **Breach** overload under control until you **Contain the Breach** or suffer a **Meltdown**.

Roguelite arena shooter with instant-start runs, mid-run **Module Bay** upgrades, and permanent **Skill Tree** meta-progression. Dark Hex Terminal aesthetic: glass UI over a high-frequency WebGL battlefield.

---

## Gameplay loop

1. **Start Run** — drop straight into the arena (no setup phase).
2. **Survive waves** of **Corrupted Processes** converging on the Kernel.
3. **Manage Breach** — impacts, missed shots, and time drive overload toward Meltdown.
4. **Level up** → earn **Cycles** → open the **Module Bay** and install Kernel Modules mid-run.
5. **End of run** → **Run Shards** transfer to your vault → spend **Hex Shards** on permanent Skill Enhancements.

| In-run | Between runs |
|--------|----------------|
| Cycles, Kernel Modules, XP | Hex Shards (vault) |
| Breach / Overload | Skill Tree upgrades |
| Wave progression | Permanent Kernel tuning |

---

## Controls

| Input | Action |
|-------|--------|
| **W A S D** / **Arrow keys** | Move the Kernel |
| **Auto-fire** | Flux Bolts target the nearest Corrupted Process |
| **Pause** | `Esc` — resume, settings, or abort run |

---

## Enemies — Corrupted Processes (NODE-ALPHA)

Procedural threats rendered in PixiJS at 60 FPS:

- Rotating violet hex shell with corruption texture (grain, scanlines, vertex glitches)
- Cyan core whose **size scales with remaining HP** (invisible health read)
- Orbiting satellite markers and hit-reactive core glow
- **Boss wave** — breach-orange core variant (`core_breach`)

Internal code name: `DissipationNode`. Player-facing lore: *Corrupted Processes*.

---

## Tech stack

| Layer | Tools |
|-------|--------|
| Language | **TypeScript** (strict) |
| UI | **React 19** + **Vite 8** + **Tailwind CSS 4** |
| Game render | **PixiJS 8** via `@pixi/react` |
| State (low frequency) | **Zustand** — currency, Breach, game phase, upgrades |
| Lint | **Oxlint** |

---

## Architecture

Strict separation between UI and game simulation:

```
src/
├── ui/          React + Tailwind — menus, HUD, Module Bay, Skill Tree, settings
├── game/        PixiJS + pure TS — arena, particles, enemies, effects (60+ FPS)
├── store/       Zustand — persistence, upgrades, kernel module catalog
└── theme/       Dark Hex Terminal design tokens
```

**Performance rules**

- Entity positions, rotation, and velocity never live in React state or Zustand.
- The gameplay loop uses Pixi `useTick` and mutable refs — **no React re-renders per frame**.
- Zustand holds metadata only: `tflops`, Breach, `gameState`, upgrade levels, etc.

---

## Getting started

**Requirements:** Node.js 20+

```bash
git clone https://github.com/Athsuu/system-overload.git
cd system-overload
npm install
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Oxlint |

---

## Project docs

- [`docs/narrative.md`](docs/narrative.md) — lore bible, canonical vocabulary, creative direction (FR, draft)

---

## Repository

**GitHub:** [github.com/Athsuu/system-overload](https://github.com/Athsuu/system-overload)

Private project — all rights reserved.
