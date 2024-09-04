import { CreateBox, Logger } from '@babylonjs/core';
import { getPhSim, wait } from '@server/test/testUtils';
import { ActorType } from '@shared/dto/states';
import { initHavok } from '@shared/initHavok';
import { ServerAction } from '@shared/ws';
import type { MsgMap } from '@shared/ws/ws';
import { ServerBase } from '../simulation/actors';
import { ActionBuilder } from './action-builder';

describe('getSimActions', () => {
  let actionBuilder: ActionBuilder;

  beforeAll(async () => {
    Logger.LogLevels = 0;

    await initHavok();
  });

  beforeEach(() => {
    actionBuilder = new ActionBuilder();
  });

  it('returns ACTOR_MOVE actions', async () => {
    const sim = getPhSim();
    new ServerBase(
      {
        type: ActorType.ACTOR,
        guid: 'box',
        name: 'box',
        transformation: { position: [0, 1, 0] },
        model: { meshURL: '' },
      },
      CreateBox('box', { size: 1 }),
    );

    const initState = sim.toState();
    actionBuilder.prevSimState = initState;
    actionBuilder.sim = sim;

    sim.start();
    await wait(500);

    const state = sim.toState();

    const actions = actionBuilder.getSimActions(state);
    sim.stop();

    expect(actions.length).toBe(1);
    const move_action = actions[0] as MsgMap[ServerAction.MOVE_ACTOR];
    expect(move_action.type).toBe(ServerAction.MOVE_ACTOR);
    expect(move_action.payload.guid).toBe('box');
    expect(move_action.payload.position[0]).toBeCloseTo(0);
    expect(move_action.payload.position[1]).toBeCloseTo(0.55);
    expect(move_action.payload.position[2]).toBeCloseTo(0);
  });

  it('returns SPAWN_ACTOR actions', async () => {
    const sim = getPhSim();

    const initState = sim.toState();
    actionBuilder.prevSimState = initState;
    actionBuilder.sim = sim;

    sim.start();
    await wait(100);

    new ServerBase(
      {
        type: ActorType.ACTOR,
        guid: 'box1',
        name: 'box1',
        transformation: { position: [3, 1, 0] },
        model: { meshURL: '' },
      },
      CreateBox('box', { size: 1 }),
    );
    await wait(10);

    const state = sim.toState();
    const actions = actionBuilder.getSimActions(state);
    sim.stop();

    expect(sim.actors.length).toBe(1);
    expect(actions.map(a => a.type)).toContain(ServerAction.SPAWN_ACTOR);
    const spawnAction = actions.find(action => action.type === ServerAction.SPAWN_ACTOR)!;

    expect(spawnAction).toMatchObject({
      type: ServerAction.SPAWN_ACTOR,
      payload: {
        type: ActorType.ACTOR,
        guid: 'box1',
        mass: 1,
        name: 'box1',
        model: { meshURL: '' },
      },
    });
  });

  it('returns SPAWN_ACTOR actions', async () => {
    const sim = getPhSim();
    const initState = sim.toState();
    actionBuilder.prevSimState = initState;
    actionBuilder.sim = sim;

    sim.start();
    await wait(100);

    new ServerBase(
      {
        type: ActorType.ACTOR,
        guid: 'box1',
        name: 'box1',
        transformation: { position: [3, 1, 0] },
        model: { meshURL: '' },
      },
      CreateBox('box', { size: 1 }),
    );
    await wait(500);

    const state = sim.toState();
    const actions = actionBuilder.getSimActions(state);

    sim.stop();
    const spawnAction = actions.find(action => action.type === ServerAction.SPAWN_ACTOR)!;
    expect(spawnAction.payload.transformation!.position![0]).toBeCloseTo(3);
    expect(spawnAction.payload.transformation!.position![1]).toBeCloseTo(0.55);
    expect(spawnAction.payload.transformation!.position![2]).toBeCloseTo(0);
  });
});
