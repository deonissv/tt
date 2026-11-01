import { ClientAction } from '@tt/actions';
import { ACTOR_MANIFEST } from '../fixtures/manifest';
import coordinates from '../fixtures/targeting/coordinates.json';
import { positionChanged, rotationChanged } from '../support/transforms';
import { captureRoom } from '../support/api';
import { getActor, waitForActorStable, waitForRoomStable } from '../support/physics';
import { waitForRenderedFrames } from '../support/rendering';
import { captureCanvases } from '../support/screenshots';
import { expect, test, expectClientAction, expectChangedCanvases, expectMatchingCanvases } from '../test';

const points: Record<string, number[]> = coordinates.profiles.default;
const afterClockwise: Record<string, number[]> = coordinates.profiles['after-clockwise'];
test.setTimeout(5 * 60_000);

for (const actor of ACTOR_MANIFEST) {
  const start = points[actor.guid];
  test.describe(`[${actor.typeName} ${actor.guid}]`, { tag: `@actor:${actor.typeName}` }, () => {
    test.use({ actorGuids: [actor.guid] });
    test(
      'move through pick, drag, and release',
      { tag: '@behavior:move' },
      async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
        const pages = [page, guestPlayer!.page];
        const beforeImages = await captureCanvases(pages);
        const before = getActor((await captureRoom(room)).state, actor.guid);
        const end = [start[0] + 36, start[1] + 24];
        await page.mouse.move(start[0], start[1]);
        await waitForRenderedFrames(page);
        await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), actor.guid);
        const held = getActor((await waitForActorStable(room, actor.guid, () => true, before)).state, actor.guid);
        await expectClientAction(
          connection,
          ClientAction.MOVE_ACTOR,
          () => page.mouse.move(end[0], end[1], { steps: 20 }),
          actor.guid,
        );
        await waitForActorStable(room, actor.guid, positionChanged, held);
        await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up());
        const after = getActor((await waitForActorStable(room, actor.guid, positionChanged, before)).state, actor.guid);
        expect(positionChanged(before, after)).toBe(true);
        await waitForRoomStable(room);
        await expectMatchingCanvases(testInfo, 'move', pages);
        await expectChangedCanvases(testInfo, 'move', pages, beforeImages);
      },
    );
    test(
      'rotate clockwise and counterclockwise while held',
      { tag: '@behavior:rotate' },
      async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
        for (const key of ['KeyE', 'KeyQ'] as const) {
          await test.step(`pick, rotate with ${key}, and release`, async () => {
            const before = getActor((await captureRoom(room)).state, actor.guid);
            const point = key === 'KeyQ' ? afterClockwise[actor.guid] : start;
            await page.mouse.move(point[0], point[1]);
            await waitForRenderedFrames(page);
            await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), actor.guid);
            const held = getActor((await waitForActorStable(room, actor.guid, () => true, before)).state, actor.guid);
            await page.keyboard.press(key);
            const changed = await waitForActorStable(room, actor.guid, rotationChanged, held, 30_000);
            const rotated = getActor(changed.state, actor.guid);
            expect(rotated).toHaveHeldRotation(held, key);
            await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up());
            await waitForActorStable(room, actor.guid, () => true, rotated, 30_000);
          });
        }
        await waitForRoomStable(room);
        await expectMatchingCanvases(testInfo, 'rotate', [page, guestPlayer!.page]);
      },
    );
    test(
      'flip while held',
      { tag: '@behavior:flip' },
      async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
        const before = getActor((await captureRoom(room)).state, actor.guid);
        await page.mouse.move(start[0], start[1]);
        await waitForRenderedFrames(page);
        await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), actor.guid);
        const held = getActor((await waitForActorStable(room, actor.guid, () => true, before)).state, actor.guid);
        await page.keyboard.press('KeyF');
        const changed = await waitForActorStable(room, actor.guid, rotationChanged, held, 30_000);
        const flipped = getActor(changed.state, actor.guid);
        expect(flipped).toHaveHeldRotation(held, 'KeyF');
        await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up());
        await waitForActorStable(room, actor.guid, () => true, flipped, actor.typeName === 'CARD' ? 90_000 : 30_000);
        await waitForRoomStable(room);
        await expectMatchingCanvases(testInfo, 'flip', [page, guestPlayer!.page]);
      },
    );
  });
}
