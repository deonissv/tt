/* eslint-disable @typescript-eslint/dot-notation */
import { HavokPlugin, Logger, Mesh, NullEngine, Scene, Vector3 } from '@babylonjs/core';
import { jest } from '@jest/globals';
import Actor from './actor';

import { GRAVITY } from '@shared/constants';
import type { ActorState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { initHavok } from '@shared/utils';

Logger.LogLevels = 0;
jest.mock('@shared/playground');

describe('Actor Class', () => {
  let engine: NullEngine;
  let scene: Scene;
  let modelMesh: Mesh;
  let state: ActorState;
  let actor: Actor;

  beforeAll(async () => {
    await initHavok();
  });

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
    const hp = new HavokPlugin(true, global.havok);
    const gravityVec = new Vector3(0, GRAVITY, 0);
    scene.enablePhysics(gravityVec, hp);

    modelMesh = new Mesh('testMesh', scene);
    state = {
      type: 0,
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

    jest.spyOn(Loader, 'loadMesh').mockImplementation(() => {
      return Promise.resolve(new Mesh('testMesh'));
    });
  });

  it('should create an actor with the correct initial state', () => {
    expect(actor.guid).toBe(state.guid);
    expect(actor.name).toBe(state.name);
    expect(actor.mass).toBe(state.mass);
    expect(actor.transformation).toEqual(state.transformation);
  });

  it('should update state correctly with toStateUpdate', () => {
    const actorStateUpdate: ActorState = {
      type: 0,
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
    jest.spyOn(Loader, 'loadModel').mockResolvedValue([modelMesh, null]);
    const newActor = await Actor.fromState(state);
    expect(newActor).toBeInstanceOf(Actor);
    expect(newActor!.guid).toBe(state.guid);
    expect(newActor!.name).toBe(state.name);
    expect(newActor!.mass).toBe(state.mass);
    expect(newActor!.transformation).toEqual(state.transformation);
  });

  it('should convert to state correctly', () => {
    const actorState = actor.toState();
    const expected: ActorState = {
      type: 0,
      guid: state.guid,
      name: state.name,
      model: state.model,
      transformation: state.transformation,
      mass: state.mass,
    };
    expect(actorState).toEqual(expected);
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
    const expected: ActorState = {
      type: 0,
      guid: '1234',
      model: state.model,
      name: state.name,
      transformation: {
        scale: [2, 2, 2],
        rotation: [Math.PI / 4, Math.PI / 4, Math.PI / 4],
        position: [2, 2, 2],
      },
      mass: state.mass,
    };
    expect(updatedState).toEqual(expected);
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
});
