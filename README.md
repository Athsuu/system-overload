# Zero Archive

**The Zero Archive collapses under a wave of corrupted processes.**

You are **Node-0** — a child process compiled by **ARCH** into quarantine to protect **the Seed** (the archive's original pure source code). Purge corrupted processes, keep **Breach** overload under control, and survive until you **Contain the Breach** or suffer a **Meltdown**. Long-term narrative goal: the **Uplink** — extracting the Seed from a dying archive.

Roguelite arena survivor with instant-start runs and permanent **Skill Tree** meta-progression. Dark Hex Terminal aesthetic: terminal UI over a high-frequency WebGL battlefield.

---

## Gameplay loop

1. **Start Run** — drop straight into the arena (no setup phase).
2. **Survive waves** of **Corrupted Processes**.
3. **Purge** — hold the purge zone over enemies (mouse); no visible player sprite.
4. **Manage Breach** — time and purge pressure drive Overload toward Meltdown.
5. **End of run** → **Run Shards** transfer to your vault → spend **Hex Shards** on permanent Skill Enhancements.

| In-run | Between runs |
|--------|----------------|
| Purge zone, Overclock | Hex Shards (vault) |
| Breach / Overload | Skill Tree upgrades |
| Wave progression | Node-0 reconfiguration |

---

## Controls

| Input | Action |
|-------|--------|
| **Mouse** | Aim / hold purge zone over enemies |
| **Space** | Overclock (when unlocked) |
| **Pause** | `Esc` — resume, settings, or abort run |

---

## Enemies — Corrupted Processes

Procedural threats rendered in PixiJS at 60 FPS — violet hex shells, cyan cores (boss: breach orange).

Internal code name: `DissipationNode`. Player-facing lore: *Corrupted Processes*.

---

## Tech stack

| Layer | Tools |
|-------|--------|
| Language | **TypeScript** (strict) |
| UI | **React 19** + **Vite 8** + **Tailwind CSS 4** |
| Game render | **PixiJS 8** via `@pixi/react` |
| State (low frequency) | **Zustand** |
| Lint | **Oxlint** |

---

## Architecture

```
src/
├── ui/          React + Tailwind — menus, HUD, Skill Tree, settings
├── game/        PixiJS + pure TS — arena, enemies, purge zone, effects (60+ FPS)
├── store/       Zustand — persistence, upgrades
└── theme/       Dark Hex Terminal design tokens
```

**Performance rules:** entity positions never live in React state or Zustand; gameplay uses Pixi `useTick` and mutable refs.

---

## Getting started

**Requirements:** Node.js 20+

```bash
npm install
npm run dev
```

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck + production build |
| `npm run lint` | Lint |

---

## Narrative reference

See [`docs/narrative.md`](docs/narrative.md) (v0.7 — ARCH, Node-0, Zero Archive, the Seed, Uplink).
