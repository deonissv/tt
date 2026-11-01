import type { UnknownActorState } from '@tt/states';
import { manifestActor } from '../fixtures/manifest';
import { ClientAction } from '@tt/actions';
import coordinates from '../fixtures/targeting/coordinates.json';
import { positionChanged } from '../support/transforms';
import { captureRoom } from '../support/api';
import { waitForClientReady, waitForRenderedFrames } from '../support/rendering';
import { actorIdentityList, getActor, waitForActorStable, waitForRoomStable } from '../support/physics';
import { expect, test, expectMatchingCanvases, expectClientAction, expectSpawnedActor } from '../test';

const points: Record<string, number[]> = coordinates.profiles.default;
const depletedPoints: Record<string, number[]> = { ...points, ...coordinates.profiles['depleting-containers'] };

const sorted = (items: string[]): string[] => [...items].sort();

const containerSize = (actor: UnknownActorState): number => {
  if ('cards' in actor) return actor.cards.length;
  if ('containedObjects' in actor) return actor.containedObjects?.length ?? 0;
  if ('size' in actor) return actor.size;
  throw new Error(`Actor ${actor.guid} is not a supported container`);
};

for (const actor of ['7a0b0b', 'fb31d5', '51d35d'].map(manifestActor)) {
  test.describe(() => {
    test.use({ actorGuids: [actor.guid] });
    test(
      `[${actor.typeName} ${actor.guid}] extraction through keyboard input preserves identities and count`,
      { tag: [`@actor:${actor.typeName}`, '@behavior:extract'] },
      async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
        const { guid } = actor;
        const beforeCapture = await captureRoom(room);
        const before = getActor(beforeCapture.state, guid);
        const beforeContainerSize = containerSize(before);
        const beforeIdentities = actorIdentityList(before);

        const start = points[guid];
        const end = [start[0] + 48, start[1] + 24];
        await page.locator('canvas').focus();
        await page.mouse.move(start[0], start[1]);
        await waitForRenderedFrames(page);
        await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), guid);
        const drawn = await expectSpawnedActor(room, beforeCapture.state);
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
        const afterCapture = await waitForRoomStable(room);
        const after = getActor(afterCapture.state, guid);

        expect(containerSize(after)).toBe(beforeContainerSize - 1);
        const spawnedGuids = (afterCapture.state.actorStates ?? [])
          .filter(actor => !(beforeCapture.state.actorStates ?? []).some(previous => previous.guid === actor.guid))
          .map(actor => actor.guid);
        if (beforeIdentities.length > 0) {
          expect(sorted([...actorIdentityList(after), ...spawnedGuids])).toEqual(sorted(beforeIdentities));
        }
        if (guid === 'fb31d5') {
          expect(spawnedGuids, 'face-up deck draw did not take the last/top card').toEqual([beforeIdentities.at(-1)]);
        }
        await expectMatchingCanvases(testInfo, `container-${guid}-extract`, [page, guestPlayer!.page]);
      },
    );
  });
}

const deck = manifestActor('fb31d5');
const bag = manifestActor('7a0b0b');
const tileStack = manifestActor('51d35d');

test.describe(() => {
  test.use({ actorGuids: [deck.guid] });
  test(
    `[${deck.typeName} ${deck.guid}] shuffle changes order within three actions and conserves identities`,
    { tag: [`@actor:${deck.typeName}`, '@behavior:shuffle'] },
    async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
      const guid = 'fb31d5';
      const start = points[guid];
      await page.locator('canvas').focus();
      await page.mouse.move(start[0], start[1]);
      await waitForRenderedFrames(page);
      const beforeOrder = actorIdentityList(getActor((await captureRoom(room)).state, guid));
      expect(new Set(beforeOrder).size).toBeGreaterThanOrEqual(8);
      const identities = sorted(beforeOrder);
      let order = beforeOrder;
      for (let attempt = 0; attempt < 3; attempt++) {
        await expectClientAction(connection, ClientAction.SHUFFLE, () => page.keyboard.press('KeyH'), guid);
        order = actorIdentityList(getActor((await waitForRoomStable(room)).state, guid));
        expect(sorted(order), 'shuffle changed identities or count').toEqual(identities);
        if (order.some((id, index) => id !== beforeOrder[index])) break;
      }
      expect(order, 'three shuffle actions retained the original order').not.toEqual(beforeOrder);
      await waitForRoomStable(room);
      await expectMatchingCanvases(testInfo, 'deck-shuffle', [page, guestPlayer!.page]);
    },
  );
});

