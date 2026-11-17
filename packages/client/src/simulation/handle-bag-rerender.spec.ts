import { CreateBox, NullEngine } from '@babylonjs/core';
import { SimulationSceneBase } from '@tt/simulation';
import { ActorType, type BagState, type UnknownActorState } from '@tt/states';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Bag } from './actors';
import { ClientActorBuilder } from './ClientActorBuilder';
import { Simulation, type SimulationCallbacks } from './Simulation';

const item = (guid: string): UnknownActorState => ({
  guid,
  name: guid,
  type: ActorType.ACTOR,
  model: { meshURL: 'box.obj' },
});
const state: BagState = {
  guid: 'bag',
  name: 'Bag',
  type: ActorType.BAG,
  containedObjects: [item('first'), item('second')],
};

describe('bag updates during spawning', () => {
  let engine: NullEngine;
  let scene: SimulationSceneBase;
  let sim: Simulation;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new SimulationSceneBase(engine);
    sim = new Simulation(scene, {} as SimulationCallbacks);
    vi.spyOn(sim, 'getCursor').mockReturnValue([0, 0]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    scene.dispose();
    engine.dispose();
  });

  it.each(['handleSpawnActor', 'handleSpawnPickedActor'] as const)(
    'keeps the latest contents received while %s is loading',
    async handler => {
      let complete!: (actor: Bag) => void;
      vi.spyOn(ClientActorBuilder, 'build').mockImplementation(() => new Promise<Bag>(resolve => (complete = resolve)));
      const spawning = sim[handler](state);
      sim.handleBagRerender(state.guid, [item('second'), item('first')]);
      sim.handleBagRerender(state.guid, []);
      const loaded = new Bag(state, CreateBox('bag', {}, scene));
      complete(loaded);
      await spawning;

      expect(loaded.toState().containedObjects).toEqual([]);
    },
  );

  it('discards queued contents when a removed bag is replaced with the same guid', async () => {
    let complete!: (actor: Bag) => void;
    const build = vi
      .spyOn(ClientActorBuilder, 'build')
      .mockImplementationOnce(() => new Promise<Bag>(resolve => (complete = resolve)));
    const oldSpawn = sim.handleSpawnActor(state);
    sim.handleBagRerender(state.guid, []);
    sim.handleRemoveActor(state.guid);

    const replacementState: BagState = { ...state, containedObjects: [item('replacement')] };
    const replacement = new Bag(replacementState, CreateBox('replacement', {}, scene));
    build.mockResolvedValueOnce(replacement);
    await sim.handleSpawnActor(replacementState);
    const stale = new Bag(state, CreateBox('stale', {}, scene));
    complete(stale);
    await oldSpawn;

    expect(stale.isDisposed()).toBe(true);
    expect(replacement.toState().containedObjects).toEqual(replacementState.containedObjects);
    expect(scene.actors).toEqual([replacement]);
  });
});
