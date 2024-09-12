import WebSocket from 'ws';

import { Simulation } from '../simulation/simulation';

import { Logger } from '@nestjs/common';
import { Client } from './client';
import type { RoomsService } from './rooms.service';

import { PROXY_PREFIX } from '@shared/constants';
import type { SimulationStateSave } from '@shared/dto/states';
import { isObject, isString } from '@shared/guards';
import type { RecursiveType } from '@shared/types';
import { ClientAction, ServerAction, WS } from '@shared/ws';
import type { CursorsPld, DownloadProgressPld } from '@shared/ws/payloads';
import type { ClientActionMsg } from '@shared/ws/ws';
import { ActionHandler } from '../simulation/action-handler';
import { ActionBuilder } from './action-builder';

const EMPTY_ROOM_PERSIST_DELAY = 5 * 60 * 1000; // 5 minutes

export class SimulationRoom {
  id: string;
  simulation: Simulation;
  wss: WebSocket.Server;
  clients: Map<WebSocket, Client>;

  cursors: Map<string, CursorsPld[keyof CursorsPld]>;
  simSave: SimulationStateSave | undefined;

  actionBuilder = new ActionBuilder();
  actionsHandler = new ActionHandler();

  downloadProgress: DownloadProgressPld;

  savingDelay: number;
  stateTickDelay: number;

  savingInterval: NodeJS.Timeout | undefined;
  tickInterval: NodeJS.Timeout | undefined;
  closeTimeout: NodeJS.Timeout | undefined;

  private static readonly logger = new Logger('SimulationRoom');

  constructor(
    private readonly roomsService: RoomsService,
    id: string,
    savingDelay: number,
    stateTickDelay: number,
  ) {
    this.id = id;
    this.clients = new Map();
    this.cursors = new Map();
    this.wss = this.getServer();
    this.savingDelay = savingDelay;
    this.stateTickDelay = stateTickDelay;
    this.simSave = undefined;

    this.downloadProgress = {
      total: 0,
      loaded: 0,
      succeded: 0,
      failed: 0,
    };
  }

  /**
   * Initializes the simulation room.
   *
   * @param simSave Optional simulation state save.
   */
  async init(simSave?: SimulationStateSave) {
    SimulationRoom.logger.log(`Room ${this.id} initializig...`);
    this.downloadProgress.total = simSave?.actorStates?.length ?? 0;
    SimulationRoom.logger.log(`Simulation ${this.id} initializig...`);
    this.simulation = await Simulation.init(
      simSave ?? {},
      () => {
        this.downloadProgress.loaded++;

        this.broadcast([
          {
            type: ServerAction.DOWNLOAD_PROGRESS,
            payload: this.downloadProgress,
          },
        ]);
      },
      _actorState => {
        this.downloadProgress.succeded++;
      },
      _actorState => {
        this.downloadProgress.failed++;
      },
    );
    SimulationRoom.logger.log(`Room ${this.id} starting`);

    this.simulation.start();
    SimulationRoom.logger.log(`Room ${this.id} started.`);
    this.actionBuilder.sim = this.simulation;

    try {
      this.simSave = this.simulation.toState();
    } catch (e) {
      SimulationRoom.logger.error(e);
    }
    this.onSimulationInit();
    SimulationRoom.logger.log(`Room ${this.id} initialized.`);
  }

  /**
   * Initializes the simulation room.
   * Attaches an event listener to each client WebSocket to handle incoming messages.
   * Sends the initial state to all clients.
   * Starts the saving and update intervals.
   */
  private onSimulationInit() {
    for (const clientWs of this.clients.keys()) {
      clientWs.onmessage = (event: WebSocket.MessageEvent) => {
        this.onMessage(event);
      };
    }

    const patchedState = SimulationRoom.patchStateURLs(this.simSave as unknown as RecursiveType) as SimulationStateSave;
    this.broadcast([
      {
        type: ServerAction.STATE,
        payload: patchedState,
      },
    ]);

    this.savingInterval = this.initSaving();
    this.tickInterval = this.initUpdate();

    SimulationRoom.logger.log(`Simulation ${this.id} initialized.`);
  }

