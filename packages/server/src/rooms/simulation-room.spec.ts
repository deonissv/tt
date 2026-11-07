import { CreateBox, Logger } from '@babylonjs/core';
import { Logger as NestLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { Room } from '@prisma/client';
import { ClientAction, ServerAction, type ServerActionMsg } from '@tt/actions';
import { Channel } from '@tt/channel';
import type { ActorState, SimulationStateSave } from '@tt/states';
import { ActorType } from '@tt/states';
import { getPhSim } from '../../test/testUtils';
import type { ValidatedUser } from '../auth/validated-user';
import { ActionHandler } from '../simulation/action-handler';
import { ServerBase } from '../simulation/actors';
import { SimulationFactory } from '../simulation/simulation.factory';
import { initHavok } from '../utils';
import { AssetUrlService } from './asset-url.service';
import { InMemoryRoomRegistry, RoomRegistry } from './room-registry';
import { RoomsService } from './rooms.service';
import type { SimulationRoom } from './simulation-room';
import { SimulationRoomFactory } from './simulation-room.factory';

interface FakeSocket {
  user?: ValidatedUser;
  readyState: number;
  OPEN: number;
  send: (data: string) => void;
  close: () => void;
  onmessage?: (event: { target: FakeSocket; data: string }) => void;
  onclose?: (event: { target: FakeSocket }) => void;
}

function fakeSocket(user?: ValidatedUser): FakeSocket {
  return {
    user,
    readyState: 1,
    OPEN: 1,
    send: () => undefined,
    close: () => undefined,
  };
}

describe('SimulationRoom', () => {
  const user: ValidatedUser = { userId: 1, username: 'alice', code: 'alice-code', roleId: 0 };
  const otherUser: ValidatedUser = { userId: 2, username: 'bob', code: 'bob-code', roleId: 0 };

  let factory: SimulationRoomFactory;
  let registry: RoomRegistry;
  let roomsService: RoomsService;
  let saveRoomState: ReturnType<typeof vi.fn>;
  let actionsHandler: ActionHandler;
  let simulationFactory: SimulationFactory;
  let roomTable: Room;
  let room: SimulationRoom;
  let assetUrlService: AssetUrlService;

  beforeAll(async () => {
    Logger.LogLevels = 0; // silence BabylonJS
    NestLogger.overrideLogger(false); // silence the SimulationRoom Nest logger
    await initHavok();
  });

  beforeEach(async () => {
    saveRoomState = vi.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SimulationRoomFactory,
        ActionHandler,
        SimulationFactory,
        { provide: RoomRegistry, useClass: InMemoryRoomRegistry },
        { provide: AssetUrlService, useValue: { patchStateURLs: (state: unknown) => state } },
        {
          provide: RoomsService,
          useValue: {
            saveRoomState,
            saveRoomProgressUpdate: vi.fn(),
            saveRoomGameLoad: vi.fn(),
          },
        },
      ],
    }).compile();

    assetUrlService = moduleRef.get(AssetUrlService);
    factory = moduleRef.get(SimulationRoomFactory);
    registry = moduleRef.get(RoomRegistry);
    actionsHandler = moduleRef.get(ActionHandler);
    simulationFactory = moduleRef.get(SimulationFactory);
    roomsService = moduleRef.get(RoomsService);

    roomTable = {
      roomId: 1,
      code: 'room-1',
      type: 1,
      authorId: user.userId,
      savingDelay: 1000,
      stateTickDelay: 33,
    };

    room = factory.create(roomsService, roomTable);
  });

  afterEach(() => {
    room.wss.close();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function connect(connectingUser?: ValidatedUser): FakeSocket {
    const socket = fakeSocket(connectingUser);
    room.wss.emit('connection', socket);
    return socket;
  }

  describe('factory.create', () => {
    it('produces a room with no clients or cursors', () => {
      expect(room.clients.size).toBe(0);
      expect(room.cursors.size).toBe(0);
    });

    it('initializes the download progress to zero', () => {
      expect(room.downloadProgress).toEqual({ total: 0, loaded: 0, succeeded: 0, failed: 0 });
    });

    it('starts listening on its websocket server', () => {
      expect(room.wss.listenerCount('connection')).toBe(1);
      expect(room.simSave).toBeUndefined();
    });
  });

  describe('connection handling', () => {
    it('registers a connecting client', () => {
      connect(user);

      expect(room.clients.size).toBe(1);
      const [client] = [...room.clients.values()];
      expect(client.userId).toBe(user.userId);
      expect(client.code).toBe(user.code);
    });

    it('wires message and close handlers onto the socket', () => {
      const socket = connect(user);

      expect(typeof socket.onmessage).toBe('function');
      expect(typeof socket.onclose).toBe('function');
    });

    it('throws when the socket has no authenticated user', () => {
      expect(() => connect()).toThrow('Unknown user connected');
    });

    it('does not push state before the simulation exists', () => {
      const sendSpy = vi.spyOn(Channel, 'send');

      connect(user);

      expect(sendSpy).not.toHaveBeenCalled();
    });

    it('cancels a pending close timeout when a client reconnects', () => {
      const stale = setTimeout(() => undefined, 1_000_000);
      room.closeTimeout = stale;
      const clearSpy = vi.spyOn(global, 'clearTimeout');

      connect(user);

      expect(clearSpy).toHaveBeenCalledWith(stale);
      clearTimeout(stale);
    });

    it('sends the current state to a client once the simulation is ready', () => {
      room.simulation = getPhSim();
      const sendSpy = vi.spyOn(Channel, 'send');

      const socket = connect(user);

      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(sendSpy.mock.calls[0][0]).toBe(socket);
    });
  });

  describe('connection lifecycle', () => {
    it('removes a client when its socket closes', () => {
      const socket = connect(user);
      expect(room.clients.size).toBe(1);

      socket.onclose?.({ target: socket });

      expect(room.clients.size).toBe(0);
    });

    it('forgets the client cursor on close', () => {
      const socket = connect(user);
      room.cursors.set(user.code, [1, 2]);

      socket.onclose?.({ target: socket });

      expect(room.cursors.has(user.code)).toBe(false);
    });

    it('releases the actor a disconnecting client holds', () => {
      room.simulation = getPhSim();
      new ServerBase(
        { type: ActorType.ACTOR, guid: 'box', name: 'box', model: { meshURL: '' } },
        CreateBox('box', { size: 1 }),
      );
      const socket = connect(user);

      socket.onmessage?.({
        target: socket,
        data: JSON.stringify([{ type: ClientAction.PICK_ACTOR, payload: 'box' }]),
      });
      const box = room.simulation.actors.find(actor => actor.guid === 'box');
      expect(box?.picked).toBe(user.code);

      socket.onclose?.({ target: socket });

      expect(room.simulation.actors.find(actor => actor.guid === 'box')?.picked).toBeNull();
    });

    it('leaves actors held by other clients alone when one disconnects', () => {
      room.simulation = getPhSim();
      new ServerBase(
        { type: ActorType.ACTOR, guid: 'box', name: 'box', model: { meshURL: '' } },
        CreateBox('box', { size: 1 }),
      );
      const socket = connect(user);
      const otherSocket = connect(otherUser);

      otherSocket.onmessage?.({
        target: otherSocket,
        data: JSON.stringify([{ type: ClientAction.PICK_ACTOR, payload: 'box' }]),
      });
      const box = room.simulation.actors.find(actor => actor.guid === 'box');
      expect(box?.picked).toBe(otherUser.code);

      socket.onclose?.({ target: socket });
      expect(box?.picked).toBe(otherUser.code);
    });

    it('schedules a room close once the last client leaves', () => {
      const socket = connect(user);

      socket.onclose?.({ target: socket });

      expect(room.closeTimeout).toBeDefined();
      clearTimeout(room.closeTimeout);
    });

    it('keeps the room open while other clients remain', () => {
      const socket = connect(user);
      connect(otherUser);

      socket.onclose?.({ target: socket });

      expect(room.clients.size).toBe(1);
      expect(room.closeTimeout).toBeUndefined();
    });
  });

  describe('onMessage', () => {
    it('records a cursor position reported by a client', () => {
      room.simulation = getPhSim();
      const socket = connect(user);

      socket.onmessage?.({
        target: socket,
        data: JSON.stringify([{ type: ClientAction.CURSOR, payload: [3, 4] }]),
      });

      expect(room.cursors.get(user.code)).toEqual([3, 4]);
    });

    it('forwards actions to the action handler', () => {
      room.simulation = getPhSim();
      const handleSpy = vi.spyOn(actionsHandler, 'handleActions');
      const socket = connect(user);

      socket.onmessage?.({
        target: socket,
        data: JSON.stringify([{ type: ClientAction.ROLL, payload: 'die-1' }]),
      });

      expect(handleSpy).toHaveBeenCalledTimes(1);
      const [actions, , client] = handleSpy.mock.calls[0];
      expect(actions).toEqual([{ type: ClientAction.ROLL, payload: 'die-1' }]);
      expect(client.code).toBe(user.code);
    });

    it('closes the room when its author sends CLOSE', async () => {
      const socket = connect(user); // user.userId === roomTable.authorId -> allowed to close

      socket.onmessage?.({
        target: socket,
        data: JSON.stringify([{ type: ClientAction.CLOSE, payload: null }]),
      });

      await vi.waitFor(() => expect(saveRoomState).toHaveBeenCalledWith(roomTable.code));
    });

    it('removes the room from the registry when it closes', async () => {
      expect(registry.get(roomTable.code)).toBe(room);
      const socket = connect(user);

      socket.onmessage?.({
        target: socket,
        data: JSON.stringify([{ type: ClientAction.CLOSE, payload: null }]),
      });

      await vi.waitFor(() => expect(registry.get(roomTable.code)).toBeUndefined());
    });

    it('ignores CLOSE from a non-author client', () => {
      room.simulation = getPhSim();
      const socket = connect(otherUser); // not the author

      socket.onmessage?.({
        target: socket,
        data: JSON.stringify([{ type: ClientAction.CLOSE, payload: null }]),
      });

      expect(saveRoomState).not.toHaveBeenCalled();
    });
  });

  describe('getSimulationState', () => {
    it('returns the patched state together with the download progress', () => {
      room.simulation = getPhSim();

      const state = room.getSimulationState();

      expect(state.downloadProgress).toEqual(room.downloadProgress);
      expect(Array.isArray(state.actorStates)).toBe(true);
    });
  });

  describe('tick asset URLs', () => {
    it('proxies spawn and rerender assets without mutating simulation actions', async () => {
      vi.useFakeTimers();
      const STATIC_HOST = 'http://static.host';
      const ROOM_CODE = roomTable.code;
      const service = new AssetUrlService(
        new ConfigService({ VITE_STATIC_HOST: STATIC_HOST, VITE_API_HOST: 'http://api.host' }),
      );
      vi.spyOn(assetUrlService, 'patchStateURLs').mockImplementation((item: unknown, roomCode: string) =>
        service.patchStateURLs(item, roomCode),
      );
      const sim = getPhSim();
      vi.spyOn(sim, 'start').mockImplementation(() => undefined);
      vi.spyOn(simulationFactory, 'create').mockResolvedValue(sim);
      await room.init();
      const socket = connect(user);
      const send = vi.spyOn(Channel, 'send');
      const state: ActorState = {
        guid: 'actor',
        name: 'Actor',
        type: ActorType.ACTOR,
        model: { meshURL: 'https://example.com/model.obj' },
      };
      const grid = {
        faceURL: 'https://example.com/face.png',
        backURL: `${STATIC_HOST}/assets/back.png`,
        rows: 1,
        cols: 1,
        sequence: 0,
      };
      const actions: ServerActionMsg[] = [
        { type: ServerAction.SPAWN_ACTOR, payload: state },
        { type: ServerAction.SPAWN_PICKED_ACTOR, payload: { clientId: 'player', state } },
        { type: ServerAction.RERENDER_DECK, payload: { guid: 'deck', grid, size: 2 } },
        { type: ServerAction.REMOVE_ACTOR, payload: 'actor' },
      ];
      const original = structuredClone(actions);
      const patchedState = {
        ...state,
        model: { meshURL: service.getAssetURL(state.model.meshURL, ROOM_CODE) },
      };

      vi.spyOn(room.actionBuilder, 'getSimActions').mockReturnValue(actions);
      vi.spyOn(room.actionBuilder, 'getCursorsAction').mockReturnValue(null);
      vi.advanceTimersByTime(roomTable.stateTickDelay);
      const patched = send.mock.calls[0][1];
      expect(send.mock.calls[0][0]).toBe(socket);

      expect(patched).toEqual([
        { type: ServerAction.SPAWN_ACTOR, payload: patchedState },
        { type: ServerAction.SPAWN_PICKED_ACTOR, payload: { clientId: 'player', state: patchedState } },
        {
          type: ServerAction.RERENDER_DECK,
          payload: { guid: 'deck', grid: { ...grid, faceURL: service.getAssetURL(grid.faceURL, ROOM_CODE) }, size: 2 },
        },
        actions[3],
      ]);
      expect(actions).toEqual(original);
      expect(patched[3]).toBe(actions[3]);
      clearInterval(room.savingInterval);
      clearInterval(room.tickInterval);
    });
  });

  describe('init', () => {
    it('builds the simulation through the factory and primes the room', async () => {
      vi.useFakeTimers();
      const sim = getPhSim();
      vi.spyOn(sim, 'start').mockImplementation(() => undefined);
      const createSpy = vi.spyOn(simulationFactory, 'create').mockResolvedValue(sim);

      const save: SimulationStateSave = {
        actorStates: [{ type: ActorType.ACTOR, guid: 'a', name: 'a', model: { meshURL: '' } }],
      };

      await room.init(save);

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(room.simulation).toBe(sim);
      expect(room.actionBuilder.sim).toBe(sim);
      expect(room.downloadProgress.total).toBe(1);

      clearInterval(room.savingInterval);
      clearInterval(room.tickInterval);
    });
  });
});
