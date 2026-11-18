import { captureRoom } from '../support/api';
import { manifestActor } from '../fixtures/manifest';
import { positionChanged, rotationChanged } from '../support/transforms';
import { ClientAction, ServerAction, type ServerActionMsg } from '@tt/actions';
import coordinates from '../fixtures/targeting/coordinates.json';
import type { UnknownActorState } from '@tt/states';
import { waitForRenderedFrames } from '../support/rendering';
import { getActor, waitForActorStable, waitForRoomStable } from '../support/physics';
import { orientationDistanceRadians } from '../support/orientation';
import {
  expect,
  test,
  expectMatchingCanvases,
  expectActorUnchanged,
  expectRoomUnchanged,
  expectClientAction,
} from '../test';

const genericActor = manifestActor('3b9ed5');
const card = manifestActor('8ac7c6');
const pawn = manifestActor('29a87f');

test.describe(() => {
  test.use({ actorGuids: [genericActor.guid] });
  test(
    `[${genericActor.typeName} ${genericActor.guid}] can be picked, moved, and released repeatedly`,
    { tag: [`@actor:${genericActor.typeName}`, '@behavior:move', '@behavior:targeting'] },
    async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
      const guid = '3b9ed5';
      const states: UnknownActorState[] = [];
      for (const start of [coordinates.profiles.default['3b9ed5'], coordinates.destinations['actor-after-drag']]) {
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
        states.push(after);
      }
      const [first, second] = states;
      expect(positionChanged(first, second)).toBe(true);
      await waitForRoomStable(room);
      await expectMatchingCanvases(testInfo, 'repeated-pick-move-release', [page, guestPlayer!.page]);
    },
  );
});

test.describe(() => {
  test.use({ actorGuids: [genericActor.guid, card.guid] });
  test(
    `[${genericActor.typeName} ${genericActor.guid} + ${card.typeName} ${card.guid}] held target takes precedence over a separately hovered target`,
    { tag: [`@actor:${genericActor.typeName}`, `@actor:${card.typeName}`, '@behavior:rotate', '@behavior:targeting'] },
    async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
      const actorGuid = genericActor.guid;
      const cardGuid = card.guid;
      await page.getByTestId('RoomPreferencesIcon').click();
      const pickHeight = page.getByText('Actor pick height', { exact: true }).locator('..').getByRole('slider');
      await pickHeight.fill('3');
      await page.mouse.click(640, 100);
      await expect(pickHeight).toBeHidden();

      const before = await captureRoom(room);
      const actorBefore = getActor(before.state, actorGuid);
      const cardBefore = getActor(before.state, cardGuid);
      const actorPoint = coordinates.profiles.default['3b9ed5'];
      const cardPoint = coordinates.profiles.default['8ac7c6'];

      await page.mouse.move(actorPoint[0], actorPoint[1]);
      await waitForRenderedFrames(page);
      await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), actorGuid);
      await page.mouse.move(cardPoint[0], cardPoint[1]);
      const held = getActor((await waitForActorStable(room, actorGuid, () => true, actorBefore)).state, actorGuid);
      await page.keyboard.press('KeyE');
      await waitForActorStable(room, actorGuid, rotationChanged, held);

      const whileHeld = await captureRoom(room);
      expect(getActor(whileHeld.state, actorGuid)).toHaveHeldRotation(held, 'KeyE');
      await expectActorUnchanged(room, cardBefore);

      await page.mouse.move(actorPoint[0] + 90, actorPoint[1] - 70, { steps: 20 });
      await waitForActorStable(room, actorGuid, positionChanged, getActor(whileHeld.state, actorGuid));
      await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up());
      await waitForActorStable(room, actorGuid, positionChanged, actorBefore);
      await waitForRoomStable(room);
      await expectMatchingCanvases(testInfo, 'held-target-precedence', [page, guestPlayer!.page]);
    },
  );
});

