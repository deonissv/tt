import { captureRoom } from '../support/api';
import { manifestActor } from '../fixtures/manifest';
import { positionChanged } from '../support/transforms';
import { getActor, waitForActorStable, waitForRoomStable } from '../support/physics';
import { waitForClientReady, waitForRenderedFrames } from '../support/rendering';
import { ClientAction } from '@tt/actions';
import coordinates from '../fixtures/targeting/coordinates.json';
import {
  expect,
  test,
  expectMatchingCanvases,
  expectActorUnchanged,
  expectClientAction,
  expectSpawnedActor,
} from '../test';

const genericActor = manifestActor('3b9ed5');
const pawn = manifestActor('29a87f');

test.describe(() => {
  test.use({ actorGuids: [genericActor.guid], guestMode: 'late' });
  test(
    `[${genericActor.typeName} ${genericActor.guid}] late join and reconnect receive changes made while the player was absent`,
    { tag: [`@actor:${genericActor.typeName}`, '@behavior:move', '@behavior:multiplayer', '@behavior:reconnect'] },
    async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
      const guid = '3b9ed5';
      {
        const start = coordinates.profiles.default['3b9ed5'];
        const before = getActor((await captureRoom(room)).state, guid);
        const end = [start[0] + 36, start[1] + 24];
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
      }
      await guestPlayer!.page.goto(`/room/${room.roomCode}`);
      await waitForClientReady(guestPlayer!.page);
      await waitForRoomStable(room);
      await expectMatchingCanvases(testInfo, 'late-join', [page, guestPlayer!.page]);

      await guestPlayer!.page.close();
      {
        const start = coordinates.destinations['actor-after-drag'];
        const before = getActor((await captureRoom(room)).state, guid);
        const end = [start[0] + 36, start[1] + 24];
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
      }
      const reconnectedPage = await guestPlayer!.page.context().newPage();
      await reconnectedPage.goto(`/room/${room.roomCode}`);
      await waitForClientReady(reconnectedPage);
      await waitForRoomStable(room);
      await expectMatchingCanvases(testInfo, 'late-join-and-reconnect', [page, reconnectedPage]);
    },
  );
});

test.describe(() => {
  test.use({ actorGuids: [pawn.guid] });
  test(
    `[${pawn.typeName} ${pawn.guid}] competing players still converge on one shared actor`,
    { tag: [`@actor:${pawn.typeName}`, '@behavior:move', '@behavior:multiplayer'] },
    async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
      const guid = '29a87f';
      const before = getActor((await captureRoom(room)).state, guid);
      const authorPoint = coordinates.profiles.default['29a87f'];
      await page.mouse.move(authorPoint[0], authorPoint[1]);
      await waitForRenderedFrames(page);
      await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), guid);
      const held = getActor((await waitForActorStable(room, guid, positionChanged, before)).state, guid);
      // The owner has lifted the pawn above its original footprint.
      const guestPoint = [878, 196];
      await guestPlayer!.page.mouse.move(guestPoint[0], guestPoint[1]);
      await waitForRenderedFrames(guestPlayer!.page);
      await expectClientAction(
        guestPlayer!.connection,
        ClientAction.PICK_ACTOR,
        () => guestPlayer!.page.mouse.down(),
        guid,
      );
      await guestPlayer!.page.mouse.move(guestPoint[0] - 30, guestPoint[1], { steps: 5 });
      await guestPlayer!.page.mouse.up();
      await expectActorUnchanged(room, held);
      await page.mouse.move(authorPoint[0] + 48, authorPoint[1], { steps: 5 });
      await page.mouse.up();
      const after = getActor((await waitForActorStable(room, guid, positionChanged, before)).state, guid);
      const [beforeX, , beforeZ] = before.transformation!.position!;
      const [afterX, , afterZ] = after.transformation!.position!;
      expect(
        Math.hypot(afterX - beforeX, afterZ - beforeZ),
        'competing drags did not move the actor horizontally',
      ).toBeGreaterThan(0.01);

      const server = await captureRoom(room);
      expect(server.state.actorStates?.filter(actor => actor.guid === guid)).toHaveLength(1);
      const guestStart = [authorPoint[0] + 48, authorPoint[1]];
      const guestEnd = [guestStart[0] + 36, guestStart[1] + 24];
      await guestPlayer!.page.mouse.move(guestStart[0], guestStart[1]);
      await waitForRenderedFrames(guestPlayer!.page);
      await expectClientAction(
        guestPlayer!.connection,
        ClientAction.PICK_ACTOR,
        () => guestPlayer!.page.mouse.down(),
        guid,
      );
      const guestHeld = getActor((await waitForActorStable(room, guid, () => true, after)).state, guid);
      await expectClientAction(
        guestPlayer!.connection,
        ClientAction.MOVE_ACTOR,
        () => guestPlayer!.page.mouse.move(guestEnd[0], guestEnd[1], { steps: 20 }),
        guid,
      );
      await waitForActorStable(room, guid, positionChanged, guestHeld);
      await expectClientAction(guestPlayer!.connection, ClientAction.RELEASE_ACTOR, () => guestPlayer!.page.mouse.up());
      const guestAfter = getActor((await waitForActorStable(room, guid, positionChanged, after)).state, guid);
      expect(positionChanged(after, guestAfter), 'guest could not take control after release').toBe(true);
      await waitForRoomStable(room);
      await expectMatchingCanvases(testInfo, 'competing-player-actions', [page, guestPlayer!.page]);
    },
  );
});

