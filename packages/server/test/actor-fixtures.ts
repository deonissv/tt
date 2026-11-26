import { CreateBox } from '@babylonjs/core';
import { ActorType, type ActorState, type BagState, type DeckState, type TileStackState } from '@tt/states';
import { afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { Actor, Bag, Deck, TileStack } from '../src/simulation/actors';
import type { Simulation } from '../src/simulation/simulation';
import { initHavok } from '../src/utils';
import { getPhSim } from './testUtils';

/** Constructs complete actors and disposes their physics scene after each test. */
export function useActorFixtures() {
  let sim: Simulation;
  let sequence = 0;
  beforeAll(async () => {
    await initHavok();
  });
  beforeEach(() => {
    sim = getPhSim();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    sim.dispose();
  });

  const mesh = () => CreateBox(`fixture-${sequence++}`, { size: 1 }, sim.scene);
  const actor = (
    state: ActorState = {
      type: ActorType.ACTOR,
      guid: `actor-${sequence}`,
      name: 'Actor',
      model: { meshURL: 'box.obj' },
    },
  ) => new Actor(structuredClone(state), mesh());

  return {
    actor,
    bag: (state: BagState) => new Bag(structuredClone(state), mesh()),
    deck: (state: DeckState) => new Deck(structuredClone(state), mesh()),
    stack: (state: TileStackState) => new TileStack(structuredClone(state), mesh()),
    spawned(clientId = 'client') {
      const spawned = actor();
      spawned.picked = clientId;
      vi.spyOn(spawned, 'pick').mockReturnValue(undefined);
      return spawned;
    },
  };
}
