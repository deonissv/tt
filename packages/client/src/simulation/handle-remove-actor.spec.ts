import { CreateBox, NullEngine } from '@babylonjs/core';
import { SimulationSceneBase } from '@tt/simulation';
import { ActorType, type ActorState } from '@tt/states';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClientBase } from './actors';
import { ClientActorBuilder } from './ClientActorBuilder';
import { Simulation, type SimulationCallbacks } from './Simulation';

describe('handleRemoveActor', () => {
  let engine: NullEngine;
  let scene: SimulationSceneBase;
  let sim: Simulation;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new SimulationSceneBase(engine);
    sim = new Simulation(scene, {} as SimulationCallbacks);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    scene.dispose();
    engine.dispose();
  });

  function addActor(guid: string): ClientBase<ActorState> {
    const state: ActorState = {
      guid,
      name: guid,
      type: ActorType.ACTOR,
      model: { meshURL: 'box.obj' },
      transformation: { position: [0, 1, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    };
    return new ClientBase(state, CreateBox(guid, {}, scene));
  }

  it('disposes the actor and drops it from the scene', () => {
    const actor = addActor('box');

    expect(scene.actors).toHaveLength(1);

    sim.handleRemoveActor('box');

    expect(actor.isDisposed()).toBe(true);
    expect(scene.actors).toHaveLength(0);
  });

  it('clears the local pick reference when the held actor is removed', () => {
    const actor = addActor('box');
    const fields = sim as unknown as { _pickedActor: ClientBase | null };
    fields._pickedActor = actor;

    sim.handleRemoveActor('box');

    expect(fields._pickedActor).toBeNull();
  });

  it('ignores unknown guids', () => {
    addActor('box');

    expect(() => sim.handleRemoveActor('ghost')).not.toThrow();
    expect(scene.actors).toHaveLength(1);
  });

  it.each(['handleSpawnActor', 'handleSpawnPickedActor'] as const)(
    'discards an actor removed while %s is loading',
    async handler => {
      const actor = addActor('box');
      const state = actor.toState();
      actor.dispose();
      let complete!: (actor: ClientBase) => void;
      vi.spyOn(ClientActorBuilder, 'build').mockImplementation(
        () =>
          new Promise<ClientBase>(resolve => {
            complete = resolve;
          }),
      );
      const spawn = sim[handler](state);

      sim.handleRemoveActor('box');
      const loaded = addActor('box');
      complete(loaded);
      await spawn;

      expect(loaded.isDisposed()).toBe(true);
      expect(scene.actors).toHaveLength(0);
      expect(sim).toHaveProperty('_pickedActor', null);
    },
  );

  it('allows a new spawn with the same guid after removal while the old spawn is loading', async () => {
    const actor = addActor('box');
    const state = actor.toState();
    actor.dispose();
    let complete!: (actor: ClientBase) => void;
    const build = vi.spyOn(ClientActorBuilder, 'build').mockImplementationOnce(
      () =>
        new Promise<ClientBase>(resolve => {
          complete = resolve;
        }),
    );
    const staleSpawn = sim.handleSpawnActor(state);
    sim.handleRemoveActor('box');
    const replacement = addActor('box');
    build.mockResolvedValueOnce(replacement);
    await sim.handleSpawnActor(state);
    const staleActor = addActor('box');
    complete(staleActor);
    await staleSpawn;

    expect(staleActor.isDisposed()).toBe(true);
    expect(replacement.isDisposed()).toBe(false);
    expect(scene.actors).toEqual([replacement]);
  });
});
