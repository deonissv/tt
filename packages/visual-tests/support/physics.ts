import { expect } from '@playwright/test';
import type { SimulationStateSave, UnknownActorState } from '@tt/states';
import { captureRoom, type Room, type RoomSnapshot } from './api';
import { compareSnapshots } from '../assertions/snapshots';

export const PHYSICS_STABILITY_TOLERANCES = { position: 0.005, rotation: 0.005 };

export const actorIdentityList = (actor: UnknownActorState): string[] => {
  if ('cards' in actor) return actor.cards.map(card => card.guid);
  if ('containedObjects' in actor && actor.containedObjects) {
    return actor.containedObjects.map(item => item.guid);
  }
  return [];
};

async function waitForStable(
  room: Room,
  stateFrom: (capture: RoomSnapshot) => SimulationStateSave | undefined,
  timeout: number,
  message: string,
): Promise<RoomSnapshot> {
  let anchor: SimulationStateSave | undefined;
  let stableSamples = 0;
  let capture!: RoomSnapshot;
  await expect
    .poll(
      async () => {
        capture = await captureRoom(room);
        const state = stateFrom(capture);
        if (!state) return { outcomeObserved: false };
        const differences = anchor ? compareSnapshots(anchor, state, PHYSICS_STABILITY_TOLERANCES) : [];
        if (!anchor || differences.length > 0) {
          anchor = structuredClone(state);
          stableSamples = 0;
        } else if (++stableSamples >= 5) return true;
        return { lastDifferences: differences };
      },
      { timeout, intervals: [150], message },
    )
    .toBe(true);
  return capture;
}

export function waitForActorStable(
  room: Room,
  guid: string,
  outcome: (before: UnknownActorState, current: UnknownActorState) => boolean,
  before: UnknownActorState,
  timeout = 60_000,
): Promise<RoomSnapshot> {
  let observed = false;
  return waitForStable(
    room,
    capture => {
      const current = getActor(capture.state, guid);
      observed ||= outcome(before, current);
      return observed ? { actorStates: [current] } : undefined;
    },
    timeout,
    `Actor ${guid} did not observe the expected outcome and remain stable`,
  );
}

export function waitForRoomStable(room: Room): Promise<RoomSnapshot> {
  return waitForStable(room, capture => capture.state, 90_000, 'Room did not remain stable');
}

export const getActor = (state: SimulationStateSave, guid: string): UnknownActorState => {
  const actor = state.actorStates?.find(actor => actor.guid === guid);
  if (!actor) throw new Error(`Actor ${guid} not found in snapshot`);
  return actor;
};
