import fs from 'node:fs';
import path from 'node:path';
import { request as playwrightRequest, type BrowserContext } from '@playwright/test';
import { ACTOR_MANIFEST } from '../fixtures/manifest';
import { ClientAction } from '@tt/actions';
import coordinates from '../fixtures/targeting/coordinates.json';
import { positionChanged, rotationChanged } from '../support/transforms';
import { captureRoom, closeRoom, roomIsRunning } from '../support/api';
import { configureContext, waitForClientReady, waitForRenderedFrames } from '../support/rendering';
import { actorIdentityList, getActor, waitForActorStable, waitForRoomStable } from '../support/physics';
import { canvasClip, captureCanvases } from '../support/screenshots';
import { expect, test, expectMatchingCanvases, expectClientAction, expectSpawnedActor } from '../test';
import { signIn } from '../support/auth';

test.use({ fixtureVariant: 'persistence' });
test.setTimeout(15 * 60_000);

test(
  'save and restore extracted, shuffled, and rolled actors across an application restart',
  {
    tag: [
      ...ACTOR_MANIFEST.map(actor => `@actor:${actor.typeName}`),
      '@behavior:extract',
      '@behavior:persistence',
      '@behavior:roll',
      '@behavior:shuffle',
    ],
  },
  async ({ player: { page, connection }, guestPlayer, room, browser, baseURL, browserErrors }, testInfo) => {
    const { applicationStartedAt, restartApplication } = await import('../setup/environment.mjs');
    expect(testInfo.config.updateSnapshots, 'restart comparisons must not overwrite the saved images').toBe('none');
    const names = ['before-restart-client-1.png', 'before-restart-client-2.png'];
    const references = names.map(name => testInfo.snapshotPath(name));
    try {
      const saved = await test.step('save and close the room through the UI', async () => {
        const deckStart = coordinates.profiles.default.fb31d5;
        await page.locator('canvas').focus();
        await page.mouse.move(deckStart[0], deckStart[1]);
        await waitForRenderedFrames(page);
        const beforeOrder = actorIdentityList(getActor((await captureRoom(room)).state, 'fb31d5'));
        expect(new Set(beforeOrder).size).toBeGreaterThanOrEqual(8);
        const identities = [...beforeOrder].sort();
        let order = beforeOrder;
        for (let attempt = 0; attempt < 3; attempt++) {
          await expectClientAction(connection, ClientAction.SHUFFLE, () => page.keyboard.press('KeyH'), 'fb31d5');
          order = actorIdentityList(getActor((await waitForRoomStable(room)).state, 'fb31d5'));
          expect([...order].sort(), 'shuffle changed identities or count').toEqual(identities);
          if (order.some((id, index) => id !== beforeOrder[index])) break;
        }
        expect(order, 'three shuffle actions retained the original order').not.toEqual(beforeOrder);
        const beforeExtraction = (await captureRoom(room)).state;
        const cardStart = coordinates.destinations['extracted-card'];
        // Release clear of the deck and locked tile stack in one drag. A card
        // dropped beside the deck can settle on it, invalidating a fixed re-pick.
        const extractionEnd = [cardStart[0] - 160, cardStart[1] + 100];
        await page.locator('canvas').focus();
        await page.mouse.move(deckStart[0], deckStart[1]);
        await waitForRenderedFrames(page);
        await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), 'fb31d5');
        const spawned = await expectSpawnedActor(room, beforeExtraction);
        // The browser loads the new held item after the server announces it.
        await expect(async () => {
          await expectClientAction(
            connection,
            ClientAction.MOVE_ACTOR,
            () =>
              page.mouse.move(deckStart[0] + 0.1, deckStart[1]).then(() => page.mouse.move(deckStart[0], deckStart[1])),
            spawned.guid,
            1_000,
          );
        }).toPass({ timeout: 30_000, intervals: [100] });
        // The keyboard extraction already holds the new item.
        await page.mouse.down();
        await expectClientAction(
          connection,
          ClientAction.MOVE_ACTOR,
          () => page.mouse.move(extractionEnd[0], extractionEnd[1], { steps: 20 }),
          spawned.guid,
        );
        await waitForActorStable(room, spawned.guid, positionChanged, spawned);
        await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up(), spawned.guid);
        const extracted = getActor(
          (await waitForActorStable(room, spawned.guid, positionChanged, spawned)).state,
          spawned.guid,
        );
        expect(extracted.transformation!.position![1], 'extracted card did not settle on the table').toBeLessThan(1);
        expect(extracted.transformation!.position![1]).toBeGreaterThan(0.8);
        const dieBefore = getActor((await captureRoom(room)).state, 'cabfb6');
        const dieStart = coordinates.profiles.default.cabfb6;
        await page.locator('canvas').focus();
        await page.mouse.move(dieStart[0], dieStart[1]);
        await waitForRenderedFrames(page);
        await expectClientAction(connection, ClientAction.ROLL, () => page.keyboard.press('KeyR'), 'cabfb6');
        await waitForActorStable(room, 'cabfb6', rotationChanged, dieBefore, 90_000);
        await waitForRoomStable(room);
        await expectMatchingCanvases(testInfo, 'before-application-restart', [page, guestPlayer!.page]);
        const state = (await captureRoom(room)).state;
        const canvases = await captureCanvases([page, guestPlayer!.page]);
        fs.mkdirSync(path.dirname(references[0]), { recursive: true });
        for (const [index, canvas] of canvases.entries()) fs.writeFileSync(references[index], new Uint8Array(canvas));
        await page.getByTestId('RoomPreferencesIcon').click();
        await page.getByRole('button', { name: 'Stop room' }).click();
        await expect.poll(() => roomIsRunning(room), { timeout: 30_000 }).toBe(false);
        await Promise.all([page.context().close(), guestPlayer!.page.context().close()]);
        return { state, startedAt: await applicationStartedAt() };
      });
      await test.step('restart the application while preserving the database', async () => {
        await restartApplication();
        expect(await applicationStartedAt(), 'application container did not restart').not.toBe(saved.startedAt);
      });
      await test.step('restore the room in fresh player contexts', async () => {
        const api = await playwrightRequest.newContext({ baseURL: process.env.VISUAL_API_URL });
        const contexts: BrowserContext[] = [];
        try {
          const response = await api.post(`/api/v1/rooms/start/${room.roomCode}`, {
            headers: { Authorization: `Bearer ${room.authorToken}` },
          });
          await expect(response).toBeOK();
          room.origin = new URL(response.url()).origin;
          const restored = await waitForRoomStable(room);
          await testInfo.attach('persistence-states', {
            body: Buffer.from(JSON.stringify({ saved: saved.state, restored: restored.state }, null, 2)),
            contentType: 'application/json',
          });
          expect(restored.state).toMatchSimulationState(saved.state, { position: 0.02, rotation: 0.01 });
          for (const login of [room.authorLogin, room.guestLogin!]) {
            const context = await browser.newContext({ baseURL });
            contexts.push(context);
            await configureContext(context, browserErrors);
            const page = await context.newPage();
            await signIn(page, login);
          }
          const players = await Promise.all(
            contexts.map(async context => {
              const page = context.pages()[0];
              await page.goto(`/room/${room.roomCode}`);
              await waitForClientReady(page);
              return page;
            }),
          );
          await waitForRoomStable(room);
          await expectMatchingCanvases(testInfo, 'after-application-restart', players);
          for (const [index, player] of players.entries()) {
            await expect(player).toHaveScreenshot(names[index], { clip: await canvasClip(player) });
          }
        } finally {
          await Promise.all(contexts.map(context => context.close()));
          try {
            await closeRoom(room);
          } finally {
            await api.dispose();
          }
        }
      });
    } finally {
      for (const reference of references) fs.rmSync(reference, { force: true });
    }
  },
);
