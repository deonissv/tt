import { captureRoom } from '../support/api';
import { ACTOR_MANIFEST } from '../fixtures/manifest';
import { ClientAction } from '@tt/actions';
import coordinates from '../fixtures/targeting/coordinates.json';
import { waitForRenderedFrames } from '../support/rendering';
import { rotationChanged } from '../support/transforms';
import { getActor, waitForActorStable, waitForRoomStable } from '../support/physics';
import { expect, test, expectMatchingCanvases, expectClientAction } from '../test';

const points: Record<string, number[]> = coordinates.profiles.default;

test.setTimeout(5 * 60_000);

for (const die of ACTOR_MANIFEST.filter(actor => actor.typeName.startsWith('DIE'))) {
  test.describe(() => {
    test.use({ actorGuids: [die.guid] });
    test(
      `[${die.typeName} ${die.guid}] roll settles to a valid shared result using real randomness`,
      { tag: [`@actor:${die.typeName}`, '@behavior:roll'] },
      async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
        const before = getActor((await captureRoom(room)).state, die.guid);
        const start = points[die.guid];
        await page.locator('canvas').focus();
        await page.mouse.move(start[0], start[1]);
        await waitForRenderedFrames(page);
        await expectClientAction(connection, ClientAction.ROLL, () => page.keyboard.press('KeyR'), die.guid);
        const settled = await waitForActorStable(room, die.guid, rotationChanged, before, 90_000);
        const after = getActor(settled.state, die.guid);
        expect(after.transformation?.position?.every(Number.isFinite)).toBe(true);
        expect(after.transformation?.rotation?.every(Number.isFinite)).toBe(true);
        // The observed roll may legitimately settle back to its starting pose.
        // waitForActorStable requires a rotation during the action before settling.
        await waitForRoomStable(room);
        await expectMatchingCanvases(testInfo, `${die.typeName.toLowerCase()}-settled`, [page, guestPlayer!.page]);
      },
    );
  });
}
