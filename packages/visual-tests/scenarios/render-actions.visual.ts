import { buildRenderFixture } from '../fixtures/render';
import { manifestActor } from '../fixtures/manifest';
import { ClientAction } from '@tt/actions';
import coordinates from '../fixtures/targeting/coordinates.json';
import { captureRoom } from '../support/api';
import { getActor, waitForActorStable, waitForRoomStable } from '../support/physics';
import { positionChanged, rotationChanged } from '../support/transforms';
import { waitForRenderedFrames } from '../support/rendering';
import { captureCanvases } from '../support/screenshots';
import {
  test,
  expect,
  expectClientAction,
  expectSpawnedActor,
  expectChangedCanvases,
  expectStoredScreenshot,
} from '../test';

// Keep stored PNGs on SwiftShader even when the host exposes a hardware GPU.
test.use({
  channel: '',
  launchOptions: [
    async ({ launchOptions }, use) => {
      await use({ ...launchOptions, args: ['--use-angle=swiftshader-webgl', '--enable-unsafe-swiftshader'] });
    },
    { scope: 'worker' },
  ],
});

for (const { guid, behavior } of [
  { guid: '3b9ed5', behavior: 'move' },
  { guid: '8ac7c6', behavior: 'rotate' },
  { guid: '8ac7c6', behavior: 'flip' },
  { guid: 'fb31d5', behavior: 'extract' },
  { guid: '51d35d', behavior: 'extract' },
] as const) {
  const actor = manifestActor(guid);
  const points: Record<string, number[]> = coordinates.profiles.render;
  const start = points[guid];
  test.describe(() => {
    test.use({
      actorGuids: [guid],
      simulationState: async ({ assetURL }, use) => {
        const fixture = buildRenderFixture(assetURL, guid, behavior);
        await use(fixture);
      },
    });
    test(
      `[${actor.typeName} ${actor.guid}] ${behavior} updates the rendered scene`,
      {
        tag: [`@actor:${actor.typeName}`, `@behavior:${behavior}`, '@behavior:render'],
      },
      async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
        const pages = [page, guestPlayer!.page];
        const beforeCanvases = await captureCanvases(pages);

        const beforeState = (await captureRoom(room)).state;
        const before = getActor(beforeState, guid);
        if (behavior === 'move') {
          const end = [start[0] + 90, start[1] + 24];
          await page.mouse.move(start[0], start[1]);
          await waitForRenderedFrames(page);
          await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), guid);
          const held = getActor((await waitForActorStable(room, guid, () => true, before)).state, guid);
          await expectClientAction(
            connection,
            ClientAction.MOVE_ACTOR,
            () => page.mouse.move(end[0], end[1], { steps: 20 }),
            guid,
          );
          await waitForActorStable(room, guid, positionChanged, held);
          await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up());
          const after = getActor((await waitForActorStable(room, guid, positionChanged, before)).state, guid);
          expect(positionChanged(before, after)).toBe(true);
        } else if (behavior === 'rotate' || behavior === 'flip') {
          const key = behavior === 'rotate' ? 'KeyE' : 'KeyF';
          await page.mouse.move(start[0], start[1]);
          await waitForRenderedFrames(page);
          await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), guid);
          const held = getActor((await waitForActorStable(room, guid, () => true, before)).state, guid);
          await page.keyboard.press(key);
          const changed = await waitForActorStable(room, guid, rotationChanged, held, 30_000);
          const rotated = getActor(changed.state, guid);
          expect(rotated).toHaveHeldRotation(held, key);
          await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up());
          await waitForActorStable(room, guid, () => true, rotated);
        } else {
          // Release clear of the container so contact cannot tilt either object between runs.
          const end = [start[0] + 150, start[1] + 24];
          await page.locator('canvas').focus();
          await page.mouse.move(start[0], start[1]);
          await waitForRenderedFrames(page);
          await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), guid);
          const spawned = await expectSpawnedActor(room, beforeState);
          // The browser loads the new held item after the server announces it.
          await expect(async () => {
            await expectClientAction(
              connection,
              ClientAction.MOVE_ACTOR,
              () => page.mouse.move(start[0] + 0.1, start[1]).then(() => page.mouse.move(start[0], start[1])),
              spawned.guid,
              1_000,
            );
          }).toPass({ timeout: 30_000, intervals: [100] });
          // The keyboard extraction already holds the new item.
          await page.mouse.down();
          await expectClientAction(
            connection,
            ClientAction.MOVE_ACTOR,
            () => page.mouse.move(end[0], end[1], { steps: 6 }),
            spawned.guid,
          );
          await waitForActorStable(room, spawned.guid, positionChanged, spawned);
          await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up(), spawned.guid);
          await waitForActorStable(room, spawned.guid, positionChanged, spawned);
        }
        await waitForRoomStable(room);
        await expectChangedCanvases(testInfo, behavior, pages, beforeCanvases);
        const comparisons = [page, guestPlayer!.page].map((player, index) =>
          expectStoredScreenshot(
            testInfo,
            player,
            `${actor.typeName.toLowerCase()}-${behavior}-client-${index + 1}.png`,
            {
              // Include the top of the lifted, ten-tile stack.
              clip: { x: 360, y: actor.typeName === 'TILE_STACK' ? 180 : 220, width: 560, height: 400 },
              // Repeated settling changes up to 72 edge pixels in this 224,000-pixel crop.
              maxDiffPixels: 100,
            },
          ),
        );
        await Promise.all(comparisons).catch(async error => {
          await Promise.allSettled(comparisons);
          throw error;
        });
      },
    );
  });
}
