import type { DeckState, UnknownActorState } from '@tt/states';
import { ClientAction } from '@tt/actions';
import coordinates from '../fixtures/targeting/coordinates.json';
import { captureRoom } from '../support/api';
import { getActor, waitForActorStable, waitForRoomStable } from '../support/physics';
import { captureCanvases } from '../support/screenshots';
import { waitForRenderedFrames } from '../support/rendering';
import { positionChanged } from '../support/transforms';
import {
  expect,
  test,
  expectChangedCanvases,
  expectClientAction,
  expectMatchingCanvases,
  expectSpawnedActor,
} from '../test';

test.use({ actorGuids: ['fb31d5'], fixtureVariant: 'repeated-deck-card-guids' });

test(
  '[DECK fb31d5] repeated draws with reused imported card GUIDs produce separate visible cards',
  { tag: ['@actor:DECK', '@behavior:extract'] },
  async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
    const pages = [page, guestPlayer!.page];
    const start = coordinates.profiles.default.fb31d5;
    const initial = (await captureRoom(room)).state;
    const deck = getActor(initial, 'fb31d5') as DeckState;
    expect(deck.cards.at(-3)!.guid).toBe(deck.cards.at(-1)!.guid);
    const drawnCards: UnknownActorState[] = [];
    await page.locator('canvas').focus();

    for (let draw = 0; draw < 3; draw++) {
      const before = (await captureRoom(room)).state;
      const beforeDraw = await captureCanvases(pages);
      await page.mouse.move(start[0], start[1]);
      await waitForRenderedFrames(page);
      await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), deck.guid);
      const drawn = await expectSpawnedActor(room, before);
      await expect(async () => {
        await expectClientAction(
          connection,
          ClientAction.MOVE_ACTOR,
          () => page.mouse.move(start[0] + 0.1, start[1]).then(() => page.mouse.move(start[0], start[1])),
          drawn.guid,
          1_000,
        );
      }).toPass({ timeout: 30_000, intervals: [100] });

      await page.mouse.down();
      const end = [480 + draw * 160, 360];
      await expectClientAction(
        connection,
        ClientAction.MOVE_ACTOR,
        () => page.mouse.move(end[0], end[1], { steps: 20 }),
        drawn.guid,
      );
      await waitForActorStable(room, drawn.guid, positionChanged, drawn);
      await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up(), drawn.guid);
      const settled = (await waitForRoomStable(room)).state;
      await expectChangedCanvases(testInfo, `draw-${draw + 1}`, pages, beforeDraw);
      const cards = settled.actorStates!.filter(actor => actor.guid !== deck.guid);
      expect(cards).toHaveLength(draw + 1);
      expect(new Set(cards.map(card => card.guid)).size, 'every drawn card needs its own identity').toBe(cards.length);
      expect((getActor(settled, deck.guid) as DeckState).cards).toHaveLength(deck.cards.length - draw - 1);
      for (const previous of drawnCards) {
        const position = getActor(settled, previous.guid).transformation!.position!;
        previous.transformation!.position!.forEach((value, axis) => expect(position[axis]).toBeCloseTo(value, 3));
      }
      drawnCards.push(getActor(settled, drawn.guid));
      await expectMatchingCanvases(testInfo, `draw-${draw + 1}`, pages);
      await testInfo.attach(`draw-${draw + 1}`, { body: await page.screenshot(), contentType: 'image/png' });
    }
  },
);
