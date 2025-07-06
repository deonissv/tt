import WebSocket from 'ws';

import type { Simulation } from '../simulation/simulation';

import { Logger } from '@nestjs/common';
import { Client } from './client';
import type { RoomsService } from './rooms.service';

import type { ConfigService } from '@nestjs/config';
import type { Room } from '@prisma/client';
import type { ClientActionMsg, CursorsPld } from '@tt/actions';
import { ClientAction } from '@tt/actions';
import { Channel } from '@tt/channel';
import type { SimulationStateSave } from '@tt/states';
import type { RecursiveType } from '@tt/utils';
import { hasProperty, isObject, isString } from '@tt/utils';
import type { ValidatedUser } from '../auth/validated-user';
import { ActionHandler } from '../simulation/action-handler';
import { SimulationBuilder } from './simulation-builder';

const EMPTY_ROOM_PERSIST_DELAY = 5 * 60 * 1000; // 5 minutes

export class SimulationRoom {
  private static readonly logger = new Logger('SimulationRoom');

  room: Room;
  simulation: Simulation;
  wss: WebSocket.Server;
  clients: Map<WebSocket, Client>;

  cursors: Map<string, CursorsPld[keyof CursorsPld]>;
  simSave: SimulationStateSave | undefined;

  simulationBuilder: SimulationBuilder;
  actionsHandler = new ActionHandler();

  savingInterval: NodeJS.Timeout | undefined;
  tickInterval: NodeJS.Timeout | undefined;
  closeTimeout: NodeJS.Timeout | undefined;

  staticHost: string;
  apiHost: string;
  proxyHost: string;

  constructor(
    private readonly roomsService: RoomsService,
    private readonly configService: ConfigService,
    room: Room,
  ) {
    this.room = room;
    this.clients = new Map();
    this.cursors = new Map();
    this.wss = this.createWebSocketServer();
    this.simSave = undefined;

    this.staticHost = this.configService.getOrThrow<string>('VITE_STATIC_HOST');
    const apiHost = this.configService.getOrThrow<string>('VITE_API_HOST');
    this.proxyHost = `${apiHost}/proxy`;
  }

  /**
   * Initializes the simulation room.
   *
   * @param simSave Optional simulation state save.
   */
  async init(simSave?: SimulationStateSave, gameId?: number, gameVersion?: number) {
    SimulationRoom.logger.log(`Room ${this.room.roomId} initializing...`);
    this.simulationBuilder = new SimulationBuilder(simSave!);
    this.simulation = await this.initSimulation();
    SimulationRoom.logger.log(`Room ${this.room.roomId} initialized.`);
    this.simulation.start();
    SimulationRoom.logger.log(`Room ${this.room.roomId} started.`);
    this.onSimulationInit(gameId, gameVersion);
  }

  private async initSimulation() {
    return await new Promise<Simulation>(resolve => {
      this.simulationBuilder.onReady = simulation => {
        resolve(simulation);
      };
    });
  }

  /**
   * Initializes the simulation room.
   * Starts the saving and update intervals.
   */
  private onSimulationInit(gameId?: number, gameVersion?: number) {
    this.savingInterval = this.initSaving(gameId, gameVersion);
    this.tickInterval = this.initUpdate();

    SimulationRoom.logger.log(`Simulation ${this.room.roomId} initialized.`);
  }