test.describe(() => {
  test.use({ actorGuids: ['51d35d'], guestMode: 'late' });
  test(
    '[TILE_STACK 51d35d] a late guest receives and moves the extracted tile',
    {
      tag: [
        `@actor:${manifestActor('51d35d').typeName}`,
        '@behavior:extract',
        '@behavior:move',
        '@behavior:multiplayer',
      ],
    },
    async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
      const beforeExtraction = (await captureRoom(room)).state;
      const start = coordinates.profiles.default['51d35d'];
      const end = [start[0] + 48, start[1] + 24];
      await page.locator('canvas').focus();
      await page.mouse.move(start[0], start[1]);
      await waitForRenderedFrames(page);
      await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), '51d35d');
      const drawn = await expectSpawnedActor(room, beforeExtraction);
      // The browser loads the new held item after the server announces it.
      await expect(async () => {
        await expectClientAction(
          connection,
          ClientAction.MOVE_ACTOR,
          () => page.mouse.move(start[0] + 0.1, start[1]).then(() => page.mouse.move(start[0], start[1])),
          drawn.guid,
          1_000,
        );
      }).toPass({ timeout: 30_000, intervals: [100] });
      // The keyboard extraction already holds the new item.
      await page.mouse.down();
      await expectClientAction(
        connection,
        ClientAction.MOVE_ACTOR,
        () => page.mouse.move(end[0], end[1], { steps: 20 }),
        drawn.guid,
      );
      await waitForActorStable(room, drawn.guid, positionChanged, drawn);
      await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up(), drawn.guid);
      await waitForActorStable(room, drawn.guid, positionChanged, drawn);
      const guid = drawn.guid;
      await waitForRoomStable(room);
      await guestPlayer!.page.goto(`/room/${room.roomCode}`);
      await waitForClientReady(guestPlayer!.page);
      await waitForRoomStable(room);
      await expectMatchingCanvases(testInfo, 'late-guest-sees-extracted-tile', [page, guestPlayer!.page]);
      const before = getActor((await captureRoom(room)).state, guid);
      const guestStart = coordinates.destinations['extracted-tile'];
      const guestEnd = [guestStart[0] + 36, guestStart[1] + 24];
      await guestPlayer!.page.mouse.move(guestStart[0], guestStart[1]);
      await waitForRenderedFrames(guestPlayer!.page);
      await expectClientAction(
        guestPlayer!.connection,
        ClientAction.PICK_ACTOR,
        () => guestPlayer!.page.mouse.down(),
        guid,
      );
      const held = getActor((await waitForActorStable(room, guid, () => true, before)).state, guid);
      await expectClientAction(
        guestPlayer!.connection,
        ClientAction.MOVE_ACTOR,
        () => guestPlayer!.page.mouse.move(guestEnd[0], guestEnd[1], { steps: 20 }),
        guid,
      );
      await waitForActorStable(room, guid, positionChanged, held);
      await expectClientAction(guestPlayer!.connection, ClientAction.RELEASE_ACTOR, () => guestPlayer!.page.mouse.up());
      const after = getActor((await waitForActorStable(room, guid, positionChanged, before)).state, guid);
      expect(positionChanged(before, after)).toBe(true);
      await waitForRoomStable(room);
      await expectMatchingCanvases(testInfo, 'guest-moves-extracted-tile', [page, guestPlayer!.page]);
    },
  );
});

test.describe(() => {
  test.use({ actorGuids: [pawn.guid] });
  test(
    `[${pawn.typeName} ${pawn.guid}] disconnecting while holding releases the actor for the remaining player`,
    { tag: [`@actor:${pawn.typeName}`, '@behavior:move', '@behavior:multiplayer', '@behavior:reconnect'] },
    async ({ player: { page, connection }, guestPlayer, room }) => {
      const before = getActor((await captureRoom(room)).state, pawn.guid);
      const start = coordinates.profiles.default['29a87f'];
      await guestPlayer!.page.mouse.move(start[0], start[1]);
      await waitForRenderedFrames(guestPlayer!.page);
      await expectClientAction(
        guestPlayer!.connection,
        ClientAction.PICK_ACTOR,
        () => guestPlayer!.page.mouse.down(),
        pawn.guid,
      );
      await waitForActorStable(room, pawn.guid, positionChanged, before);
      await guestPlayer!.page.close();
      await expect
        .poll(
          async () => {
            const current = getActor((await captureRoom(room)).state, pawn.guid);
            return Math.abs(current.transformation!.position![1] - before.transformation!.position![1]);
          },
          { message: 'disconnected player left the actor suspended' },
        )
        .toBeLessThan(0.02);
      const end = [start[0] + 36, start[1] + 24];
      await page.mouse.move(start[0], start[1]);
      await waitForRenderedFrames(page);
      await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), pawn.guid);
      const held = getActor((await waitForActorStable(room, pawn.guid, () => true, before)).state, pawn.guid);
      await expectClientAction(
        connection,
        ClientAction.MOVE_ACTOR,
        () => page.mouse.move(end[0], end[1], { steps: 20 }),
        pawn.guid,
      );
      await waitForActorStable(room, pawn.guid, positionChanged, held);
      await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up());
      const after = getActor((await waitForActorStable(room, pawn.guid, positionChanged, before)).state, pawn.guid);
      expect(positionChanged(before, after)).toBe(true);
      await waitForRoomStable(room);
    },
  );
});
