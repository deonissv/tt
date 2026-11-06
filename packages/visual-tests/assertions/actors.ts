import { expect } from '@playwright/test';
import type { SimulationStateSave, UnknownActorState } from '@tt/states';
import { captureRoom, type Room } from '../support/api';
import { getActor, waitForActorStable, PHYSICS_STABILITY_TOLERANCES } from '../support/physics';
import { compareSnapshots } from './snapshots';

export async function expectSpawnedActor(room: Room, before: SimulationStateSave): Promise<UnknownActorState> {
  const previous = before.actorStates ?? [];
  const previousGuids = new Set(previous.map(actor => actor.guid));
  await expect
    .poll(async () => (await captureRoom(room)).state.actorStates?.length ?? 0, {
      message: 'extraction did not create one additional actor',
      timeout: 30_000,
    })
    .toBe(previous.length + 1);
  const current = (await captureRoom(room)).state.actorStates ?? [];
  const spawned = current.filter(actor => !previousGuids.has(actor.guid));
  expect(spawned, 'extraction did not create exactly one new identity').toHaveLength(1);
  const actor = spawned[0];
  return getActor((await waitForActorStable(room, actor.guid, () => true, actor)).state, actor.guid);
}

export const expectActorUnchanged = async (room: Room, before: UnknownActorState, duration = 2_000): Promise<void> => {
  const deadline = Date.now() + duration;
  do {
    const current = getActor((await captureRoom(room)).state, before.guid);
    // Physics can enter or leave sleep without a player changing the actor.
    const differences = compareSnapshots(
      { actorStates: [{ ...before, sleeping: undefined }] },
      { actorStates: [{ ...current, sleeping: undefined }] },
      PHYSICS_STABILITY_TOLERANCES,
    );
    if (differences.length > 0) {
      throw new Error(`Actor ${before.guid} changed during observation: ${JSON.stringify(differences)}`);
    }
    await new Promise(resolve => setTimeout(resolve, 150));
  } while (Date.now() < deadline);
};