test.describe(() => {
  test.use({ actorGuids: [bag.guid], fixtureVariant: 'shuffle-bag' });
  test(
    `[${bag.typeName} ${bag.guid}] shuffle changes order and preserves contained identities and count`,
    { tag: [`@actor:${bag.typeName}`, '@behavior:shuffle'] },
    async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
      const guid = '7a0b0b';
      const start = points[guid];
      await page.locator('canvas').focus();
      await page.mouse.move(start[0], start[1]);
      await waitForRenderedFrames(page);
      const beforeOrder = actorIdentityList(getActor((await captureRoom(room)).state, guid));
      expect(new Set(beforeOrder).size).toBeGreaterThanOrEqual(8);
      const identities = sorted(beforeOrder);
      let order = beforeOrder;
      for (let attempt = 0; attempt < 3; attempt++) {
        await expectClientAction(connection, ClientAction.SHUFFLE, () => page.keyboard.press('KeyH'), guid);
        order = actorIdentityList(getActor((await waitForRoomStable(room)).state, guid));
        expect(sorted(order), 'shuffle changed identities or count').toEqual(identities);
        if (order.some((id, index) => id !== beforeOrder[index])) break;
      }
      expect(order, 'three shuffle actions retained the original order').not.toEqual(beforeOrder);
      await waitForRoomStable(room);
      await expectMatchingCanvases(testInfo, 'bag-shuffle', [page, guestPlayer!.page]);
    },
  );
});

test.describe(() => {
  test.use({ actorGuids: [bag.guid], guestMode: 'none', fixtureVariant: 'empty-bag' });
  test(
    `[${bag.typeName} ${bag.guid}] empty extraction is a harmless no-op`,
    { tag: [`@actor:${bag.typeName}`, '@behavior:extract'] },
    async ({ player: { page, connection }, room }) => {
      const before = (await captureRoom(room)).state;
      const start = points['7a0b0b'];
      await page.locator('canvas').focus();
      await page.mouse.move(start[0], start[1]);
      await waitForRenderedFrames(page);
      await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), '7a0b0b');
      const after = (await waitForRoomStable(room)).state;
      expect(after).toMatchSimulationState(before);
    },
  );
});

test.describe(() => {
  test.use({
    actorGuids: [tileStack.guid],
    guestMode: 'none',
    fixtureVariant: 'exhausted-tile-stack',
  });
  test(
    `[${tileStack.typeName} ${tileStack.guid}] exhausted extraction is a harmless no-op`,
    { tag: [`@actor:${tileStack.typeName}`, '@behavior:extract'] },
    async ({ player: { page, connection }, room }) => {
      const before = (await captureRoom(room)).state;
      expect(containerSize(getActor(before, '51d35d'))).toBe(1);
      const start = coordinates.profiles['exhausted-tile-stack']['51d35d'];
      await page.locator('canvas').focus();
      await page.mouse.move(start[0], start[1]);
      await waitForRenderedFrames(page);
      await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), '51d35d');
      const after = (await waitForRoomStable(room)).state;
      expect(after).toMatchSimulationState(before);
    },
  );
});

test.describe(() => {
  test.use({ actorGuids: [bag.guid], guestMode: 'none', fixtureVariant: 'failed-bag-item' });
  test(
    `[${bag.typeName} ${bag.guid}] failed extraction reproduces VIS-003 without hiding another failure`,
    { tag: [`@actor:${bag.typeName}`, '@behavior:extract'] },
    async ({ player: { page, connection }, room }, testInfo) => {
      testInfo.annotations.push({ type: 'known-defect', description: 'VIS-003' });

      const guid = '7a0b0b';
      const before = (await captureRoom(room)).state;
      const beforeItems = actorIdentityList(getActor(before, guid));
      const beforeSize = beforeItems.length;
      expect(beforeItems.at(-1)).toBe('bad001');
      const start = points[guid];
      await page.locator('canvas').focus();
      await page.mouse.move(start[0], start[1]);
      await waitForRenderedFrames(page);
      await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), guid);
      await expect
        .poll(async () => containerSize(getActor((await captureRoom(room)).state, guid)), {
          message: 'failed extraction action was not observed',
          timeout: 10_000,
        })
        .toBe(beforeSize - 1);

      const after = (await waitForRoomStable(room)).state;
      expect(
        after.actorStates!.map(actor => actor.guid).sort(),
        'failed extraction spawned or removed an actor',
      ).toEqual(before.actorStates!.map(actor => actor.guid).sort());
      expect(actorIdentityList(getActor(after, guid)), 'VIS-003 must lose exactly the failed item').toEqual(
        beforeItems.slice(0, -1),
      );
    },
  );
});

