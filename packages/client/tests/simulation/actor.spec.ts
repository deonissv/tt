/* eslint-disable @typescript-eslint/dot-notation */
// import { jest } from '@jest/globals';
import { beforeEach, describe, it, vi, expect } from 'vitest';
import { Logger, Mesh, NullEngine, Scene, Vector3 } from '@babylonjs/core';
import { ActorState } from '@shared/src/dto/pg/actorState';
import Actor from '@client/src/playground/actor';
import { Loader } from '@client/src/playground/loader';

Logger.LogLevels = 0;
vi.mock('../../src/playground/loader');

describe('Actor Class', () => {
  let engine: NullEngine;
  let scene: Scene;
  let modelMesh: Mesh;
  let state: ActorState;
  let actor: Actor;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);

    modelMesh = new Mesh('testMesh', scene);
    state = {
      guid: '1234',
      name: 'testActor',
      model: {
        meshURL: '',
      },
      mass: 2,
      transformation: {
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
        position: [0, 0, 0],
      },
    };
    actor = new Actor(state, modelMesh);
  });

  it('should create an actor with the correct initial state', () => {
    const actor = new Actor(state, modelMesh);
    expect(actor.guid).toBe(state.guid);
    expect(actor.name).toBe(state.name);
    expect(actor.mass).toBe(state.mass);
    expect(actor.transformation).toEqual(state.transformation);
  });

  it('should update state correctly with toStateUpdate', () => {
    const actorStateUpdate: ActorState = {
      guid: '1234',
      transformation: {
        scale: [2, 2, 2],
        rotation: [Math.PI / 4, Math.PI / 4, Math.PI / 4],
        position: [2, 2, 2],
      },
      name: '',
      model: {
        meshURL: '',
      },
    };
    const result = actor.toStateUpdate(actorStateUpdate);
    expect(result).toEqual({
      guid: '1234',
      // name: 'updatedActor',
      name: 'testActor',
      transformation: {
        scale: [2, 2, 2],
        rotation: [Math.PI / 4, Math.PI / 4, Math.PI / 4],
        position: [2, 2, 2],
      },
      mass: 2,
    });
  });

  it('should create an actor from state', async () => {
    vi.spyOn(Loader, 'loadModel').mockResolvedValue([modelMesh, modelMesh]);
    const newActor = await Actor.fromState(state);
    expect(newActor).toBeInstanceOf(Actor);
    expect(newActor!.guid).toBe(state.guid);
    expect(newActor!.name).toBe(state.name);
    expect(newActor!.mass).toBe(state.mass);
    expect(newActor!.transformation).toEqual(state.transformation);
  });

  it('should convert to state correctly', () => {
    const actor = new Actor(state, modelMesh);
    const actorState = actor.toState();
    expect(actorState).toEqual({
      guid: state.guid,
      name: state.name,
      model: state.model,
      transformation: state.transformation,
      mass: state.mass,
    });
  });

  it('should apply state update correctly with applyStateUpdate', () => {
    const actorStateUpdate = {
      guid: '1234',
      transformation: {
        scale: [2, 2, 2],
        rotation: [Math.PI / 4, Math.PI / 4, Math.PI / 4],
        position: [2, 2, 2],
      },
    };
    const updatedState = Actor.applyStateUpdate(state, actorStateUpdate);
    expect(updatedState).toEqual({
      guid: '1234',
      model: state.model,
      name: state.name,
      transformation: {
        scale: [2, 2, 2],
        rotation: [Math.PI / 4, Math.PI / 4, Math.PI / 4],
        position: [2, 2, 2],
      },
      // mass: state.mass,
    });
  });

  // it('should update actor state correctly with update', () => {
  //   const actorStateUpdate = {
  //     guid: '1234',
  //     transformation: {
  //       position: [2, 2, 2],
  //     },
  //   };
  //   actor.update(actorStateUpdate);
  //   expect(actor['__targetPosition']).toEqual(new Vector3(2, 2, 2));
  // });

  it('should save current state correctly with toStateSave', () => {
    const savedState = actor.toStateSave();
    expect(savedState).toEqual({
      guid: '1234',
      name: 'testActor',
      model: state.model,
      transformation: {
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
        position: [0, 0, 0],
      },
      mass: 2,
    });
  });
});
