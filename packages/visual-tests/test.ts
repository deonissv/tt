import { test as base, type Page } from '@playwright/test';
import { createDataset, type RoomFixture } from './fixtures/dataset';
import { buildDemoFixture, type FixtureVariant } from './fixtures/demo';
import type { SimulationStateSave } from '@tt/states';
import { closeRoom, type Room } from './support/api';
import { waitForRoomStable } from './support/physics';
import { configureContext, waitForClientReady } from './support/rendering';
import { expect, assertSnapshotComparisonMode } from './assertions';
import { signIn } from './support/auth';
import { observeRoom, type RoomConnection } from './support/room-connection';
import coordinates from './fixtures/targeting/coordinates.json';

interface Player {
  page: Page;
  connection: RoomConnection;
}

interface Options {
  actorGuids: readonly string[] | undefined;
  fixtureVariant: FixtureVariant;
  guestMode: 'joined' | 'late' | 'none';
  waitForRoom: boolean;
}

export const test = base.extend<
  Options & {
    assetURL: string;
    dataset: Awaited<ReturnType<typeof createDataset>>;
    simulationState: SimulationStateSave;
    room: Room & Pick<RoomFixture, 'authorLogin' | 'guestLogin'>;
    player: Player;
    guestPlayer: Player | undefined;
    browserErrors: string[];
    roomReady: void;
  }
>({
  actorGuids: [undefined, { option: true }],
  fixtureVariant: ['default', { option: true }],
  guestMode: ['joined', { option: true }],
  waitForRoom: [true, { option: true }],
  assetURL: async ({ baseURL }, use) => use(process.env.VISUAL_ASSET_URL ?? baseURL!),
  request: async ({ playwright, baseURL }, use) => {
    const { refreshAPIURL } = await import('./setup/environment.mjs');
    const request = await playwright.request.newContext({ baseURL: await refreshAPIURL(baseURL) });
    try {
      await use(request);
    } finally {
      await request.dispose();
    }
  },
  simulationState: async ({ assetURL, actorGuids, fixtureVariant }, use) =>
    use(buildDemoFixture(assetURL, fixtureVariant, actorGuids)),
  dataset: async ({ simulationState, guestMode, request, baseURL, playwright }, use) => {
    const dataset = await base.step('create visual accounts and game', () =>
      createDataset(request, simulationState, guestMode !== 'none'),
    );
    try {
      await use(dataset);
    } finally {
      const api = await playwright.request.newContext({ baseURL: process.env.VISUAL_API_URL ?? baseURL });
      try {
        await dataset.cleanup(api);
      } finally {
        await api.dispose();
      }
    }
  },
  room: async ({ dataset, baseURL, player, guestPlayer, guestMode }, use) => {
    const roomCode = await base.step('create the visual room', () => dataset.createRoom());
    const room = { ...dataset, roomCode, origin: process.env.VISUAL_API_URL ?? baseURL! };
    try {
      await Promise.all(
        [player.page, ...(guestMode === 'joined' && guestPlayer ? [guestPlayer.page] : [])].map(player =>
          player.goto(`/room/${room.roomCode}`, { waitUntil: 'commit' }),
        ),
      );
      await use(room);
    } finally {
      await closeRoom(room);
    }
  },
  // eslint-disable-next-line no-empty-pattern
  browserErrors: async ({}, use) => use([]),
  context: async ({ context, browserErrors }, use) => {
    await configureContext(context, browserErrors);
    await use(context);
  },
  player: async ({ page, dataset }, use) => {
    const connection = observeRoom(page);
    try {
      await signIn(page, dataset.authorLogin);
      await use({ page, connection });
    } finally {
      connection.dispose();
    }
  },
  guestPlayer: async ({ browser, context: _context, dataset, baseURL, browserErrors }, use) => {
    if (!dataset.guestLogin) {
      await use(undefined);
      return;
    }
    const context = await browser.newContext({ baseURL });
    let connection: RoomConnection | undefined;
    try {
      await configureContext(context, browserErrors);
      const page = await context.newPage();
      connection = observeRoom(page);
      await signIn(page, dataset.guestLogin);
      await use({ page, connection });
    } finally {
      connection?.dispose();
      await context.close();
    }
  },
  roomReady: [
    async ({ player, guestPlayer, guestMode, room, browserErrors, waitForRoom }, use, testInfo) => {
      if (['dev', 'headed'].includes(process.env.VISUAL_MODE ?? '')) assertSnapshotComparisonMode(testInfo);
      if (waitForRoom)
        await base.step('load visual players', async () => {
          await Promise.all(
            [player.page, ...(guestMode === 'joined' && guestPlayer ? [guestPlayer.page] : [])].map(async player => {
              await waitForClientReady(player);
              expect(
                await player.locator('canvas').boundingBox(),
                'fixture coordinates require a full viewport canvas',
              ).toEqual({ x: 0, y: 0, ...coordinates.viewport });
            }),
          );
        });
      if (waitForRoom) await base.step('wait for room stability', () => waitForRoomStable(room));
      await use();
      if (testInfo.status !== testInfo.expectedStatus) {
        const captures = await Promise.allSettled(
          [player.page, ...(guestPlayer ? [guestPlayer.page] : [])].map(async (page, index) => {
            const name = `room-before-close-client-${index + 1}`;
            const path = testInfo.outputPath(`${name}.png`);
            await page.screenshot({ path, timeout: 30_000 });
            await testInfo.attach(name, { path, contentType: 'image/png' });
          }),
        );
        const errors = captures.flatMap(capture => (capture.status === 'rejected' ? [String(capture.reason)] : []));
        if (errors.length)
          await testInfo.attach('room-capture-errors', {
            body: JSON.stringify(errors),
            contentType: 'application/json',
          });
      } else expect(browserErrors, 'browser errors').toEqual([]);
    },
    { auto: true },
  ],
});

export {
  expect,
  expectActorUnchanged,
  expectRoomUnchanged,
  expectClientAction,
  expectSpawnedActor,
  expectChangedCanvases,
  expectMatchingCanvases,
  expectStoredScreenshot,
} from './assertions';