  /**
   * Creates and returns a WebSocket server for the simulation room.
   *
   * @returns The WebSocket server instance.
   */
  private createWebSocketServer() {
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', (ws: WebSocket) => {
      this.handleClientConnection(ws);
    });

    return wss;
  }

  private handleClientConnection(ws: WebSocket) {
    SimulationRoom.logger.log(`Client connecting to room ${this.room.roomId}`);

    if (!hasProperty(ws, 'user') || !isObject(ws.user)) {
      throw new Error('Unknown user connected');
    }

    const user = ws.user as ValidatedUser;
    Client.init(user, ws, this.simulationBuilder)
      .then(client => {
        this.clients.set(ws, client);
        ws.onmessage = event => this.onMessage(event, client.userId === this.room.authorId);
      })
      .catch(e => SimulationRoom.logger.error(`Failed to initialize client: ${e}`));

    this.resetCloseTimeout();

    SimulationRoom.logger.log(`Sending room ${this.room.roomId} state.`);

    ws.onclose = event => this.onClose(event);
  }

  private resetCloseTimeout() {
    if (this.closeTimeout) clearTimeout(this.closeTimeout);
  }

  /**
   * Handles the WebSocket 'message' event.
   *
   * @param event - The WebSocket message event.
   */
  private onMessage(event: WebSocket.MessageEvent, canClose: boolean) {
    SimulationRoom.logger.debug(`Received message: ${JSON.stringify(event.data)}`);
    const actions = Channel.read(event) as ClientActionMsg[];

    const cursorAction = actions.find(action => action.type === ClientAction.CURSOR);
    const cursorClient = this.clients.get(event.target)?.code;
    if (cursorAction && cursorClient) {
      this.cursors.set(cursorClient, cursorAction.payload);
    }

    if (canClose) {
      const closeAction = actions.find(action => action.type === ClientAction.CLOSE);
      if (closeAction) {
        this.closeRoom().catch(e => {
          SimulationRoom.logger.error(`Failed to close room ${this.room.roomId}: ${e}`);
        });
        return;
      }
    }

    this.actionsHandler.handleActions(actions, this.simulation.actors, this.clients.get(event.target)!);
  }

  /**
   * Handles the WebSocket close event for the simulation room.
   * Removes the client from the room and deletes the associated cursor.
   * If there are no more clients in the room, it schedules the room to be closed after a delay.
   *
   * @param event The WebSocket close event.
   */
  private onClose(event: WebSocket.CloseEvent) {
    SimulationRoom.logger.log(`Client disconnecting from room ${this.room.roomId}`);
    const cursorClient = this.clients.get(event.target)?.code;
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
    SimulationRoom.logger.log(`Client disconnected from room ${this.room.roomId}`);
  }

  /**
   * Closes the room by clearing intervals, saving room state, and closing the WebSocket server.
   *
   * @returns {Promise<void>} A promise that resolves when the room is closed.
   */
  private async closeRoom() {
    this.clients.forEach(client => {
      client.close();
    });
    this.clearIntervals();

    await this.roomsService.saveRoomState(this.room.code);
    this.wss.close();
  }

  private clearIntervals() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.savingInterval) clearInterval(this.savingInterval);
    if (this.closeTimeout) clearTimeout(this.closeTimeout);
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

    this.clients.forEach((client, _ws) => {
      client.update(cursors);
    });
  }

  /**
   * Initializes the saving interval for the simulation room.
   *
   * @returns A NodeJS.Timeout object representing the interval.
   */
  private initSaving(gameId?: number, gameVersion?: number): NodeJS.Timeout {
    SimulationRoom.logger.log('Saving interval started');
    if (gameId && gameVersion) {
      this.roomsService.saveRoomGameLoad(this.room.code, gameId, gameVersion).catch(e => {
        SimulationRoom.logger.error(`Failed to save game load for room ${this.room.roomId}: ${e}`);
      });
    }
    return setInterval(async () => {
      const simSave = this.simulation.toState();
      const simUpdate = this.simulation.toStateUpdate(this.simSave);
      if (simUpdate.actorStates?.length && simUpdate.actorStates.length > 0) {
        SimulationRoom.logger.log(`Saving room ${this.room.roomId} update ${JSON.stringify(simUpdate)}`);
        await this.roomsService.saveRoomProgressUpdate(this.room.code, simUpdate);
      }
      this.simSave = simSave;
    }, this.room.savingDelay);
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
    }, this.room.stateTickDelay);
  }

  /**
   * Recursively patches the state URLs to make external assets accessible via proxy.
   *
   * @param item - The object or array to patch the state URLs in.
   * @returns The patched object or array.
   */
  patchStateURLs<T extends RecursiveType>(item: T): T {
    if (isString(item) && item.startsWith('http') && !item.startsWith(`${this.staticHost}/assets`)) {
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
  getAssetURL(url: string) {
    const uri = encodeURIComponent(url);
    return `${this.proxyHost}/${this.room.code}/${uri}`;
  }
}
