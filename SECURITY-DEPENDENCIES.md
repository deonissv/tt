# Dependency security update

Prepared from `origin/main` at `9b12a8a` on 2026-11-04.

The GitHub Dependabot alert endpoint returned HTTP 401 in this environment.
These findings come from `npm audit` against the repository lockfile, so they
have not been matched to the repository's private alert numbers.

## Changes

- Upgrade the NestJS framework and matching adapters to 11.2.8, with compatible
  Config, JWT, Passport, Swagger, mapped types, CLI, and testing packages.
  This also moves the HTTP adapter to Express 5 and its matching TypeScript types.
  Update the JWT expiry configuration type to match the new signing options.
- Upgrade Vite to 6.4.5 and every Vitest declaration to 4.1.12. Vitest 4 removes
  the vulnerable Tinypool dependency. Replace the removed worker options and
  migrate `vitest.workspace.ts` to `vitest.all.config.ts`. Keep dependency
  directories excluded and isolate unit-test modules so one test file cannot
  reuse another file's unmocked implementation. Give projects distinct execution
  groups because their worker limits differ.
  `npm run test:all` runs that combined project configuration; `npm test` retains
  the workspace test commands.
- Update CASL, Axios, React Router, WebSocket, and Testcontainers dependencies,
  and refresh transitive dependencies in the lockfile.
- Override Nest's pinned Multer and Swagger YAML dependencies with patched
  releases in the same major. Override Dockerode's UUID dependency with the
  patched CommonJS-compatible 11.x release; Dockerode only uses its unchanged
  `v4()` API. Declare the existing body-parser import directly.
- Preserve the original BabylonJS and Havok versions in the lockfile. Pin
  unplugin-swc to 1.5.9 and use Testcontainers 11.14.0 to avoid introducing a
  higher Node requirement than the existing Docker images.
- Declare React Router's synchronous navigation return type for the existing
  BrowserRouter, following its documented type augmentation. Update a screenshot
  mock's completion callback type for Vitest 4.
- Install Chokidar 4 explicitly for Nest's Angular tooling peer dependency, while
  retaining Chokidar 3 where other tools require it.

## Audit results

| Severity                  | Before | After |
| ------------------------- | -----: | ----: |
| Critical                  |      6 |     0 |
| High                      |     38 |     0 |
| Moderate                  |     24 |    22 |
| Low                       |     10 |     1 |
| Total vulnerable packages |     78 |    23 |

The remaining 23 package findings trace to three advisories, including the
packages npm marks vulnerable because they depend on an affected package:

| Advisory                                                                 | Remaining dependency                                                                        | Constraint                                                                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | Minimatch in ESLint, TypeScript lint tooling, archive tooling, and the webpack type checker | The fix requires Minimatch 11. Parents still require earlier majors, including the callable API from Minimatch 3. |
| [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | Glob in the Nest CLI and archive tooling                                                    | Patched Glob 14 is outside the parents' declared major ranges.                                                    |
| [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) | Deepmerge in fork-ts-checker-webpack-plugin                                                 | No patched release is published.                                                                                  |

`npm audit --omit=dev` reports three remaining package findings: Minimatch,
Deepmerge, and their parent fork-ts-checker-webpack-plugin. The plugin is
declared in the server's runtime dependencies but used by its webpack build
configuration. These are build dependencies; this branch does not claim a clean
production dependency audit.

Do not apply `npm audit fix --force` to clear the remaining findings: its
suggested downgrades include old webpack type-checker and Testcontainers versions.
Follow-up work should update or replace the affected tools without forcing
incompatible transitive APIs.

## Evidence

Worktree-local audit reports, routing records, failed resolver attempts, and
validation logs are retained under the ignored `logs/security-alerts/` directory.
The lockfile was regenerated with npm 11 after npm 10's resolver crashed with
`Cannot read properties of null (reading 'edgesOut')`. Installation is verified
separately with the normal npm 10 `npm ci` command.

Validation used Node 22.23.4 and npm 10.9.9:

- `npm ci --no-audit --no-fund` and `npm run db:gen` passed.
- `npm run lint`, `npm run typecheck`, and `npm test` passed.
- `npm run test:all -- --no-file-parallelism` passed after the UUID update:
  64 files, 425 tests passed, and 1 skipped. This includes the PostgreSQL-backed
  integration tests and the visual test harness's unit tests.
- Server and client production builds passed.
- Prettier and `git diff --check` passed for the changed files.
- `npm run test:visual -- --update-snapshots=none` passed on 2026-11-04:
  81 browser tests across 9 files, with no failures or skipped tests. This includes
  screenshot comparisons and save/restore across an application restart.

The browser suite ran in canonical Docker mode with baseline updates disabled.
All 12 baseline PNGs were verified unchanged. Completion evidence is retained in
`logs/security-alerts/validation-visual.json` and `visual-browser.log`; the HTML
report is `playwright-report/visual/security-alerts/index.html`.

After resolving Nest's optional Chokidar peer dependency, the clean install,
`npm ls --all --json`, Nest CLI invocation, and both production builds passed
again. The final lockfile audit still reports the three advisories above.
