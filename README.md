# SETUP

rename _example-env_ to _.env_

## Via docker

```
docker compose up --build
```

The visual regression stack uses a separate Compose project.

## Manual

### Requirements:

Node.js 22 or higher, PostgreSQL

- Start a PostresSQL db
- Edit data required to connect to db in .env file
- Initialize a schema and init data

```
  npm run i:all
  npm run db:init

```

- Build apps

```
npm run build
```

- Start apps

```
npm run start
```

# Simulation key bindings:

- **Left mouse button** to pick object
- **RIght mouse button** to rotate camera
- **WASD** to move camera

- Key **G** to pick object from container (bag, deck)
- Key **R** to roll die
- Key **H** to shuffle items in container
- Key **E** to rotate object clockwise (while picked)
- Key **Q** to rotate object counter clockwise (while picked)
- Key **F** to flip object (while picked)

# Games examples are located in /static folder

- **castles** - Castles of Burgundy
- **chess5** - 5 mas chess
- **demo** - demo game with supported objects

## Visual regression tests

The pinned Chromium/WebGL suite lives in the private workspace
[`packages/visual-tests`](packages/visual-tests). Validation history is recorded in
[the run record](packages/visual-tests/baselines/repeatability.md).

With your normal Nginx/database containers and local frontend/backend running,
use `npm run test:visual:dev` and enable **Watch all** in Playwright UI. This
uses the host Playwright browser after `npx playwright install chromium`.
`npm run test:visual` and CI manage their own isolated production application,
database, and browser.

Local managed runs require `flock` on PATH, provided by `util-linux` on Linux.
Runs using the same Compose project wait for an exclusive lock before any Docker
command and hold it through teardown. `VISUAL_LOCK_TIMEOUT_MS` sets the wait limit
in milliseconds, defaulting to one hour. Locking is skipped when `CI` or
`GITHUB_RUN_ID` is set, and in attached dev/headed modes. A missing `flock` or a
lock timeout fails setup without touching Docker.