test.describe(() => {
  test.use({ actorGuids: [genericActor.guid] });
  for (const [key, action] of [
    ['KeyF', ClientAction.FLIP],
    ['KeyE', ClientAction.CW],
    ['KeyQ', ClientAction.CCW],
  ] as const) {
    test(
      `[${genericActor.typeName} ${genericActor.guid}] hover-only ${key} applies and synchronizes (VIS-002)`,
      { tag: [`@actor:${genericActor.typeName}`, '@behavior:flip', '@behavior:rotate', '@behavior:targeting'] },
      async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
        const guid = genericActor.guid;
        const before = getActor((await captureRoom(room)).state, guid);
        const start = coordinates.profiles.default['3b9ed5'];
        await page.locator('canvas').focus();
        await page.mouse.move(start[0], start[1]);
        await waitForRenderedFrames(page);
        const rotations: (number[] | undefined)[] = [];
        const sockets = [connection.socket, guestPlayer!.connection.socket];
        const listeners = sockets.map((socket, index) => {
          const listener = ({ payload }: { payload: string | Buffer }) => {
            const messages = JSON.parse(
              typeof payload === 'string' ? payload : payload.toString('utf8'),
            ) as ServerActionMsg[];
            const received = messages.find(
              message => message.type === ServerAction.ROTATE_ACTOR && message.payload.guid === guid,
            );
            if (received?.type === ServerAction.ROTATE_ACTOR) rotations[index] = received.payload.position;
          };
          socket.on('framereceived', listener);
          return listener;
        });
        try {
          await expectClientAction(connection, action, () => page.keyboard.press(key), guid);

          const after = getActor((await waitForActorStable(room, guid, rotationChanged, before)).state, guid);
          expect(after).toHaveHeldRotation(before, key);
          const [beforeX, beforeY, beforeZ] = before.transformation!.position!;
          const [afterX, afterY, afterZ] = after.transformation!.position!;
          expect(Math.hypot(afterX - beforeX, afterZ - beforeZ)).toBeLessThan(0.1);
          expect(Math.abs(afterY - beforeY)).toBeLessThan(0.2);
          for (const index of [0, 1]) {
            await expect
              .poll(() => {
                const received = rotations[index];
                return received ? orientationDistanceRadians(after.transformation!.rotation!, received) : Infinity;
              })
              .toBeLessThan(0.01);
          }
          await waitForRoomStable(room);
          await expectMatchingCanvases(testInfo, `hover-only-${key}`, [page, guestPlayer!.page]);
        } finally {
          sockets.forEach((socket, index) => socket.off('framereceived', listeners[index]));
        }
      },
    );
  }
});

test.describe(() => {
  test.use({ actorGuids: [genericActor.guid], guestMode: 'none', fixtureVariant: 'locked-actor' });
  test(
    `[${genericActor.typeName} ${genericActor.guid}] locked and absent pointer targets leave simulation state unchanged`,
    { tag: [`@actor:${genericActor.typeName}`, '@behavior:targeting'] },
    async ({ player: { page }, room }) => {
      const before = await captureRoom(room);
      const lockedPoint = coordinates.profiles['locked-actor']['3b9ed5'];
      await page.mouse.move(lockedPoint[0], lockedPoint[1]);
      await waitForRenderedFrames(page);
      await page.mouse.down();
      await page.mouse.move(lockedPoint[0] + 30, lockedPoint[1] + 20, { steps: 4 });
      await page.keyboard.press('KeyF');
      await page.mouse.up();
      await page.mouse.move(640, 15);
      await page.keyboard.press('KeyE');

      await waitForRoomStable(room);
      await expectRoomUnchanged(room, before.state);
    },
  );
});

test.describe(() => {
  test.use({ actorGuids: [pawn.guid] });
  test(
    `[${pawn.typeName} ${pawn.guid}] configured rotation step is applied to a held actor and converges`,
    { tag: [`@actor:${pawn.typeName}`, '@behavior:rotate', '@behavior:targeting'] },
    async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
      await page.getByTestId('RoomPreferencesIcon').click();
      const pickHeight = page.getByText('Actor pick height', { exact: true }).locator('..').getByRole('slider');
      await pickHeight.fill('2');
      await page.getByText('Actor rotate step', { exact: true }).locator('..').getByRole('slider').fill('45');
      await page.mouse.click(640, 100);
      await expect(pickHeight).toBeHidden();

      const guid = '29a87f';
      const before = getActor((await captureRoom(room)).state, guid);
      const point = coordinates.profiles.default['29a87f'];
      await page.mouse.move(point[0], point[1]);
      await waitForRenderedFrames(page);
      await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), guid);
      const held = getActor((await waitForActorStable(room, guid, () => true, before)).state, guid);
      await page.keyboard.press('KeyE');
      const clockwise = getActor((await waitForActorStable(room, guid, rotationChanged, held)).state, guid);
      expect(clockwise).toHaveHeldRotation(held, 'KeyE', { rotationStep: Math.PI / 4 });
      expect(clockwise.transformation!.position![1]).toBeGreaterThan(before.transformation!.position![1] + 1.5);
      await page.keyboard.press('KeyQ');
      const counterclockwise = getActor((await waitForActorStable(room, guid, rotationChanged, clockwise)).state, guid);
      expect(counterclockwise).toHaveHeldRotation(clockwise, 'KeyQ', { rotationStep: Math.PI / 4 });
      expect(
        orientationDistanceRadians(held.transformation!.rotation!, counterclockwise.transformation!.rotation!),
        'counterclockwise action did not undo the clockwise rotation',
      ).toBeLessThan(0.01);
      await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up());
      await waitForActorStable(room, guid, rotationChanged, clockwise);

      const after = getActor((await captureRoom(room)).state, guid);
      expect(rotationChanged(before, clockwise)).toBe(true);
      expect(rotationChanged(clockwise, counterclockwise)).toBe(true);
      expect(rotationChanged(clockwise, after)).toBe(true);
      await waitForRoomStable(room);
      await expectMatchingCanvases(testInfo, 'configured-pick-and-rotation', [page, guestPlayer!.page]);
    },
  );
});
