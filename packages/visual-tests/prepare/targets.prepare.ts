import fs from 'node:fs';
import path from 'node:path';
import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { PNG } from 'pngjs';
import { ACTOR_MANIFEST } from '../fixtures/manifest';
import { buildDemoFixture, type FixtureVariant } from '../fixtures/demo';
import { buildRenderFixture } from '../fixtures/render';
import { createDataset } from '../fixtures/dataset';
import { closeRoom, type Room } from '../support/api';
import { signIn } from '../support/auth';
import { configureContext, waitForClientReady, waitForRenderedFrames } from '../support/rendering';
import { getActor, waitForActorStable, waitForRoomStable } from '../support/physics';
import { findVisualTarget } from './find-target';
import { ClientAction } from '@tt/actions';
import { positionChanged, rotationChanged } from '../support/transforms';
import { expectClientAction, expectSpawnedActor } from '../assertions';
import { screenshotStyle } from '../support/screenshot-style';
import { observeRoom } from '../support/room-connection';

const background = PNG.sync.read(fs.readFileSync(path.resolve(__dirname, '../fixtures/targeting/empty-table.png')));

async function recordPoint(page: Page, testInfo: TestInfo, name: string, anchor?: readonly [number, number]) {
  await page.mouse.move(10, 10);
  await waitForRenderedFrames(page);
  const image = await page
    .locator('canvas')
    .screenshot({ scale: 'css', animations: 'disabled', style: screenshotStyle });
  const marked = PNG.sync.read(image);
  const point = findVisualTarget(marked, background, anchor);
  fs.writeFileSync(testInfo.outputPath(`${name}.png`), new Uint8Array(image));
  for (let delta = -8; delta <= 8; delta++) {
    for (const [x, y] of [
      [Math.floor(point[0]) + delta, Math.floor(point[1])],
      [Math.floor(point[0]), Math.floor(point[1]) + delta],
    ]) {
      if (x < 0 || y < 0 || x >= marked.width || y >= marked.height) continue;
      marked.data.set([255, 0, 255, 255], (y * marked.width + x) * 4);
    }
  }
  fs.writeFileSync(testInfo.outputPath(`${name}-target.png`), new Uint8Array(PNG.sync.write(marked)));
  return point;
}

