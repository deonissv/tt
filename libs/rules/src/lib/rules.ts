import { ActorType, type DieBaseState, type UnknownActorState } from '@tt/states';
import type { Tuple } from '@tt/utils';

export enum Capability {
  Pickable = 'PICKABLE',
  Flippable = 'FLIPPABLE',
  Rotatable = 'ROTATABLE',
  Rollable = 'ROLLABLE',
  Container = 'CONTAINER',
  Shuffleable = 'SHUFFLEABLE',
}

export interface PlayerCtx {
  code: string;
}

const STANDARD = new Set([Capability.Pickable, Capability.Flippable, Capability.Rotatable]);
const DIE = new Set([...STANDARD, Capability.Rollable]);

/**
 * Actor-type extension checklist: add the ActorType entry, state schema,
 * persisted-state parser validators, this capability row, server binding
 * factory, and client view factory. Behavior routing remains capability-based
 * and never needs an actor class.
 */
export const BASE_CAPABILITIES: Record<ActorType, ReadonlySet<Capability>> = {
  [ActorType.ACTOR]: STANDARD,
  [ActorType.BAG]: new Set([...STANDARD, Capability.Container, Capability.Shuffleable]),
  [ActorType.CARD]: STANDARD,
  [ActorType.DECK]: new Set([...STANDARD, Capability.Container, Capability.Shuffleable]),
  [ActorType.TILE]: STANDARD,
  [ActorType.DIE6ROUND]: DIE,
  [ActorType.DIE4]: DIE,
  [ActorType.DIE6]: DIE,
  [ActorType.DIE8]: DIE,
  [ActorType.DIE10]: DIE,
  [ActorType.DIE12]: DIE,
  [ActorType.DIE20]: DIE,
  [ActorType.TILE_STACK]: new Set([...STANDARD, Capability.Container]),
  [ActorType.PAWN_TOKEN]: STANDARD,
};

export function containerSize(state: UnknownActorState): number | null {
  switch (state.type) {
    case ActorType.BAG:
      return state.containedObjects.length;
    case ActorType.DECK:
      return state.cards.length;
    case ActorType.TILE_STACK:
      return state.size;
    default:
      return null;
  }
}

export function isContainerEmpty(state: UnknownActorState): boolean {
  const size = containerSize(state);
  return size === null || size < (state.type === ActorType.TILE_STACK ? 2 : 1);
}

export function can(state: UnknownActorState, capability: Capability, _ctx?: PlayerCtx): boolean {
  if (!BASE_CAPABILITIES[state.type]?.has(capability)) return false;
  if (state.locked) return false;
  if (capability === Capability.Container && isContainerEmpty(state)) return false;

  if (capability === Capability.Shuffleable) {
    const size = containerSize(state);
    return size !== null && size > 1;
  }

  return true;
}

export function dieValue(state: DieBaseState, rotation: Tuple<number, 3>): number | null {
  return state.rotationValues.reduce(
    (closest, row) => {
      const dx = rotation[0] - row.rotation[0];
      const dy = rotation[1] - row.rotation[1];
      const dz = rotation[2] - row.rotation[2];
      const distance = dx * dx + dy * dy + dz * dz;
      return distance < closest.distance ? { value: row.value, distance } : closest;
    },
    { value: null as number | null, distance: Infinity },
  ).value;
}
