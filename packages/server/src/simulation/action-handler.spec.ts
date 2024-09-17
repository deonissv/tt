import { CreateBox, Logger, Mesh } from '@babylonjs/core';
import { getPhSim } from '@server/test/testUtils';
import { PICK_HIGHT } from '@shared/constants';
import { ActorType } from '@shared/dto/states';
import { initHavok } from '@shared/initHavok';
import { wait } from '@shared/utils';
import { Client } from '../rooms/client';
import { ActionHandler } from './action-handler';
import type { Card } from './actors';
import { Actor, Deck, ServerBase, Tile, TileStack } from './actors';
import { ServerActorBuilder } from './serverActorBuilder';

describe('handleAction', () => {
  let actionHandler: ActionHandler;

  beforeAll(async () => {
    Logger.LogLevels = 0;

    await initHavok();
  });

  beforeEach(() => {
    actionHandler = new ActionHandler();
  });

  describe('PICK_ACTOR', () => {
    it('should picked actor raise actor on pick', async () => {
      const sim = getPhSim();
      new ServerBase(
        {
          type: ActorType.ACTOR,
          guid: 'box',
          name: 'box',
          transformation: { position: [0, 0.6, 0] },
          model: { meshURL: '' },
        },
        CreateBox('box', { size: 1 }),
      );
      sim.start();
      actionHandler.actors = sim.actors;
      actionHandler.client = new Client({
        code: 'client',
        roleId: 1,
        userId: 1,
        username: 'client',
      });
      actionHandler.client.pickHeight = PICK_HIGHT;

      await wait(100);
      actionHandler.handlePickActor('box');
      await wait(500);

      const state = sim.toState();
      const box = state.actorStates!.find(actor => actor.guid === 'box');
      expect(box!.transformation!.position![1]).toBeCloseTo(0.55 + PICK_HIGHT);
    });

    it('should raise picked actor once on several picks', async () => {
      const sim = getPhSim();
      new ServerBase(
        {
          type: ActorType.ACTOR,
          guid: 'box',
          name: 'box',
          transformation: { position: [0, 0.6, 0] },
          model: { meshURL: '' },
        },
        CreateBox('box', { size: 1 }),
      );
      sim.start();
      actionHandler.actors = sim.actors;
      actionHandler.client = new Client({
        code: 'client',
        roleId: 1,
        userId: 1,
        username: 'client',
      });
      actionHandler.client.pickHeight = PICK_HIGHT;

      await wait(100);
      actionHandler.handlePickActor('box');
      await wait(10);
      actionHandler.handlePickActor('box');
      await wait(10);
      actionHandler.handlePickActor('box');
      await wait(100);

      const state = sim.toState();
      const box = state.actorStates!.find(actor => actor.guid === 'box');
      expect(box!.transformation!.position![1]).toBeCloseTo(0.55 + PICK_HIGHT);
    });
  });

  describe('RELEASE_ACTOR', () => {
    it('should do nothing on release of non picked actor', async () => {
      const sim = getPhSim();
      new ServerBase(
        {
          type: ActorType.ACTOR,
          guid: 'box',
          name: 'box',
          transformation: { position: [0, 0.6, 0] },
          model: { meshURL: '' },
        },
        CreateBox('box', { size: 1 }),
      );
      sim.start();
      actionHandler.actors = sim.actors;
      actionHandler.client = new Client({
        code: 'client',
        roleId: 1,
        userId: 1,
        username: 'client',
      });
      actionHandler.client.pickHeight = PICK_HIGHT;

      await wait(100);
      actionHandler.handleReleaseActor('box');
      await wait(100);

      const state = sim.toState();
      const box = state.actorStates!.find(actor => actor.guid === 'box');
      expect(box!.transformation!.position![1]).toBeCloseTo(0.55);
    });

    it('should return to previous state after pick - release', async () => {
      const sim = getPhSim();
      new ServerBase(
        {
          type: ActorType.ACTOR,
          guid: 'box',
          name: 'box',
          transformation: { position: [0, 0.6, 0] },
          model: { meshURL: '' },
        },
        CreateBox('box', { size: 1 }),
      );
      sim.start();
      actionHandler.actors = sim.actors;
      actionHandler.client = new Client({
        code: 'client',
        roleId: 1,
        userId: 1,
        username: 'client',
      });
      actionHandler.client.pickHeight = PICK_HIGHT;

      await wait(300);
      actionHandler.handlePickActor('box');
      await wait(10);
      actionHandler.handleReleaseActor('box');
      await wait(500);

      const state = sim.toState();
      const box = state.actorStates!.find(actor => actor.guid === 'box');
      expect(box!.transformation!.position![1]).toBeCloseTo(0.55);
    });
  });

  describe('MOVE_ACTOR', () => {
    it('should not move non picked actor', async () => {
      const sim = getPhSim();
      new ServerBase(
        {
          type: ActorType.ACTOR,
          guid: 'box',
          name: 'box',
          transformation: { position: [0, 0.6, 0] },
          model: { meshURL: '' },
        },
        CreateBox('box', { size: 1 }),
      );
      sim.start();
      actionHandler.actors = sim.actors;
      actionHandler.client = new Client({
        code: 'client',
        roleId: 1,
        userId: 1,
        username: 'client',
      });
      actionHandler.client.pickHeight = PICK_HIGHT;

      await wait(100);
      actionHandler.handleMoveActor('box', [1, 0]);

      await wait(500);

      const state = sim.toState();
      const box = state.actorStates!.find(actor => actor.guid === 'box');
      expect(box!.transformation!.position![0]).toBeCloseTo(0);
      expect(box!.transformation!.position![1]).toBeCloseTo(0.55);
      expect(box!.transformation!.position![2]).toBeCloseTo(0);
    });

    it('should move picked actor', async () => {
      const sim = getPhSim();
      new ServerBase(
        {
          type: ActorType.ACTOR,
          guid: 'box',
          name: 'box',
          transformation: { position: [0, 0.6, 0] },
          model: { meshURL: '' },
        },
        CreateBox('box', { size: 1 }),
      );
      sim.start();
      actionHandler.actors = sim.actors;
      actionHandler.client = new Client({
        code: 'client',
        roleId: 1,
        userId: 1,
        username: 'client',
      });
      actionHandler.client.pickHeight = PICK_HIGHT;

      await wait(100);
      actionHandler.handlePickActor('box');
      actionHandler.handleMoveActor('box', [1, 0]);
      actionHandler.client.pickHeight = PICK_HIGHT;

      await wait(500);

      const state = sim.toState();
      const box = state.actorStates!.find(actor => actor.guid === 'box');
      expect(box!.transformation!.position![0]).toBeCloseTo(1);
      expect(box!.transformation!.position![1]).toBeCloseTo(0.55 + PICK_HIGHT);
      expect(box!.transformation!.position![2]).toBeCloseTo(0);
    });
  });

  describe('PICK_ITEM', () => {
    it('should spawn tile object', async () => {
      vi.spyOn(ServerActorBuilder, 'buildTile').mockImplementation(() => {
        return Promise.resolve(
          new Tile(
            {
              type: ActorType.TILE,
              tileType: 0,
              guid: 'tile',
              name: 'tile',
              faceURL: '',
            },
            CreateBox('box', { size: 1 }),
          ),
        );
      });
      const sim = getPhSim();

      new TileStack(
        {
          type: ActorType.TILE_STACK,
          tileType: 0,
          faceURL: 'https://i.imgur.com/1I4Z1Zb.png',
          guid: 'tileStack',
          name: 'tileStack',
          size: 3,
        },
        CreateBox('box', { size: 1 }),
      );
      sim.start();
      actionHandler.actors = sim.actors;
      actionHandler.client = new Client({
        code: 'client',
        roleId: 1,
        userId: 1,
        username: 'client',
      });
      actionHandler.client.pickHeight = PICK_HIGHT;

      await wait(100);
      actionHandler.handlePickItem('tileStack');

      await wait(500);

      expect(sim.actors.length).toBe(2);
      expect((sim.actors[0] as TileStack).size).toBe(2);
    });

    it('should sparn card object', async () => {
      vi.spyOn(ServerActorBuilder, 'buildCard').mockImplementation(() => {
        return Promise.resolve(
          new Actor(
            {
              type: ActorType.ACTOR,
              guid: 'card',
              name: 'card',
              model: {
                meshURL: '',
              },
            },
            new Mesh('cardMesh'),
          ) as unknown as Card,
        );
      });

      const sim = getPhSim();
      new Deck(
        {
          guid: 'deck',
          name: 'deck',
          type: ActorType.DECK,
          cards: [
            {
              type: ActorType.CARD,
              guid: 'card',
              name: 'card',
              faceURL: '',
              backURL: '',
              cols: 1,
              rows: 1,
              sequence: 0,
            },
            {
              type: ActorType.CARD,
              guid: 'card',
              name: 'card',
              faceURL: '',
              backURL: '',
              cols: 1,
              rows: 1,
              sequence: 0,
            },
          ],
        },
        new Mesh('deckMesh'),
      );

      sim.start();
      actionHandler.actors = sim.actors;
      actionHandler.client = new Client({
        code: 'client',
        roleId: 1,
        userId: 1,
        username: 'client',
      });
      actionHandler.client.pickHeight = PICK_HIGHT;

      await wait(100);
      actionHandler.handlePickItem('deck');

      await wait(500);
      expect(sim.actors.length).toBe(2);
      expect((sim.actors[0] as Deck).size).toBe(1);

      const state = sim.toState();
      expect(state.actorStates!.length).toBe(2);
    });
  });

  describe('PICK_START', () => {
    it('should spawn object', async () => {
      vi.spyOn(ServerActorBuilder, 'buildTile').mockImplementation(() => {
        return Promise.resolve(
          new Tile(
            {
              type: ActorType.TILE,
              tileType: 0,
              guid: 'tile',
              name: 'tile',
              faceURL: '',
            },
            CreateBox('box', { size: 1 }),
          ),
        );
      });
      const sim = getPhSim();

      new TileStack(
        {
          type: ActorType.TILE_STACK,
          tileType: 0,
          faceURL: 'https://i.imgur.com/1I4Z1Zb.png',
          guid: 'tileStack',
          name: 'tileStack',
          size: 3,
        },
        CreateBox('box', { size: 1 }),
      );
      sim.start();
      actionHandler.actors = sim.actors;
      actionHandler.client = new Client({
        code: 'client',
        roleId: 1,
        userId: 1,
        username: 'client',
      });
      actionHandler.client.pickHeight = PICK_HIGHT;

      await wait(100);
      actionHandler.handlePickItem('tileStack');

      await wait(500);

      expect(sim.actors.length).toBe(2);
      expect((sim.actors[0] as TileStack).size).toBe(2);
    });
  });
});
