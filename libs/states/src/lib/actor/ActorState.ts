import type { OptionalAllBut } from '@tt/utils';
import type { ActorBaseState } from '../ActorBaseState';
import type { ActorType } from '../ActorType';
import type { UnknownActorState } from '../ActorUnion';
import type { Model } from '../Model';

export interface ActorState extends ActorBaseState {
  type: ActorType.ACTOR;

  model: Model;
  children?: ActorState[];
  containedObjects?: ActorBaseState[];
}

/**
 * A partial actor update that retains each actor variant's own fields.
 *
 * The conditional makes the update distributive over UnknownActorState. This
 * lets a supplied `type` discriminate fields such as `cards` and `size` while
 * keeping `type` optional for compatibility with existing transform updates.
 */
export type ActorStateUpdate = UnknownActorState extends infer State
  ? State extends UnknownActorState
    ? OptionalAllBut<State, 'guid'>
    : never
  : never;

/** Apply an actor update without mutating either serializable input. */
export function applyActorStateUpdate(actor: UnknownActorState, update: ActorStateUpdate): UnknownActorState {
  const clonedActor = structuredClone(actor);
  const clonedUpdate = structuredClone(update);

  const merged = {
    ...clonedActor,
    ...clonedUpdate,
    guid: actor.guid,
  } as UnknownActorState;

  if (clonedActor.transformation || clonedUpdate.transformation) {
    merged.transformation = {
      scale: clonedUpdate.transformation?.scale ?? clonedActor.transformation?.scale,
      rotation: clonedUpdate.transformation?.rotation ?? clonedActor.transformation?.rotation,
      position: clonedUpdate.transformation?.position ?? clonedActor.transformation?.position,
    };
  }

  return merged;
}
