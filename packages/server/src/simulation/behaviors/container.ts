import type { UnknownActorState } from '@tt/states';
import { ServerActorBuilder } from '../serverActorBuilder';
import type { ServerBase } from '../actors/serverBase';

export async function spawnDrawnItem(
  actor: ServerBase,
  child: UnknownActorState,
  clientId: string,
  pickHeight: number,
  onBuildFailure?: () => void,
): Promise<ServerBase | null> {
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
  if (spawned) spawned.pick(clientId, pickHeight);
  return spawned;
}
