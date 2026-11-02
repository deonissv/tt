> Historical correction from 2026-10-10: earlier application fixes were reverted
> for that audit. Passing runs below qualify only their recorded source. The
> application fixes now live on `76-application-fixes`; this branch contains
> visual tests and tooling only. Historical combined-source runs do not qualify
> the tests-only branch.

# Visual suite qualification

The 2026-10-12 harness changes add focused movement/rotation baselines, visible
movement checks, bounded pixel comparisons, browser controls, and a command for
independent complete repeatability runs. The original visual-improvements review
is not included in this repository. The older qualification and performance
results below do not qualify the updated source.

The historical modular suite has one recorded canonical run. That version
accepted the broken persistence restore as a known defect, so it does not qualify
the corrected suite. The plan's ten-run repeatability qualification is not yet complete.

## Historical run (2026-09-14)

2026-09-14, `npm run test:visual`, pinned Docker environment, one worker,
no retries:

| Phase               | Cases passed | Runner duration |
| ------------------- | -----------: | --------------: |
| chromium-webgl      |           59 |       3964.14 s |
| persistence-save    |            1 |        117.18 s |
| persistence-restore |            1 |          2.15 s |

The WebGL phase began at 06:07:48 UTC; restore began at 07:16:02 UTC.
Durations are taken from phase JUnit reports and exclude Docker build/startup.
The runner exited successfully and removed its containers and database volume.

Passing known-defect cases means their documented signatures were reproduced;
it does not mean the underlying defects are fixed. In that historical run, the restore
case reproduced VIS-006. The current restore case requires successful restoration;
a fresh save/restart/restore passed during the 2026-09-22 audit remediation. VIS-007 accepts only its bounded, explicitly scoped
server/client physics drift signature and retains the differences as evidence.

## Audit verification (2026-09-23)

The audit expanded coverage to 74 cases in eight files. All 74
cases have passed across focused runs in pinned Docker Chromium/WebGL, using
one worker and no retries:

| Artifact phase                                      | Result                                                        |
| --------------------------------------------------- | ------------------------------------------------------------- |
| `audit-9-transforms`                                | 29 passed, including all seven dice flips                     |
| `audit-10-11-browser-2`                             | Five passed; deck setup failed and was corrected below        |
| `audit-10-deck-final-4`                             | Corrected deck depletion passed three independent repetitions |
| `audit-final-actions`                               | 38 passed, including a repeated configured-angle check        |
| `audit-2-save-7-1` through `audit-2-save-7-3`       | Three independent saves passed                                |
| `audit-2-restore-7-1` through `audit-2-restore-7-3` | Three restores passed, each after an application restart      |

Counts overlap: successful case names match all 74 discovered cases exactly.
These reports are segmented verification, not one complete canonical run.
The final persistence setup moves the extracted card clear of the deck and checks
that it rests on the table; the card remains dynamic and restore tolerances are
unchanged. Save phases took 148.5, 153.1, and 147.9 seconds; restore phases took
56.5, 55.7, and 55.6 seconds. Every restore verified the server state, both
15-actor clients, convergence, and exact contents. Each failed attempt and
correction was recorded in `010-audit.md`, which is not included in this repository.

Application logs contained only the ten allowlisted VIS-003 missing-model
diagnostics and no unexpected errors. Temporary probe specs were removed.

All 252 workspace/helper tests passed, including 87 visual helper tests.
Workspace type checks, lint, and Docker builds passed. Focused negative controls
verified that disabled input, incorrect transform angles, unrelated API errors,
invalid snapshots, and setup/cleanup failures cannot pass silently. Video probes
verified retained diagnostics for body, setup, and context-close failures.
The corrected initial-scene baselines were reviewed and passed comparison.

## Follow-up verification (2026-09-25–26)

The current suite has 77 cases in nine files. The follow-up adds signed local-axis
transform assertions, ownership checks, exact defect signatures, strict diagnostic
counts, action images, and before/after restart image comparisons. It also removes
duplicate context cleanup and capture types. Its separate `010-audit.md`
follow-up record is not included in this repository.

Focused results in pinned Docker Chromium/WebGL, one worker, no retries:

| Artifact phase            | Result                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `fix-known-defects`       | Empty-deck signature passed with 13 client actors and one connection                    |
| `fix-verified-baselines`  | All three action-image cases passed; six images reviewed                                |
| `fix-verified-compare`    | All three cases passed with baseline updates disabled                                   |
| `fix-persistence-save`    | Save passed after real shuffle, extraction, and roll input                              |
| `fix-persistence-restore` | Restore passed state and both canvas comparisons after an application restart           |
| `fix-render-negative`     | A deliberate 12×12-pixel overlay failed the image assertion (165 differing pixels)      |
| `fix-cleanup-probes`      | Setup/teardown failures retained all three videos; the passing case discarded its video |

