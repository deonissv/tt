# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TT is a multiplayer tabletop game simulation platform. It loads game definitions from Tabletop Simulator (TTS) `.json` format, renders them in a 3D BabylonJS canvas, and synchronizes game state across players in real time via WebSockets.

## Repository Structure

This is an npm workspaces monorepo:
- `packages/client` — React + Vite frontend (3D BabylonJS canvas UI)
- `packages/server` — NestJS backend (REST API + WebSocket gateway)
- `packages/playground` — Standalone Vite app for isolated testing
- `libs/*` — 14 shared TypeScript libraries (see below)
- `static/` — Example game definitions (castles, chess5, demo)
- `infra/` — Docker configs; `proxy/` — Nginx config

## Commands

```bash
# Install all workspaces
npm run i:all

# Development (all services concurrently)
npm run dev

# Build
npm run build

# Run all tests
npm run test

# Run tests (libs only)
npm run test:lib

# Run e2e tests
npm run test:e2e

# Run a single workspace's tests (e.g. server)
npm -w ./packages/server run test

# Watch mode tests
npm -w ./packages/server run test:w

# Lint / typecheck / format
npm run lint
npm run typecheck
npm run format

# Full validation (typecheck + lint + test)
npm run check

# Database setup (generate Prisma client, push schema, seed)
npm run db:init

# Docker dev environment
npm run docker:dev
```

## Architecture

### Data Flow

1. A game definition (TTS `.json`) is parsed by `@tt/tts-parser` into actor state objects.
2. The server stores game state and exposes it via REST (`/games`, `/rooms`) and WebSocket events.
3. The client loads the state, instantiates actors via `@tt/actors` / `@tt/builtin-actors`, and renders them in BabylonJS with Havok physics.
4. Player actions (pick, roll, flip, shuffle, rotate) are handled by `@tt/actions`, broadcast through WebSocket, and applied to all connected clients.

### Shared Libraries (`libs/`)

| Package | Role |
|---|---|
| `tts-parser` | Parses Tabletop Simulator `.json` save format into actor state |
| `simulation` | BabylonJS engine wrapper — scene, camera, physics setup |
| `actors` | Base 3D actor classes (Card, Die, Bag, Deck, etc.) |
| `builtin-actors` | Pre-built concrete actor implementations |
| `actions` | Action handlers that mutate actor state (pick, flip, roll, shuffle) |
| `states` | Shared TypeScript state type definitions |
| `dto` | Zod/class-validator DTOs used by both server controllers and client API calls |
| `loader` | Asset loading utilities |
| `channel` | WebSocket channel abstraction used on both client and server |
| `logger` | Centralized logging wrapper |
| `utils` | General helpers |
| `mime-resolver` | MIME type detection for served assets |
| `demo-saves` | Embedded demo game definitions |

All libs are resolved via the `@tt/*` path alias defined in `tsconfig.base.json` (e.g., `@tt/utils` → `libs/utils/src/index`).

### Server Modules (NestJS)

Key modules in `packages/server/src/`:
- `AuthModule` — JWT + Passport authentication (login/signup)
- `UsersModule` — User CRUD
- `RoomsModule` — Multiplayer room lifecycle
- `GamesModule` — Game state management
- `SimulationModule` — Sync 3D simulation state across clients
- `EventsModule` — WebSocket gateway for real-time broadcasting
- `CaslModule` — ABAC authorization (roles/permissions stored in DB)
- `FileLoaderModule` — Serve and proxy game asset files
- `MessagesModule` — In-game chat

### Room Domain Objects (`packages/server/src/rooms/`)

A running multiplayer game is composed of three plain classes (not Nest providers) with a deliberate separation of concerns. Each owns exactly one axis of the problem; nothing else should leak across these boundaries:

- **`Simulation`** — owns the **realtime simulation**: the physics world and game state. It is the single source of truth for what the game *is*, and produces both full snapshots and deltas of that state. It knows nothing about networking or connected users.

- **`Client`** — owns the **per-user message stream**: turning shared simulation deltas into the messages a single connected user should receive, and recovering from dropped/out-of-order delivery so each user converges to the correct state independently. It models one connected user, not the transport.

- **`SimulationRoom`** — owns the **transport**: accepting connections, routing inbound/outbound messages, broadcasting, and managing the room's lifecycle (start, persistence, close). It is the only place the WebSocket library is allowed to surface; everything above it works in terms of state and messages, never sockets.

These are *not* `@Injectable`: their cardinality is per-room / per-connection and their lifecycle is runtime-managed (created on room start, destroyed on close), which the singleton-scoped DI container does not model. `SimulationRoomFactory` is the bridge — it pulls the singleton providers it needs from the container and constructs a room with the runtime arguments for a specific game. `RoomRegistry` owns the set of live rooms that the container cannot.

### Database

Prisma ORM with PostgreSQL. Schema at `packages/server/prisma/schema.prisma`. Key models: `User`, `Role`, `Permission` (CASL-based ABAC), `Game`, `Room`, `Message`, `RoomUser`. Soft delete is enabled via `prisma-extension-soft-delete`.

## Testing

- **Framework:** Vitest with SWC transpiler
- **Unit tests:** `*.spec.ts` / `*.test.ts` co-located with source or in `tests/` subdirs
- **E2E tests:** `*.e2e.spec.ts` in `packages/server/test/`; use `testcontainers` to spin up a real PostgreSQL instance
- **Configs:** `vitest.config.ts` (unit), `vitest.e2e.config.ts` (e2e, single-threaded, 3-minute timeout), `vitest.base.ts` (shared base)

## Environment

Copy `_example-env_` to `.env` before running. The `.env` file is loaded via `dotenv-cli` for database commands.

## Key Configuration Files

- `tsconfig.base.json` — Root TypeScript config with `@tt/*` path aliases
- `.eslintrc.cjs` — Shared ESLint rules for all packages and libs
- `.prettierrc` — 2-space indent, semicolons, trailing commas
- `docker-compose.yml` — PostgreSQL + server + Nginx services