test.describe(() => {
  // This checks loading, not settling a zero-height dynamic collider.
  test.use({ actorGuids: [deck.guid], fixtureVariant: 'empty-deck', guestMode: 'none', waitForRoom: false });
  test(
    `[${deck.typeName} ${deck.guid}] empty deck loads without errors or reconnecting`,
    { tag: ['@actor:DECK', '@behavior:load'] },
    async ({ player: { page, connection }, room }) => {
      await waitForClientReady(page);
      await expect(page.locator('div.bg-lightred.shadow-lg')).toHaveCount(0);
      const server = await captureRoom(room);
      expect(connection.connectionCount, 'an empty deck must not reconnect').toBe(1);
      expect(server.downloadProgress).toMatchObject({ failed: 0, succeeded: 1, total: 1 });
      expect(server.state.actorStates).toHaveLength(1);
      expect(server.state.actorStates?.find(actor => actor.guid === 'fb31d5')).toMatchObject({ cards: [] });
    },
  );
});

for (const actor of [bag, deck, tileStack]) {
  test.describe(() => {
    test.use({ actorGuids: [actor.guid], fixtureVariant: 'depleting-containers' });
    test(
      `[${actor.typeName} ${actor.guid}] extraction depletes the container to its supported limit`,
      { tag: [`@actor:${actor.typeName}`, '@behavior:extract'] },
      async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
        const before = await captureRoom(room);
        const container = getActor(before.state, actor.guid);
        expect(container.transformation!.position![1], 'container settled below the table').toBeGreaterThan(0.8);
        const start = depletedPoints[actor.guid];
        const end = [start[0] + 48, start[1] + 24];
        await page.locator('canvas').focus();
        await page.mouse.move(start[0], start[1]);
        await waitForRenderedFrames(page);
        await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), actor.guid);
        const drawn = await expectSpawnedActor(room, before.state);
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
        const after = await waitForRoomStable(room);
        const remaining = getActor(after.state, actor.guid);
        expect(containerSize(remaining)).toBe(containerSize(container) - 1);
        const spawned = after.state.actorStates!.filter(
          item => !before.state.actorStates!.some(previous => previous.guid === item.guid),
        );
        expect(spawned).toHaveLength(1);
        if (actor !== tileStack) expect(spawned.map(item => item.guid)).toEqual(actorIdentityList(container));
        else expect(containerSize(remaining)).toBe(1);
        if (actor !== deck) {
          await page.locator('canvas').focus();
          await page.mouse.move(start[0], start[1]);
          await waitForRenderedFrames(page);
          await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), actor.guid);
          const exhausted = await waitForRoomStable(room);
          expect(exhausted.state.actorStates).toHaveLength(before.state.actorStates!.length + 1);
          expect(getActor(exhausted.state, actor.guid)).toEqual(remaining);
        }
        await expectMatchingCanvases(testInfo, `${actor.typeName.toLowerCase()}-depleted`, [page, guestPlayer!.page]);
      },
    );
  });
}

test.describe(() => {
  test.use({ actorGuids: [deck.guid], fixtureVariant: 'face-down-deck' });
  test(
    `[${deck.typeName} ${deck.guid}] face-down extraction takes the first card and conserves identities`,
    { tag: [`@actor:${deck.typeName}`, '@behavior:extract', '@behavior:flip'] },
    async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
      const before = await captureRoom(room);
      const identities = actorIdentityList(getActor(before.state, deck.guid));
      const start = coordinates.profiles['face-down-deck'].fb31d5;
      const end = [start[0] + 48, start[1] + 24];
      await page.locator('canvas').focus();
      await page.mouse.move(start[0], start[1]);
      await waitForRenderedFrames(page);
      await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), deck.guid);
      const drawn = await expectSpawnedActor(room, before.state);
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
      const drawnGuid = drawn.guid;
      expect(drawnGuid).toBe(identities[0]);
      const after = await waitForRoomStable(room);
      expect(actorIdentityList(getActor(after.state, deck.guid))).toEqual(identities.slice(1));
      expect(after.state.actorStates!.filter(item => item.guid === identities[0])).toHaveLength(1);
      await expectMatchingCanvases(testInfo, 'face-down-deck-extraction', [page, guestPlayer!.page]);
    },
  );
});
