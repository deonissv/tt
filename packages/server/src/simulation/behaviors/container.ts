import type { UnknownActorState } from '@tt/states';
import { ServerActorBuilder } from '../serverActorBuilder';
import type { ServerBase } from '../actors/serverBase';

interface ReservationBatch {
  available: boolean[];
  pending: number;
}
interface ReservedSlot {
  batch: ReservationBatch;
  index: number;
}

// Retain original positions until overlapping builds settle. Imported items can
// share GUIDs, so identify reservations by slot rather than item identity.
const reservations = new WeakMap<ServerBase, ReservationBatch>();

export function reserveSlot(actor: ServerBase, size: number, fromEnd: boolean): ReservedSlot {
  let batch = reservations.get(actor);
  if (!batch) {
    batch = { available: Array<boolean>(size).fill(true), pending: 0 };
    reservations.set(actor, batch);
  }
  const index = fromEnd ? batch.available.lastIndexOf(true) : batch.available.indexOf(true);
  batch.available[index] = false;
  batch.pending++;
  return { batch, index };
}

export async function spawnDrawnItem(
  actor: ServerBase,
  childState: UnknownActorState,
  clientId: string,
  pickHeight: number,
  onBuildFailure?: () => void,
): Promise<ServerBase | null> {
  const child = structuredClone(childState);
  const scene = actor.scene;
  child.guid = scene.getUniqueGUID(child.guid);
  // A player draws a movable item even when its container is locked.
  child.locked = false;
  const transformation = structuredClone(actor.transformation);
  transformation.position[1] += 1;
  child.transformation = transformation;
  let spawned: ServerBase | null;
  try {
    spawned = await ServerActorBuilder.build(child);
  } catch (error) {
    onBuildFailure?.();
    throw error;
  } finally {
    scene.releaseGUID(child.guid);
  }
  if (!spawned) onBuildFailure?.();
  else spawned.pick(clientId, pickHeight);
  return spawned;
}

export function restoreSlot(slot: ReservedSlot): number {
  const index = slot.batch.available.slice(0, slot.index).filter(Boolean).length;
  slot.batch.available[slot.index] = true;
  return index;
}

export function releaseSlot(actor: ServerBase, slot: ReservedSlot): void {
  if (--slot.batch.pending === 0) reservations.delete(actor);
}