test('prepare candidate click coordinates for review', async ({ browser, playwright, baseURL }, testInfo) => {
  const api = await playwright.request.newContext({ baseURL: process.env.VISUAL_API_URL ?? baseURL });
  const profiles: Record<string, Record<string, number[]>> = { default: {}, render: {} };
  const poses: Record<string, Record<string, unknown>> = { default: {} };
  const destinations: Record<string, number[]> = {};
  const cases = [
    ...ACTOR_MANIFEST.map(actor => ({ profile: 'default', guid: actor.guid })),
    ...ACTOR_MANIFEST.map(actor => ({ profile: 'after-clockwise', guid: actor.guid })),
    { profile: 'locked-actor', guid: '3b9ed5' },
    { profile: 'exhausted-tile-stack', guid: '51d35d' },
    { profile: 'depleting-containers', guid: '51d35d' },
    { profile: 'depleting-containers', guid: 'fb31d5' },
    { profile: 'face-down-deck', guid: 'fb31d5' },
    ...['3b9ed5', '8ac7c6', 'fb31d5', '51d35d'].map(guid => ({ profile: 'render', guid })),
  ];
  try {
    for (const { profile, guid } of cases) {
      await test.step(`${profile}/${guid}`, async () => {
        const origin = process.env.VISUAL_ASSET_URL ?? baseURL!;
        const state =
          profile === 'render'
            ? buildRenderFixture(origin, guid, guid === '8ac7c6' ? 'rotate' : guid === '3b9ed5' ? 'move' : 'extract')
            : buildDemoFixture(origin, profile === 'after-clockwise' ? 'default' : (profile as FixtureVariant), [guid]);
        const dataset = await createDataset(api, state, false);
        const context = await browser.newContext({
          baseURL,
          viewport: { width: background.width, height: background.height },
        });
        let room: Room | undefined;
        let disposeConnection: (() => void) | undefined;
        const errors: string[] = [];
        try {
          await configureContext(context, errors);
          const page = await context.newPage();
          const connection = observeRoom(page);
          disposeConnection = () => connection.dispose();
          await signIn(page, dataset.authorLogin);
          room = { ...dataset, roomCode: await dataset.createRoom(), origin: process.env.VISUAL_API_URL ?? baseURL! };
          await page.goto(`/room/${room.roomCode}`);
          await waitForClientReady(page);
          const settled = await waitForRoomStable(room);
          if (profile !== 'render' && profile !== 'after-clockwise') {
            poses[profile] ??= {};
            poses[profile][guid] = structuredClone(getActor(settled.state, guid).transformation);
          }
          const point = await recordPoint(page, testInfo, `${profile}-${guid}`);
          profiles[profile] ??= {};
          profiles[profile][guid] = [...point];
          if (profile === 'after-clockwise') {
            const before = getActor(settled.state, guid);
            await page.mouse.move(point[0], point[1]);
            await waitForRenderedFrames(page);
            await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), guid);
            const held = getActor((await waitForActorStable(room, guid, () => true, before)).state, guid);
            await page.keyboard.press('KeyE');
            const rotated = getActor((await waitForActorStable(room, guid, rotationChanged, held)).state, guid);
            await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up(), guid);
            await waitForActorStable(room, guid, () => true, rotated);
            const next = await recordPoint(page, testInfo, `${profile}-${guid}-released`, point);
            profiles[profile][guid] = [...next];
            await page.mouse.move(next[0], next[1]);
            await waitForRenderedFrames(page);
            await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), guid);
            await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up(), guid);
          } else if (profile === 'default' && ['3b9ed5', 'fb31d5', '51d35d'].includes(guid)) {
            let moved = guid;
            const end: readonly [number, number] = [point[0] + (guid === '3b9ed5' ? 36 : 48), point[1] + 24];
            if (guid === '3b9ed5') {
              const before = getActor(settled.state, guid);
              await page.mouse.move(point[0], point[1]);
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
            } else {
              await page.locator('canvas').focus();
              await page.mouse.move(point[0], point[1]);
              await waitForRenderedFrames(page);
              await expectClientAction(connection, ClientAction.PICK_ITEM, () => page.keyboard.press('KeyG'), guid);
              const spawned = await expectSpawnedActor(room, settled.state);
              // The browser loads the new held item after the server announces it.
              await expect(async () => {
                await expectClientAction(
                  connection,
                  ClientAction.MOVE_ACTOR,
                  () => page.mouse.move(point[0] + 0.1, point[1]).then(() => page.mouse.move(point[0], point[1])),
                  spawned.guid,
                  1_000,
                );
              }).toPass({ timeout: 30_000, intervals: [100] });
              // The keyboard extraction already holds the new item.
              await page.mouse.down();
              await expectClientAction(
                connection,
                ClientAction.MOVE_ACTOR,
                () => page.mouse.move(end[0], end[1], { steps: 20 }),
                spawned.guid,
              );
              await waitForActorStable(room, spawned.guid, positionChanged, spawned);
              await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up(), spawned.guid);
              await waitForActorStable(room, spawned.guid, positionChanged, spawned);
              moved = spawned.guid;
            }
            await waitForRoomStable(room);
            const name =
              guid === '3b9ed5' ? 'actor-after-drag' : guid === 'fb31d5' ? 'extracted-card' : 'extracted-tile';
            const next = await recordPoint(page, testInfo, name, end);
            destinations[name] = [...next];
            await page.mouse.move(next[0], next[1]);
            await waitForRenderedFrames(page);
            await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), moved);
            await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up(), moved);
          } else if (!state.actorStates![0].locked) {
            await page.mouse.move(point[0], point[1]);
            await waitForRenderedFrames(page);
            await expectClientAction(connection, ClientAction.PICK_ACTOR, () => page.mouse.down(), guid);
            await expectClientAction(connection, ClientAction.RELEASE_ACTOR, () => page.mouse.up(), guid);
          }
          expect(errors).toEqual([]);
        } finally {
          disposeConnection?.();
          try {
            if (room) await closeRoom(room);
          } finally {
            await context.close();
            await dataset.cleanup();
          }
        }
      });
    }
    fs.writeFileSync(
      testInfo.outputPath('coordinates.candidate.json'),
      JSON.stringify(
        { viewport: { width: background.width, height: background.height }, profiles, destinations },
        null,
        2,
      ) + '\n',
    );
    fs.writeFileSync(testInfo.outputPath('poses.candidate.json'), JSON.stringify({ profiles: poses }, null, 2) + '\n');
  } finally {
    await api.dispose();
  }
});
