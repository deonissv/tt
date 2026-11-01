# Scenario inputs

`scene.json` is the reviewed public game-save input for the visual suite. It fixes
the Rectangle table, fourteen actor identities, their initial transforms, and
container contents. Every test receives an independent copy. Asset URLs use
`http://visual-assets.invalid` as a placeholder replaced with the test asset origin.

The suite loads this data without running the application's parser, builders,
simulation, or rendering code. Changes to production parsing cannot silently
change the visual test inputs. Parser behavior is covered by the parser's own tests.

`demo.ts` selects actors, applies reviewed settled start poses for interactions,
and applies explicit variants such as an empty bag, a face-down deck, or a locked
actor. Changes to the reviewed scene require reviewing
the existing image baselines and scenario expectations.

`render.ts` contains the centered, low-gravity rendering inputs shared by the
baseline scenarios and coordinate preparation. `targeting/coordinates.json` stores
reviewed click points for these layouts and the ordinary scene. Tests read these
points directly in native Playwright mouse and keyboard calls. Coordinate discovery only runs via
the explicit preparation command documented in `targeting/README.md`.

`dataset.ts` creates accounts and uploads the save through public HTTP endpoints.
The room starts after both browser players have signed in. Cleanup deletes the
created room, game, and accounts through their public endpoints, including after
partial setup failures. Account tokens come from the server. Browser authentication
uses the Login screen and follows the application's normal session handling.

`test.ts` exposes each browser participant as `{ page, connection }` through the
`player` and optional `guestPlayer` fixtures. Each fixture owns its connection
observer, registers it before room navigation, and removes its listener during
teardown. `connection.socket` returns the latest open room socket, while
`connection.connectionCount` counts room connections observed on that page.
