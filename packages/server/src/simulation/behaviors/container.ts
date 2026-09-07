import { Axis, Vector3 } from '@babylonjs/core';
import { ActorType, type ActorStateUpdate, type BagState, type TileState, type UnknownActorState } from '@tt/states';
import { shuffle as shuffleItems } from '@tt/utils';
import { ServerActorBuilder } from '../serverActorBuilder';
import type { ServerBase } from '../actors';
import { pick } from './transform';

function faceUp(actor: ServerBase): boolean {
  const up = Vector3.TransformNormal(Axis.Y, actor.model.getWorldMatrix()).normalize();
  return Vector3.Dot(up, Axis.Y) > 0;
}

function updateContainer(actor: ServerBase, update: ActorStateUpdate): void {
  actor.updateState(update);

  if ('cards' in update && update.cards) actor.model.scaling.y = update.cards.length;
  if ('size' in update && typeof update.size === 'number') {
    actor.model.scaling.y = update.size;
    actor.__collider.scaling.y = update.size;
    actor._forceUpdate();
  }
}

export async function pickItem(actor: ServerBase, clientId: string, pickHeight: number): Promise<ServerBase | null> {
  const state = actor.toState() as UnknownActorState;
  const transformation = structuredClone(actor.transformation);
  let child: BagState['containedObjects'][number] | TileState | null = null;
  let update: ActorStateUpdate | null = null;

  if (state.type === ActorType.BAG) {
    if (state.containedObjects.length < 1) return null;
    child = structuredClone(state.containedObjects.at(-1)!);
    update = { guid: state.guid, containedObjects: structuredClone(state.containedObjects.slice(0, -1)) };
  } else if (state.type === ActorType.DECK) {
    if (state.cards.length < 1) return null;
    child = structuredClone(faceUp(actor) ? state.cards.at(-1)! : state.cards.at(0)!);
    update = {
      guid: state.guid,
      cards: structuredClone(faceUp(actor) ? state.cards.slice(0, -1) : state.cards.slice(1)),
    };
  } else if (state.type === ActorType.TILE_STACK) {
    if (state.size < 2) return null;
    const { size: _size, ...tileData } = structuredClone(state);
    child = {
      ...tileData,
      guid: actor.scene.getUniqueGUID(),
      type: ActorType.TILE,
    } satisfies TileState;
    transformation.scale[1] /= state.size;
    update = { guid: state.guid, size: state.size - 1 };
  }

  if (!child || !update) return null;
  transformation.position[1] += 1;
  child.transformation = transformation;
  updateContainer(actor, update);

  let spawned: ServerBase | null;
  try {
    spawned = await ServerActorBuilder.build(child);
  } catch (error) {
    if (state.type === ActorType.TILE_STACK) {
      const currentState = actor.toState() as UnknownActorState;
      if (currentState.type === ActorType.TILE_STACK) {
        // Restore this reservation without undoing other completed draws.
        updateContainer(actor, { guid: state.guid, size: currentState.size + 1 });
      }
    }
    throw error;
  }

  if (spawned) pick(spawned, clientId, pickHeight);
  return spawned;
}

export function shuffle(actor: ServerBase): void {
  const state = actor.toState() as UnknownActorState;
  if (state.type === ActorType.BAG) {
    const containedObjects = structuredClone(state.containedObjects);
    shuffleItems(containedObjects);
    actor.updateState({ guid: state.guid, containedObjects });
  } else if (state.type === ActorType.DECK) {
    const cards = structuredClone(state.cards);
    shuffleItems(cards);
    actor.updateState({ guid: state.guid, cards });
  }
}