The initial tile image attempt exposed an incorrect second hit test on an already
held, occluded item. Extraction now drags from the original cursor. An overlapping
drawn card caused variable contact poses, so image fixtures release clear of the
container. Their height assertions exposed an aliased first server snapshot;
cloning that snapshot preserves the first container render update. The new unit
regression failed before that fix and passed afterward.

The focused 560×400 image crops allow 100 differing pixels after observing 72
pixels of card-settling variation. The small overlay probe exceeds this budget
without changing application state. Committed PNG/JSON hashes remained unchanged
through the comparison, persistence, and negative-control runs. No initial-scene
baseline was regenerated during this follow-up.

Application logs after the rebuilt application's focused runs passed the strict
validator with no error allowances. A separate VIS-003 reproduction verified
exactly the three permitted missing-model diagnostics; HTML parser warnings are
no longer suppressed. Temporary probe changes were removed.

The final workspace/helper run passed all 284 tests, including 112 visual helper
tests. Workspace TypeScript checks and lint passed, with focused checks repeated
after the final changes. Local test discovery also succeeds on Node 22.9 after
loading Babylon's ES module asynchronously.

The 2026-09-25 complete canonical attempt was interrupted by a host shutdown
after eight completed passing cases and produced no final report. A second
attempt on 2026-09-26 reached 63 passing cases without test failures before
another host shutdown. Its console log is retained in
`test-results/visual-canonical-20260926.log`; it is not a complete passing run.
The stopped application's logs were recovered after reboot and passed the
strict validator, including exactly one verified VIS-003 diagnostic set.

The continuation passed all 12 remaining action cases (760.18 seconds), save
(155.69 seconds), and restore after a real application restart (63.40 seconds).
Its runner exited successfully after strict application-log validation with no
error allowances and removed its containers, network, and database volume.
The console log is `test-results/visual-remaining-20260926.log`; phase reports
are under `test-results/visual/{chromium-webgl,persistence-save,persistence-restore}`.

The 63 completed cases in the interrupted console log and the 14 passing cases
in the continuation's fresh JUnit reports match all 77 discovered cases exactly,
with no missing, duplicate, or extra cases. All ten PNG/JSON baseline hashes
remained unchanged. The inventory comparison is recorded in
`test-results/visual-verification-20260926.json`. Temporary probe specs are absent
and `git diff --check` passes. This is segmented verification, not one
uninterrupted canonical run, ten-run repeatability, or fresh CI qualification.

## Development iteration checks (2026-09-29–30)

The development command was exercised through the actual Playwright UI in pinned
Docker Chromium/WebGL. A card-flip image case passed five runs across client,
server, shared-library, and test-source edits. Saving during an active run
interrupted that run before application reload and automatically started the
next watched run. A client syntax error blocked runs until its repair. Server
boot IDs and served source verified that reruns used the edited application.
The six run results, including the intended interruption, are recorded in
`test-results/visual-dev-probe-result.json`; the UI event log is
`test-results/visual-dev-ui-events.jsonl`.

A separate request-only probe passed six runs covering initial readiness,
two successive atomic replacements each of HTML and CSS, and recovery after
an atomic server syntax-error edit. It confirmed baseline updates remained
disabled despite launching with `UPDATE_VISUAL_BASELINES=1`. Results are in
`test-results/visual-dev-atomic-result.json`. The probe exposed a lost native
file watch after atomic replacement; the final Chokidar watcher and its
filesystem regression test cover repeated replacements. Probe source edits
were restored and temporary scenario files removed.

The final helper checks passed 114 Vitest tests and eight coordinator/watcher
tests. Visual lint, TypeScript, shell syntax, and development Compose validation
passed. A fresh production Docker build and the canonical initial-scene case
passed (55.4 seconds), including both canvas images and JSON snapshots, with
strict application-log validation and container/volume cleanup. Logs are
`test-results/visual-dev-{unit,lint,types,canonical-smoke}.log`. All ten PNG/JSON
baseline hashes remain unchanged and discovery still reports 77 cases. This
focused verification does not rerun all 77 cases or complete the outstanding
qualification below. These checks exercised the former private UI adapter;
the native CLI implementation below replaces it and its cancellation behavior.

## Native Playwright lifecycle checks (2026-09-30)

The npm commands now start the supported Playwright CLI on the host. Global
hooks prepare and remove the Docker application, database, and pinned remote
Chromium. A fresh canonical initial-scene test passed, including both canvas
images and the JSON snapshots, strict application-log validation, and cleanup
(`test-results/native-canonical.log`).