  /**
   * Creates and returns a WebSocket server for the simulation room.
   *
   * @returns The WebSocket server instance.
   */
  private getServer() {
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', async (ws: WebSocket) => {
      SimulationRoom.logger.log(`Client connecting to room ${this.id}`);
      const client = await Client.init(ws); // @TODO send actual state @TODO catch reject
      if (this.closeTimeout) clearTimeout(this.closeTimeout);

      this.clients.set(ws, client);

      if (this.simSave) {
        WS.send(ws, [
          {
            type: ServerAction.STATE,
            payload: SimulationRoom.patchStateURLs(this.simSave as unknown as RecursiveType) as SimulationStateSave,
          },
        ]);
      }

      ws.onmessage = event => this.onMessage(event);
      ws.onclose = event => this.onClose(event);
    });
    return wss;
  }

  /**
   * Handles the WebSocket 'message' event.
   *
   * @param event - The WebSocket message event.
   */
  private onMessage(event: WebSocket.MessageEvent) {
    SimulationRoom.logger.debug(`Received message: ${JSON.stringify(event.data)}`);
    const actions = WS.read(event) as ClientActionMsg[];

    const cursorAction = actions.find(action => action.type === ClientAction.CURSOR);
    const cursorClient = this.clients.get(event.target)?.id;
    if (cursorAction && cursorClient) {
      this.cursors.set(cursorClient, cursorAction.payload);
    }

    this.actionsHandler.handleActions(actions, this.simulation.actors, this.clients.get(event.target)!.id);
  }

  /**
   * Handles the WebSocket close event for the simulation room.
   * Removes the client from the room and deletes the associated cursor.
   * If there are no more clients in the room, it schedules the room to be closed after a delay.
   *
   * @param event The WebSocket close event.
   */
  private onClose(event: WebSocket.CloseEvent) {
    SimulationRoom.logger.log(`Client disconnectingfrom room ${this.id}`);
    const cursorClient = this.clients.get(event.target)?.id;
    if (cursorClient) {
      this.cursors.delete(cursorClient);
    }
    this.clients.delete(event.target);

    if (this.clients.size === 0) {
      this.closeTimeout = setTimeout(() => {
        if (this.clients.size === 0) {
          this.closeRoom().catch(e => {
            SimulationRoom.logger.error(e);
          });
        }
      }, EMPTY_ROOM_PERSIST_DELAY);
    }
    SimulationRoom.logger.log(`Client disconnected from room ${this.id}`);
  }

  /**
   * Closes the room by clearing intervals, saving room state, and closing the WebSocket server.
   *
   * @returns {Promise<void>} A promise that resolves when the room is closed.
   */
  private async closeRoom() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.savingInterval) clearInterval(this.savingInterval);
    await this.roomsService.saveRoomState(this.id);
    this.wss.close();
  }

  /**
   * Executes an state update tick in the simulation room.
   * If there are no clients connected, the tick is skipped.
   * Retrieves the cursors and actions from the simulation and broadcasts the actions to the clients.
   */
  private tick() {
    if (this.clients.size === 0) {
      return;
    }

    const cursors = Array.from(this.cursors.entries()).reduce((acc, [key, val]) => {
      acc[key] = val;
      return acc;
    }, {});

    const cursorsAction = this.actionBuilder.getCursorsAction(cursors);
    const simActions = this.actionBuilder.getSimActions(this.simulation.toState());

    this.clients.forEach((client, ws) => {
      const actions = [] as WS.ServerActionMsg[];
      if (cursorsAction && Object.keys(cursorsAction).length > 1) {
        const clientCursors = structuredClone(cursorsAction);
        delete clientCursors.payload[client.id];
        actions.push(cursorsAction);
      }
      if (simActions) actions.push(...simActions);

      if (actions && actions.length > 0) {
        SimulationRoom.logger.verbose(`Sending actions to [${client.id}]: ${JSON.stringify(actions)}`);
        WS.send(ws, actions);
      }
    });
  }

  /**
   * Initializes the saving interval for the simulation room.
   *
   * @returns A NodeJS.Timeout object representing the interval.
   */
  private initSaving(): NodeJS.Timeout {
    SimulationRoom.logger.log('Saving interval started');
    return setInterval(async () => {
      const simSave = this.simulation.toState();
      const simUpdate = this.simulation.toStateUpdate(this.simSave);
      if (simUpdate.actorStates?.length && simUpdate.actorStates.length > 0) {
        SimulationRoom.logger.log(`Saving room ${this.id} update ${JSON.stringify(simUpdate)}`);
        await this.roomsService.saveRoomProgressUpdate(this.id, simUpdate);
      }
      this.simSave = simSave;
    }, this.savingDelay);
  }

  /**
   * Initializes the update interval for the simulation room.
   *
   * @returns A NodeJS.Timeout object representing the interval for the update process.
   */
  private initUpdate(): NodeJS.Timeout {
    SimulationRoom.logger.log('Saving update started');
    return setInterval(() => {
      this.tick();
    }, this.stateTickDelay);
  }

  /**
   * Broadcasts a message to all connected clients, excluding the ones specified in the `exclude` parameter.
   *
   * @param msg - The message to broadcast.
   * @param exclude - An optional array of WebSocket instances to exclude from the broadcast.
   */
  private broadcast(msg: WS.MSG, exclude: WebSocket[] = []) {
    this.wss.clients.forEach(client => {
      if (!exclude.includes(client)) {
        WS.send(client, msg);
      }
    });
  }

  /**
   * Recursively patches the state URLs to make external assets accessible via proxy.
   *
   * @param item - The object or array to patch the state URLs in.
   * @returns The patched object or array.
   */
  static patchStateURLs<T extends RecursiveType>(item: T): T {
    if (isString(item) && item.startsWith('http') && !item.startsWith(PROXY_PREFIX)) {
      return this.getAssetURL(item) as T;
    } else if (Array.isArray(item)) {
      return item.map(i => this.patchStateURLs(i)) as T;
    } else if (isObject(item)) {
      return Object.keys(item).reduce(
        (acc, key) => ({
          ...acc,
          [key]: this.patchStateURLs(item[key]),
        }),
        {},
      ) as T;
    }
    return item;
  }

  /**
   * Returns the asset URL for the given resource.
   *
   * @param url - The resource URL.
   * @returns The asset URL.
   */
  static getAssetURL(url: string) {
    return PROXY_PREFIX + url;
  }
}
