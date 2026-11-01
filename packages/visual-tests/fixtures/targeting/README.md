# Recorded mouse inputs

`coordinates.json` stores reviewed click points relative to the canvas at
1280x720 with the default fixture camera. `default` covers every initial actor
after normal settling. Variant entries override points where a locked actor or
different container height changes its appearance. `render` covers the centered
rendering inputs from `fixtures/render.ts`.
`after-clockwise` records released positions after a held clockwise rotation.
An actor can settle away from its initial click point after release. The DIE6
follow-up point lies inside both the preparation silhouette and the observed
right-shifted settled silhouette; the previous point missed the latter.

`poses.json` freezes the reviewed settled transforms used to start ordinary
interaction scenes. Gravity and real physics remain enabled. Static screenshot
scenes retain the original save's positions, and centered rendering inputs retain
their explicit positions and rotations. This prevents variable falls from changing
the initial click point between runs.

The ordinary card starts at Y=1.2 so it falls onto the felt from above. Its
previous recorded center at Y=0.848535 started inside the Y=0.85 felt surface,
allowing contact resolution to hide the card below the table on some runs.

Scenarios read these points directly and call Playwright's mouse and keyboard
APIs. The fixture canvas fills the viewport, so recorded canvas points are page
coordinates. There is no runtime target resolver, registry, or destination tracker.
For repeated interactions, the scenario reads the explicit reviewed `destinations`
entry or `after-clockwise` profile for its next click. The mouse endpoint and a
released actor's next click point can differ because held objects are lifted
above the table and dice can roll after release.

Prepare candidate inputs explicitly:

```sh
npm run prepare:targets --workspace=@tt/visual-tests
```

The separate preparation run creates isolated accounts and games through public
APIs and signs in through the UI. It generates each representative scene, finds a
candidate point from a screenshot, and confirms the public pick action for unlocked
actors. It records initial settled poses and the follow-up points for repeated
dragging, extraction, and die rotation. It writes `coordinates.candidate.json`,
`poses.candidate.json`, original screenshots, and images
with magenta target crosses beneath `test-results/visual/target-preparation/`.
Review every marked point before copying candidate entries into `coordinates.json`.
For small released pieces, compare additional settled screenshots and choose a
point inside their overlapping silhouettes. Review and copy `poses.candidate.json`
into `poses.json` when updating initial positions; follow-up point changes do not
require new initial poses. The preparation command never overwrites existing
coordinates, poses, or assertion baselines. Run the affected scenarios after review.

`empty-table.png` is the reviewed background used only by preparation. It contains
the Rectangle table and no actors at 1280x720. Update and review it when the table's
expected appearance changes. Ordinary tests and baseline-update commands do not
consume or regenerate this background.
