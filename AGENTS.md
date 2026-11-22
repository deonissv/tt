# Project guide

TT is a multiplayer tabletop simulator. It loads Tabletop Simulator JSON saves and keeps players in sync over WebSockets.

See [Getting started in the README](README.md#getting-started) for prerequisites, setup, and development commands.

## Where things live

| Location | Purpose |
| --- | --- |
| `packages/client` | React/Vite frontend |
| `packages/server` | NestJS backend |
| `packages/playground` | Standalone playground |
| `packages/visual-tests` | Browser regression tests and fixtures |
| `static/` | Example game saves |
| `tsconfig.base.json` | Maps `@tt/*` imports to shared libraries |

The project uses BabylonJS and Havok. The client selects WebGPU or WebGL in `libs/simulation/src/lib/SimulationEngine.ts`. The server runs without a canvas using BabylonJS `NullEngine` in `packages/server/src/simulation/simulation.ts`.

### Shared libraries

| Package | Responsibility |
| --- | --- |
| `@tt/tts-schema` | Tabletop Simulator save schemas and types |
| `@tt/tts-parser` | Reads and writes TTS saves, collects assets, and imports simulation state into `@tt/states` |
| `@tt/actors` | Shared actor mixins |
| `@tt/builtin-actors` | Built-in assets |
| `@tt/simulation` | Shared engine, scene, and state support |
| `@tt/actions` | Message types and payloads |
| `@tt/rules` | Actor capabilities and shared rules |

Server actions are handled in `packages/server/src/simulation/action-handler.ts` and the adjacent `behaviors/` directory. When adding an actor type, follow the checklist in `libs/rules/src/lib/rules.ts`.

### Keep these responsibilities separate

Paths below are relative to `packages/server/src/`.

| Class | Responsibility | Source |
| --- | --- | --- |
| `Simulation` | Physics, state snapshots, and state changes | `simulation/simulation.ts` |
| `Client` | User context and per-user messages, including cursor filtering | `rooms/client.ts` |
| `SimulationRoom` | WebSocket connections, routing, broadcasts, timers, and persistence | `rooms/simulation-room.ts` |

Keep networking out of simulation code and socket handling in the transport layer. `Client` currently has no acknowledgment, replay, or recovery for messages received out of order.

These three classes are created at runtime. Do not turn them into injectable singletons. `SimulationFactory` and `SimulationRoomFactory` connect Nest providers to those instances, while `RoomRegistry` tracks live rooms.

The PostgreSQL schema is in `packages/server/prisma/schema.prisma`. Soft deletion is configured in `packages/server/src/prisma/prisma.service.ts`. Authentication and authorization live under `packages/server/src/auth/` and `casl/`.

## Checking your changes

Use the project's scripts and configs. Formatting and lint rules live in `.prettierrc` and `.eslintrc.cjs`.

| Check | Command | Coverage |
| --- | --- | --- |
| Unit tests | `npm test` or `npm run test:unit` | Uses `vitest.mutation.config.ts`; includes visual helper unit tests and excludes `*.module.spec.ts` |
| One unit test | `./node_modules/.bin/vitest run --config vitest.mutation.config.ts path/to/file.spec.ts` | Also accepts `*.test.ts` paths |
| Lint one file | `./node_modules/.bin/eslint path/to/file.ts` | Checks the given source file |
| Client types | `npm run typecheck --workspace=@tt/client` | Client workspace |
| Server types | `npm run typecheck --workspace=@tt/server` | Server workspace |
| Standard checks | `npm run check` | Workspace type checks, lint, and unit tests |
| E2E tests | `npm run test:e2e` | Selects `*.module.spec.ts` through `vitest.e2e.config.ts`; requires Docker |
| All Vitest projects | `npm run test:all` | Unit, E2E, and visual helper projects from `vitest.all.config.ts` |
| Browser scenarios | `npm run test:visual -- --grep <pattern>` | Playwright scenarios using the Docker visual stack |
| Mutation smoke test | `npm run test:mutation:smoke` | Mutation smoke suite |
| Full mutation tests | `npm run test:mutation` | Full mutation suite |

E2E tests run in parallel forked workers and share a PostgreSQL Testcontainers instance. `npm run check` excludes E2E and browser scenarios; `npm run test:all` also excludes Playwright scenarios. CI runs E2E and visual regression separately from lint, types, and unit tests.

For visual test modes and stack startup/shutdown, see `packages/visual-tests/playwright.config.ts` and `packages/visual-tests/setup/environment.mjs`.

## Keeping this guide current

- Check this guide against the source and package scripts whenever architecture or tooling changes.