Seven request-only runs through the stock Playwright UI passed. They covered
initial readiness, a test-source save during an active run and its queued
successor, two atomic HTML replacements, a CSS edit, and repair after a server
syntax error. The active test completed without interruption. Compiler failure
did not schedule a stale run; repair published a revision and triggered the
native watcher. Results are in `test-results/native-ui-result.json` and
`test-results/native-ui-probe.log`. All source probes were restored and their
temporary test removed. Ctrl+C removed the UI containers and database volume.

Playwright 1.63.0 UI defaults its own **Update snapshots** setting to **Missing**,
overriding config and CLI defaults. The development fixture rejected that mode
before test execution. Selecting **None** under **Testing Options** allowed
the seven runs above. This uses the native persistent UI preference.

The helper suite passed 110 Vitest tests and five coordinator/watcher tests.
Visual lint and TypeScript checks passed. Discovery reports 77 behavioral tests
plus the application-restart setup test. This focused verification does not
replace the complete-suite qualification still outstanding below.

A persistence-save attempt failed because an extracted card settled below
the table (Y = -2.69248 rather than above 0.8). This remains a hard failure.
Its two remote-browser videos were downloaded successfully, and its trace ZIP
passed an integrity check. Evidence is in `test-results/native-persistence-failure/`.

The subsequent isolated persistence invocation passed all three dependent
projects: save (2.7 minutes), restart (6.1 seconds), and restore (1.1 minutes).
Restore checked the saved state and both canvas images after a real application
restart. The restart dependency refreshed the host API endpoint because Docker
can reassign its ephemeral port. Strict log validation and teardown completed;
containers and the database volume were removed. The console log is
`test-results/native-persistence.log`, and the combined report is under
`playwright-report/visual/canonical/`. All ten committed PNG/JSON baseline hashes
remain unchanged. The earlier card-settling failure remains evidence of
intermittent physics behavior; this passing invocation does not establish
complete-suite repeatability.

## Configuration consolidation checks (2026-09-30 and 2026-10-01)

Mode selection, Compose file selection, project naming, application origin,
published port, and service selection now live in `playwright.visual.config.ts`.
The global setup and its returned cleanup function share
`tests/visual/runtime.mjs`; application watching lives in
`tests/visual/development.mjs`. The headed Compose override was removed.
`infra/visual` now contains nine container build and runtime files, down from 20.

The helper suite passed 112 Vitest tests and five watcher tests. Visual lint,
TypeScript, and formatting checks passed. Native CLI discovery and resolved
Compose configuration agreed for canonical, UI, development, and headed modes,
including the headed origin/port and development target. Actor selection listed
nine BAG cases; persistence selection included all three dependent projects.
Logs use the `test-results/config-consolidation-` prefix.

A fresh canonical invocation passed all four focused tests: initial rendering
(56.4 seconds), persistence save (2.6 minutes), application restart (6.1 seconds),
and restore (58.3 seconds). It checked the committed initial-scene images/JSON
and both before/after restart canvases. The returned setup cleanup function
validated application logs and removed the containers and database volume.
The complete invocation took 6.6 minutes including the build and startup;
its console log is `test-results/config-consolidation-canonical.log`.

The relocated development helper passed seven request-only runs through the
native UI: initial readiness, an active test and its queued rerun after a test
edit, two atomic HTML saves, a CSS save, and recovery after a server syntax
error. Results are in `test-results/config-consolidation-ui-result.json`.
The temporary source edits were restored, the probe test was removed, and
Ctrl+C completed the returned cleanup function. This remains focused validation;
the full 77-case suite was not rerun for this configuration change.

## Development runtime simplification checks (2026-10-01)

The separate `dev-app.mjs` reload server and host-side source watcher were
replaced with the existing Vite and webpack watch commands. Shared build hooks
in `tests/visual/development.cjs` publish the dependency used by native
Playwright watch. Readiness verifies the backend build ID as well as both build
states. `infra/visual` contains eight files; its entrypoint only prepares the
database and launches nginx and the application commands.

Local checks passed 96 visual helper tests and seven build-hook tests. The
latter exercised real webpack rebuilds, failed compilation and repair,
backend process replacement, asset invalidation, real Vite watching of repeated
atomic source/HTML saves, client syntax-error recovery, and readiness rejection
of stale builds. Client hook checks also covered edits during validation,
retention of failed inputs, and shutdown during a transform. The Node tests
were invoked directly with `node tests/visual/development.test.mjs` because
this environment blocks the subprocess output capture used by `node --test`.

