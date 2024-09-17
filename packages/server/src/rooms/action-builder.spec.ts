import { CreateBox, Logger, Mesh } from '@babylonjs/core';
import { getPhSim } from '@server/test/testUtils';
import { ActorType } from '@shared/dto/states';
import { initHavok } from '@shared/initHavok';
import { wait } from '@shared/utils';
import { ServerAction } from '@shared/ws';
import type { MsgMap } from '@shared/ws/ws';
import type { Card } from '../simulation/actors';
import { Actor, Deck, ServerBase } from '../simulation/actors';
import { ServerActorBuilder } from '../simulation/serverActorBuilder';
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

  it('returns RERENDER_DECK', async () => {
    vi.spyOn(ServerActorBuilder, 'buildCard').mockImplementation(() => {
      return Promise.resolve(
        new Actor(
          { guid: 'card', name: 'card', type: ActorType.ACTOR, model: { meshURL: '' } },
          new Mesh('card'),
        ) as unknown as Card,
      );
    });

    const sim = getPhSim();

    sim.start();
    await wait(100);

    new Deck(
      {
        guid: 'deck',
        name: 'deck',
        type: ActorType.DECK,
        cards: [
          {
            type: ActorType.CARD,
            guid: 'card1',
            name: 'card1',
            faceURL: 'url1face',
            backURL: 'url1back',
            cols: 1,
            rows: 1,
            sequence: 0,
          },
          {
            type: ActorType.CARD,
            guid: 'card2',
            name: 'card2',
            faceURL: 'url2face',
            backURL: 'url2back',
            cols: 1,
            rows: 1,
            sequence: 0,
          },
        ],
      },
      new Mesh('deckMesh'),
    );
    await wait(100);
    const initState = structuredClone(sim.toState());
    await wait(250);
    await (sim.actors[0] as Deck).pickItem('client', 1);
    await wait(250);

    actionBuilder.prevSimState = initState;
    actionBuilder.sim = sim;

    const state = sim.toState();
    const actions = actionBuilder.getSimActions(state);
    sim.stop();

    const renderActior = actions.find(action => action.type === ServerAction.RERENDER_DECK);
    expect(renderActior).toBeDefined();
  });
});
