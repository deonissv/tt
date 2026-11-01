import { waitForRoomStable } from '../support/physics';
import { captureRoom } from '../support/api';
import { ACTOR_MANIFEST } from '../fixtures/manifest';
import { expect, test, expectStoredScreenshot } from '../test';

import { waitForRenderedFrames } from '../support/rendering';

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

test.describe(() => {
  test.use({ fixtureVariant: 'static-scene' });
  test(
    'loads the Rectangle table and all 14 actor types with local assets',
    { tag: [...ACTOR_MANIFEST.map(actor => `@actor:${actor.typeName}`), '@behavior:load', '@behavior:render'] },
    async ({ player: { page, connection }, guestPlayer, room }, testInfo) => {
      const server = await captureRoom(room);
      for (const observed of [connection, guestPlayer!.connection]) expect(observed.connectionCount).toBe(1);
      expect(server.downloadProgress).toMatchObject({ failed: 0, succeeded: 14, total: 14 });
      expect(server.state.table?.type).toBe('Rectangle');

      for (const expected of ACTOR_MANIFEST) {
        expect(server.state.actorStates).toContainEqual(
          expect.objectContaining({ guid: expected.guid, type: expected.type }),
        );
      }

      await waitForRoomStable(room);
      const comparisons = [page, guestPlayer!.page].map(async (player, index) => {
        await expect(player.locator('.bg-lightred')).toHaveCount(0);
        await player.mouse.move(10, 10);
        await waitForRenderedFrames(player);
        await expectStoredScreenshot(
          testInfo,
          player.locator('canvas'),
          index === 0 ? 'initial-client-a.png' : 'initial-client-b.png',
        );
      });
      await Promise.all(comparisons).catch(async error => {
        await Promise.allSettled(comparisons);
        throw error;
      });
    },
  );
});