Visual lint and type checks, lint of the changed application files, and a
focused type check of the Vite config passed. The application's development
webpack configuration compiled with its backend launch plugin omitted for this
compile-only check. Vite resolved the application config in normal and visual
modes. Native Playwright discovery listed 75 WebGL tests. Compose configuration,
shell syntax, formatting, and baseline hashes were also checked.

The 16 subprocess lifecycle tests could not run: this sandbox rejects their
`spawnSync` output capture with `EPERM`. Docker socket access was also denied,
so Docker startup, shutdown, and native UI reruns have **not** been requalified
for this version. The earlier UI checks above apply to the previous runtime.
A broader client-config type check encountered an existing simulation test mock
missing `onRoll`, `onShuffle`, `onFlip`, `onCW`, and `onCCW` callbacks. Logs for
this round use the `test-results/runtime-simplification-` prefix.

## Frontend isolation checks (2026-10-02)

Historical setup: the visual Vite wrapper described below has since been
removed. Local visual development now uses the ordinary host Vite process;
see [the current workflow](../../../README.md#visual-regression-tests).

The frontend visual-test reader, capture types, simulation globals, renderer
flags, and application Vite hook were removed. Development settings now extend
the original application config from `tests/visual/vite.config.mts`. Browser
checks use DOM readiness, ordinary input, WebSocket observations, and Playwright
screenshots. Server snapshots remain for logical outcomes and persistence.
The toast and tile-stack application fixes remain; temporary browser probes
restore the frontend files they edit.

Local verification passed 102 visual helper tests and seven build-hook tests,
including the previously blocked lifecycle subprocess checks. The tile-stack
regression, production client build, server build type check, visual lint/type
checks, and changed application-file lint passed. Playwright discovers the same
75 WebGL cases. Two real-browser screenshot probes verified that equal canvases
pass, different canvases fail, and temporary reference images are removed.

The initial focused canonical run passed initial loading, card rendering, a real
die roll, repeated movement, and late join/reconnect. Its two extraction image
failures exposed a test input race: pressing the mouse before client asset
construction finished picked the container. The helper now waits for an outgoing
movement action for the extracted identity before pressing down. A regression
checks this delayed-loading sequence. Dragging and releasing are separate helper
steps, so extraction also waits for the held actor to finish moving before
release. Tile-stack rendering then passed its
existing PNG baselines. Center targeting changes the extracted card's final
position slightly; the two deck PNGs were reviewed and updated for that input
path. The screenshot tolerance remains unchanged. The other seven PNG/server
JSON baselines retain their original hashes; the private client JSON baseline
was removed.

Native development UI checks passed four runs: initial startup, two automatic
reruns after atomic HTML edits, and recovery after a client syntax error. The
automated probe used one UI client with desktop URL opening suppressed. Earlier
probes competed with an automatically opened desktop UI tab; a separate probe
failure came from its stale expected title. Application files were restored and
the temporary test was removed after verification.

The first new persistence round trip passed save and restart, then rejected an
extracted card that fell through the table during server restoration. It failed
before opening the browser, with saved Y=0.8485 and restored Y=-0.9003. No
persistence tolerance or expected failure was added. This failure is retained in
`test-results/frontend-isolation-persistence.log` and its phase report. The next
isolated invocation passed save (3.1 minutes), restart (11.2 seconds), and restore
(1.4 minutes), including both before/after restart canvas comparisons. Its
read-only deck image check failed with 133 differing edge pixels against the
unchanged 100-pixel limit. Logs are in
`test-results/frontend-isolation-qualified.log`; teardown removed the containers
and database volume. The passing persistence invocation does not establish
repeatability or erase the earlier physics failure.

After adding the held-movement wait, the deck case passed both reviewed PNGs
with baseline updates disabled and the same 100-pixel limit (1.5 minutes).
Its invocation completed log validation and removed the containers and volume;
the console log is `test-results/frontend-isolation-stationary.log`.
The final invocation passed two repetitions each of deck and tile-stack
rendering, with baseline updates disabled and the original tolerances. All four
cases passed, application-log validation completed, and teardown removed the
containers, network, and database volume. The console log is
`test-results/frontend-isolation-repeat.log`. Final local checks again passed
102 visual helper tests, seven build-hook tests, visual lint, and visual type
checking. No temporary probe specs or cross-player reference images remain.

Logs and reports for this round use the `frontend-isolation` prefix. These
focused checks do not establish a complete-suite pass or ten-run repeatability.

## Public interface checks (2026-10-02)

The suite's remaining application hooks were removed: the server visual-test
module and controller, special room-close method, internal mesh captures,
direct persistence writes, and health/build-ID endpoint. Logical observations
use the ordinary authenticated `STATE` response. An independent participant
opens and closes each snapshot connection without holding a tested player's
actor. Cleanup sends the author's normal `CLOSE` action; persistence closes
through the UI. Rendering assertions use PNGs. The eight PNG baselines retained
their hashes, and the private server JSON baseline was removed.

The normal room close flow now stops simulation before saving, disposes its
resources, and avoids repeated/delayed closure. Restart evidence comes from
Docker's container start timestamp. Development readiness records Node's public
listening event in the launcher and checks the normal protected API response.
Application logs remain diagnostic artifacts; assertions no longer depend on
exact backend logger messages or private class names.

Local checks passed 98 visual helper tests, seven build-hook tests, and 23 room
lifecycle tests. Seven of the helper tests exercise real HTTP/WebSocket fixtures,
including independent observer identity, author cleanup, malformed messages,
and unrelated handshake errors. Visual types and lint passed. A live HTTP probe
confirmed all four former test routes return 404 and the protected API returns
401 without authentication; results are in
`test-results/public-contract-removed-routes.json`.

The first focused invocation passed deck rendering, tile-stack rendering, and
initial loading against the unchanged PNGs. Persistence failed before execution
because a static ESM runtime import was incompatible with the host loader; the
runtime import now follows the existing dynamic restart import. The failure
record remains in `test-results/public-contract-browser.log`.

The subsequent invocation passed all seven selected cases: actor movement,
empty-deck readiness, late join/reconnect, repeated movement, persistence save
(3.2 minutes), application restart (6.6 seconds), and restore (1.4 minutes).
Restore compared public state and both before/after restart canvases. Teardown
removed the containers, network, and database volume. The console log is
`test-results/public-protocol-browser.log`.

Six native UI runs passed startup, two atomic HTML saves, client syntax-error
repair, a backend edit, and backend syntax-error repair. Neither failed compiler
scheduled a stale run. Results are in
`test-results/public-interface-dev-result.json`; the probe log is
`test-results/public-interface-dev-probe.log`. Application files were restored
and the temporary watch test was removed. Interrupting Playwright removed the
development containers, network, and database volume. This remains focused verification;
the full suite and ten-run repeatability were not requalified.

## Support simplification (2026-10-02)

Support implementation decreased from 1,498 to 1,304 lines. The recursive state
comparator decreased from 339 to 176 lines while retaining actor identity,
container order, finite-value, shape, and orientation checks. Settling shares
Playwright's native polling, diagnostic attachments share serialization, and
scenario creation owns its checkpoint methods without an additional wrapper.
The clone wrapper and its test were removed in favor of `structuredClone`.

Local verification passed 99 helper tests and seven build-hook tests, visual
lint, and visual types. Polling checks confirm fixed-anchor settling and that
API errors propagate without retry. Its timeout test uses real timers because
Playwright uses a monotonic deadline. Evidence is in
`test-results/support-simplification-unit-final.log` and the corresponding
`support-simplification-{lint,types}-final.log` files.

Three canonical Chromium cases passed: late join/reconnect, deck extraction
rendering, and initial scene loading. The run took 5.5 minutes and removed its
containers, network, and volume. The eight committed PNGs remain unchanged;
application code was untouched. Browser evidence is in
`test-results/support-simplification-browser.log`. The full suite and ten-run
repeatability remain outstanding.

## Historical manual workflow checks

- Actor and behavior selection lists separate cases; BAG selects eight cases
  and roll selects seven.
- Docker UI mode served its browser interface on loopback port 9323. The later
  development checks above verified test execution and watch selections by
  clicking inside that interface.
- Host headed Chromium could not launch on the available display. Its preflight
  now fails promptly with guidance to use Docker UI mode. Successful headed
  execution still requires validation on a working desktop display.

## Outstanding acceptance evidence

- Ten consecutive complete runs of the current suite.
- Fresh CI and cold-load qualification, with resource measurements.
- Completion of the plan's negative controls and baseline review.
- Repository administrator configuration of the required CI status check.

Earlier runs of the pre-modular suite are not counted toward the current
qualification. Raw local reports are ignored artifacts and may be replaced by
subsequent runs; retain or archive them when collecting further evidence.

## Historical supporting checks

The repository unit-test command passed all 179 tests (including 20 visual
helper tests). Workspace and visual TypeScript checks passed. Client, server,
and visual lint passed after fixing the environment declaration scope and the
conditional test-module import's lint annotation; these changes do not alter
runtime behavior.

`npm audit --omit=dev --audit-level=high` failed with 36 dependency findings:
4 low, 11 moderate, 19 high, and 2 critical. Dependency remediation is outstanding.

## Room startup overlap (2026-10-18)

Scenario setup now opens both isolated players while the server simulation
settles, then retains the existing final room-stability check. Named Playwright
steps separate room creation, player loading, and final stability. Fixtures,
physics, rendering settings, screenshot tolerances, and stored images are unchanged.

Five BAG movement repetitions passed before the change and five passed after it,
using attached development services, one worker, and traces off. The UI run was
stopped for the clean comparison; a separate contended batch is excluded.

| Median duration | Before         | After          | Reduction |
| --------------- | -------------- | -------------- | --------- |
| Scenario setup  | 11.949 seconds | 8.083 seconds  | 32.4%     |
| Complete test   | 21.255 seconds | 18.531 seconds | 12.8%     |

Timing records are retained locally under `test-results/visual/startup-timing/`.
The measured selection was `--project=chromium-webgl` with
`--grep '(?=.*@actor:BAG\b)(?=.*@behavior:move\b)' --repeat-each=5` in `VISUAL_MODE=dev`.

All 157 visual helper tests, visual lint, and visual type checking passed.
Managed-stack late join/reconnect and the complete persistence round trip passed.
Initial full-scene loading reached its stored-image checks but failed on the
existing tile-stack image difference. Repeating that scenario with the original
setup also failed; its actual PNGs were pixel-identical to the optimized setup
for both players. Reports are under `playwright-report/visual/startup-check/` and
`playwright-report/visual/startup-baseline/`. No baselines were updated, and these
focused checks do not establish a complete-suite pass.

## Focused actor fixtures (2026-10-18)

An interleaved development benchmark compared full-room and single-actor BAG
and DIE20 movement cases over five repetitions each. All 20 cases passed using
the same table, actor positions, gravity, two isolated players, and movement
and canvas assertions. Traces and video were off, with one worker.

| Actor and median duration | Full scene     | Single actor   | Reduction |
| ------------------------- | -------------- | -------------- | --------- |
| BAG setup                 | 8.129 seconds  | 4.959 seconds  | 39.0%     |
| BAG complete test         | 16.836 seconds | 13.367 seconds | 20.6%     |
| DIE20 setup               | 7.365 seconds  | 5.628 seconds  | 23.6%     |
| DIE20 complete test       | 15.056 seconds | 13.313 seconds | 11.6%     |

The benchmark source, configuration, per-run timings, and summary are retained
locally under `test-results/actor-fixture-benchmark/`. Its command was
`VISUAL_MODE=dev npx playwright test --config test-results/actor-fixture-benchmark/playwright.config.ts --repeat-each=5`.

The shared fixture builder now accepts an actor GUID selection after parsing,
validation, placement, and variant application. Container contents stay intact.
The suite has 75 cases starting with one actor, one targeting case starting with
two actors, full-scene loading and persistence cases retaining all 14, and three
canvas controls that need no room. Test names, tags, gravity, player isolation,
action assertions, and screenshot tolerances remain unchanged. Container count
checks use the initial count plus the expected extraction instead of assuming
every room starts with 14 actors.

All 170 visual helper tests, visual lint, and visual type checking passed.
Canonical validation started with
`COMPOSE_PROJECT_NAME=tt-visual-focused-actors VISUAL_MODE=canonical VISUAL_ARTIFACT_PHASE=focused-actors npm run test:visual`.
That invocation was interrupted after the 42 actor-matrix cases completed;
their outcomes are retained in `test-results/visual-focused-actors.log`.
Validation resumed with
`COMPOSE_PROJECT_NAME=tt-visual-focused-actors-rest VISUAL_MODE=canonical VISUAL_ARTIFACT_PHASE=focused-actors-rest npm run test:visual -- containers.visual.ts multiplayer-lifecycle.visual.ts random-actions.visual.ts render-actions.visual.ts scene-loading.visual.ts screenshot-controls.visual.ts targeting.visual.ts persistence.visual.ts`.
Its 39 cases completed, with a report at
`playwright-report/visual/focused-actors-rest/` and JUnit results at
`test-results/visual/focused-actors-rest/results.xml`.

Together these runs exercised all 81 unique cases: 63 passed and 18 failed,
with none skipped. The coverage audit is retained in
`test-results/actor-fixture-benchmark/acceptance.json`. All rolls, targeting
cases, screenshot controls, and persistence passed. Failures comprise 12
held-transform direction/axis checks, empty-deck reconnects, a deck-depletion
server crash, competing-player ownership, disconnect release, and the two
stored-image checks involving tile stacks.

Nine comparison cases used the original scenario sources from the index,
including their full-room fixtures. Eight failed with the same signatures:
pawn flip, DIE4 rotation, and all six non-matrix failures. The generic actor
flip passed in that comparison, so this failure is intermittent; the earlier
full-room `performance-candidate-mesa/results.xml` records its direction/axis
failure. Existing server `actor-transforms.spec.ts` expected-failure controls
also reproduce the axis defect. Comparison sources and configuration are in
`test-results/actor-fixture-original/`, with results at
`test-results/visual/actor-fixture-original/results.xml` and a report at
`playwright-report/visual/actor-fixture-original/`.

The canonical suite therefore remains failing on existing application behavior
and stored-image differences. No application code, baselines, or screenshot
tolerances were changed for this optimization. Managed validation stacks were
removed after the runs; the user's existing development stack was retained.

## Prisma datasets and parallel rooms (2026-10-18)

Fixture setup now uses `fixtures/dataset.ts` to insert each test's users, game,
game version, room, and initial game-load progress in a Prisma transaction.
Player and observer JWTs are signed locally with the application's secret.
The only setup HTTP write starts the seeded room's production simulation.
Test teardown waits for room closure and deletes only its own dataset records;
shared roles, permissions, tables, and sequences are retained.

The WebGL project now schedules tests in parallel with two workers by default.
Replacement workers do not restart the shared application. Persistence is its
teardown project, so the explicit application restart happens after all WebGL
workers finish, even when a WebGL case fails. Focused action runs can use
`--no-deps` to omit persistence.

The initial five-case parallel run exposed an application defect: Babylon's
implicit last-created scene put a room's actors into another room. The BAG
movement case failed with a missing actor while DIE20's room received both
actors. Evidence is in `test-results/visual-prisma-parallel.log` and
`test-results/visual-prisma-parallel-live.log`. Actor/model/table loading and
container extraction now carry their owning scene explicitly. Actor transform
nodes also use their model's scene. Server regression tests cover simultaneous
initialization and extraction after a different room is created.

Two real-database checks ran on two workers, with four active rooms in total.
Each worker closed and deleted one dataset, verified its users/game/room were
removed, and confirmed the other room remained live with its original actor
and game version. Both passed. Sources and configuration are retained in
`test-results/prisma-isolation/`; results and service logs are under
`test-results/visual/prisma-isolation/`.

All 168 visual helper tests and all 136 server unit tests passed. Visual and
client/server type checks, visual lint, and lint for the changed application
files passed. These checks cover the dataset API, independent observer tokens,
scoped cleanup, environment settings, and scene isolation.

The final canonical selection passed all 12 cases: 11 gameplay/rendering cases
on two workers, followed by the persistence save/restart/restore test. Selection
covered BAG and DIE20 movement, extraction from each container type, two-target
precedence, late join/reconnect, and four stored-image action checks. Before
persistence restarted the app, PostgreSQL contained only its one room, one game,
one game version, and three fixture users; the preceding 11 datasets had been
removed. Results are in `test-results/visual/prisma-final/results.xml`, with
`test-results/visual-prisma-final.log` and
`playwright-report/visual/prisma-final/` retaining the run evidence.

A local development BAG movement case also passed using the repository `.env`
for its Prisma connection and JWT secret, with no manual environment overrides.
Its log is `test-results/visual-prisma-dev.log`. Both managed validation stacks
were removed; the existing development stack was retained. These focused runs
do not establish a full-suite pass, and no PNG baselines or tolerances changed.

## Native Playwright fixtures (2026-10-19)

Scenarios now import `test` and `expect` from `tests/visual/test.ts`, declare
their fixture options with `test.use`, and use native `page`, `context`, and
`storageState` fixtures. Tests call domain actions and ordinary assertions
directly. Eight former support modules were removed; physics and rendering
rules remain in dedicated modules. The support folder has seven runtime modules
instead of thirteen. Per-test Prisma datasets, parallel rooms, isolated player
identities, physics tolerances, and strict behavioral assertions remain in place.

Discovery matches all 81 original case names and tag sets. The comparison used
the indexed sources in an ignored directory, so their former fixtures could be
discovered independently. Evidence is retained in
`test-results/native-coverage.json` and the original/current discovery reports.
All 143 visual helper tests, visual lint, visual type checks, and formatting
checks passed. Tests for deleted lifecycle wrappers were removed; retained
domain rules still have unit coverage.

The canonical selection passed all 20 cases: 19 WebGL gameplay, rendering, and
screenshot-control cases on two workers, followed by persistence. Coverage
included BAG movement/rotation/flip, DIE20 movement, all three container types,
empty-bag extraction, late join/reconnect, a real DIE6 roll, both selected
targeting cases, four committed action-image checks, and all three screenshot
controls. Results are in `test-results/visual/native-final/results.xml` and
`playwright-report/visual/native-final/`, with the invocation retained in
`test-results/visual-native-final.log`. A development BAG movement preflight
also passed using the normal local database and JWT configuration.

The first canonical attempt exposed pointer highlights left behind after the
old checkpoint preparation was removed. Screenshot helpers now clear pointer
highlights and wait for transient toasts and real frames before comparing.
The final 20-case run includes the previously affected image comparisons.
That first run also hit the existing intermittent BAG flip direction/axis
failure. Three repetitions with the original indexed fixtures reproduced it
once, with two passes. Evidence is in `test-results/visual-native-original.log`.
The strict transform assertion was retained.

Four additional controls enabled native traces and video. A deliberate body
assertion failure produced screenshots, videos, and trace data for both players.
A deliberate setup failure retained the author's native failure artifacts.
The tests after each failure passed and found exactly their own room, game,
and three users, confirming cleanup across replacement workers. The body
control also checked that the extra context inherited the author's viewport
and user agent. This probe intentionally exited with two failures and two
passes; evidence and its audit are under `test-results/visual/native-artifacts/`.

The separate full-scene loading check still fails its existing stored-image
comparison. Both players' actual PNGs are pixel-identical to those from the
original fixture control and earlier startup checks. Results and service logs
are under `test-results/visual/native-scene/`. No baselines were updated.
These focused checks do not establish a full-suite pass or a new startup-time
improvement. Managed validation stacks were removed, and the existing
development stack was retained.

## Further implementation cleanup (2026-10-19)

Removed 313 net TypeScript/JavaScript lines, including 218 runtime helper lines.
One `seedRoom` function now returns cleanup for its own records, replacing the
multi-room dataset manager and its extra fixture. Room credentials contain only
the tokens used by the tests. The manifest is one TypeScript file without unused
capability metadata. Snapshot comparison uses explicit transform tolerances and
reports differing paths; the generic wildcard rules and diagnostic categories
were removed.

Also removed custom guest/restored video handling, automatic passing-state dumps,
duplicate screenshot attachments, the attached-mode HTTP readiness preflight,
unused Docker configuration fields/address wrappers, redundant settling waits,
and unused helper arguments and return values. Native failure screenshots and
traces cover all participants; native video still records the author page.

All 81 case names and tag sets match the original discovery. A comparison against
the indexed fixture builder produced identical state for all 165 combinations
of variants and actor selections. The snapshot comparator matched the previous
acceptance results in 159 boundary, identity, ordering, and invalid-value checks.
Audits are retained in `test-results/prune-*-audit.json`.

Visual lint, type checks, formatting, and all 143 helper tests passed. The
canonical selection passed 22 WebGL cases and the persistence round trip, with
results under `test-results/visual/pruned/`. Six additional cleanup controls
intentionally produced three failures: in a test body, page setup, and room
startup. The test following each failure passed with exactly its own room, game,
and three users. Screenshots, traces, native author video, and service logs are
under `test-results/visual/pruned-cleanup/`.

An attached development BAG movement case passed with tracing in 17 seconds.
Its first attempt timed out on a blank frontend; a direct frontend visit rendered
normally, and the traced rerun passed. The initial blank-page cause was not
established. These focused checks do not qualify the entire suite. Application
code, stored images, and comparison tolerances are unchanged. Managed validation
stacks were removed, and the existing development stack was retained.

## Tests-only branch split (2026-11-01)

All application, library, accessibility, and shared development Docker changes
were moved with their regression tests to `76-application-fixes`, commit
`69556f1`. Both branches start from upstream `8a73e3b`; the visual branch does not
include that application commit. Its remaining changes are visual tests, test
configuration, dependencies, artifact ignores, and documentation. Existing
application dependency lock entries are unchanged.

Fresh validation of the tests-only branch passed 339 workspace unit tests,
including 144 visual helper tests, plus workspace type checking, lint, and the
production build. Discovery retains all 81 canonical cases, two configured
workers, and zero retries. Strict behavioral and image assertions remain intact.

The native configured-rotation-step scenario passed against the unchanged
application. It opened the existing Material UI settings icon, selected each
slider through its visible label container, checked both rotation directions,
and compared both players' rendered canvases. Its JUnit and HTML reports are in
`test-results/visual/branch-split-smoke/` and
`playwright-report/visual/branch-split-smoke/`. The managed stack and volume were
removed; the existing `tt-db` and `tt-nginx` containers were retained.

The separate application branch passed a clean dependency installation, Prisma
generation, all 240 of its workspace unit tests, type checking, lint, and build.
These checks establish the branch split and the focused UI compatibility case.
They do not establish a complete browser pass for the tests-only branch.
Application defects remain exposed until the fixes are merged separately.
