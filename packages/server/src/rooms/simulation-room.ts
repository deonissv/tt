import * as WebSocket from 'ws';

import { Simulation } from '../simulation/simulation';

import { Logger } from '@nestjs/common';
import { Client } from './client';
import type { RoomsService } from './rooms.service';

import { URL_PREFIX } from '@shared/constants';
import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/states';
import { isObject, isString } from '@shared/guards';
import { WS } from '@shared/ws';
import type { Cursors } from '@shared/ws/ws';

const EMPTY_ROOM_PERSIST_DELAY = 5 * 60 * 1000; // 5 minutes

type Primitive = string | number | boolean | null | undefined;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
interface RecursiveObject {
  [key: string]: RecursiveType;
}

type RecursiveArray = RecursiveType[];

type RecursiveType = Primitive | RecursiveObject | RecursiveArray;

export class SimulationRoom {
  id: string;
  simulation: Simulation;
  wss: WebSocket.Server;
  clients: Map<WebSocket, Client>;
  cursors: Map<WebSocket, Cursors[keyof Cursors]>;
  simSave: SimulationStateSave | undefined;
  actions: WS.SimAction[];
  prevUpdate: string;

  downloadProgress: WS.DownloadProgress;

  savingDelay: number;
  stateTickDelay: number;

  savingInterval: NodeJS.Timeout | undefined;
  tickInterval: NodeJS.Timeout | undefined;
  closeTimeout: NodeJS.Timeout | undefined;

  private static readonly logger = new Logger(SimulationRoom.name);

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
    this.actions = [];

    this.downloadProgress = {
      total: 0,
      loaded: 0,
      succeded: 0,
      failed: 0,
    };
  }

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
            type: WS.SimActionType.DOWNLOAD_PROGRESS,
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
    try {
      this.simSave = this.simulation.toState();
    } catch (e) {
      SimulationRoom.logger.error(e);
    }
    this.onSimulationInit();
    SimulationRoom.logger.log(`Room ${this.id} initialized.`);
  }

  private onSimulationInit() {
    for (const clientWs of this.clients.keys()) {
      clientWs.onmessage = (event: WebSocket.MessageEvent) => {
        this.onMessage(event);
      };
    }

    const patchedState = SimulationRoom.patchStateURLs(this.simSave as unknown as RecursiveType) as SimulationStateSave;
    this.broadcast([
      {
        type: WS.SimActionType.STATE,
        payload: patchedState,
      },
    ]);

    this.savingInterval = this.initSaving();
    this.tickInterval = this.initUpdate();

    SimulationRoom.logger.log(`Simulation ${this.id} initialized.`);
  }

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
            type: WS.SimActionType.STATE,
            payload: SimulationRoom.patchStateURLs(this.simSave as unknown as RecursiveType) as SimulationStateSave,
          },
        ]);
      }

      ws.onmessage = event => this.onMessage(event);
      ws.onclose = event => this.onClose(event);
    });
    return wss;
  }

  private onMessage(event: WebSocket.MessageEvent) {
    SimulationRoom.logger.log(`Received message: ${JSON.stringify(event.data)}`);
    const actions = WS.read(event);

    const cursorAction = actions.find(action => action.type === WS.SimActionType.CURSOR);
    if (cursorAction) {
      this.cursors.set(event.target, cursorAction.payload);
    }

    this.simulation.update(actions);
  }

  private onClose(event: WebSocket.CloseEvent) {
    SimulationRoom.logger.log(`Client disconnectingfrom room ${this.id}`);
    this.clients.delete(event.target);
    this.cursors.delete(event.target);
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

  private async closeRoom() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.savingInterval) clearInterval(this.savingInterval);
    await this.roomsService.saveRoomState(this.id);
    this.wss.close();
  }

  private tick() {
    if (this.clients.size === 0) {
      return;
    }

    const cursors = Array.from(this.cursors).reduce((acc, [ws, cursor]) => {
      acc[this.clients.get(ws)!.id] = cursor;
      return acc;
    }, {});

    const simUpdate = {
      ...this.simulation.toStateUpdate(this.simSave),
      cursors,
    };
    this.simSave = this.simulation.toState();
    const actions = this.simulation.getSimActions(simUpdate);

    actions.push({
      type: WS.SimActionType.CURSORS,
      payload: cursors,
    });

    if (this.actions.length > 0) {
      actions.push(...this.actions);
      this.actions = [];
    }

    if (actions.length > 0) this.broadcast(actions);
  }

  private initSaving(): NodeJS.Timeout {
    SimulationRoom.logger.log('Saving interval started');
    return setInterval(async () => {
      const simSave = this.simulation.toState();
      const simUpdate = this.simulation.toStateUpdate(this.simSave);
      if (simSave.actorStates?.length && simSave.actorStates.length > 0) {
        await this.roomsService.saveRoomProgressUpdate(this.id, simUpdate);
      }
      this.simSave = simSave;
    }, this.savingDelay);
  }

  private initUpdate(): NodeJS.Timeout {
    SimulationRoom.logger.log('Saving update started');
    return setInterval(() => {
      this.tick();
    }, this.stateTickDelay);
  }

  private getDelta(): SimulationStateUpdate | null {
    const delta = this.simulation.toStateUpdate(this.simSave);

    if (Object.keys(delta).length === 0) {
      return null;
    }
    this.simSave = this.simulation.toState();

    return delta;
  }

  private broadcast(msg: WS.MSG, exclude: WebSocket[] = []) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && !exclude.includes(client)) {
        WS.send(client, msg);
      }
    });
  }

  static patchStateURLs<T extends RecursiveType>(item: T): T {
    if (isString(item) && item.startsWith('http') && !item.startsWith(URL_PREFIX)) {
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

  static getAssetURL(url: string) {
    // return `http://localhost:3000/assets/${url}`
    return URL_PREFIX + url;
  }
}
