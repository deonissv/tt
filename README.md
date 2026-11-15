# TT

TT is a multiplayer tabletop simulator. It loads Tabletop Simulator JSON saves and keeps players in sync over WebSockets.

## Getting started

### Requirements

- Node.js 22 or higher and npm. CI uses Node.js 22.
- PostgreSQL for local development.
- Docker Compose for the Docker development environment and container-based tests.

### Local development

Run commands from the repository root. The project uses npm workspaces.

1. Install dependencies with `npm ci`.
2. Copy `example-env` to `.env` and configure it for your local PostgreSQL database. Database scripts load `.env` through dotenv-cli.
3. Start PostgreSQL, then run `npm run db:init` to generate Prisma types, push the schema, and seed data. Check the target database first, since this command changes its schema and data.
4. Start the client in one terminal:

   ```bash
   npm run client dev
   ```

5. Start the server in another terminal:

   ```bash
   npm run server dev
   ```

The root `npm run dev` script also tries to start `packages/shared`, which does not exist. Use the separate commands above.

### Other commands

| Task | Command |
| --- | --- |
| Build the application | `npm run build` |
| Start the built application | `npm run start` |
| Generate Prisma types without changing the database | `npm run db:gen` |
| Generate types, push the database schema, and seed data | `npm run db:init` |
| Start the Docker development profile | `npm run docker:dev` |

### Docker setup

Create `.env` from `example-env` and configure it for the Docker environment, then run:

```bash
docker compose up --build
```

The visual regression stack uses a separate Compose project.

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

## Mutation tests

Run `npm run test:mutation:smoke` for a quick check, or `npm run test:mutation`
to mutate application code, shared libraries, and visual-test helpers against
the unit tests. Open `reports/mutation/index.html` to inspect the results.
