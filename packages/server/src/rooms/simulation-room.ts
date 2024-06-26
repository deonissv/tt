import * as WebSocket from 'ws';

import { Simulation } from '../simulation/simulation';

import { Logger } from '@nestjs/common';
import { Client } from './client';
import type { RoomsService } from './rooms.service';

import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/simulation';
import { WS } from '@shared/ws';

const EMPTY_ROOM_PERSIST_DELAY = 5 * 60 * 1000; // 5 minutes

export class SimulationRoom {
  id: string;
  simulation: Simulation;
  wss: WebSocket.Server;
  clients: Map<WebSocket, Client>;
  cursors: Map<WebSocket, number[]>;
  simSave: SimulationStateSave | undefined;
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
    this.downloadProgress = {
      total: 0,
      loaded: 0,
      succeded: 0,
      failed: 0,
    };
  }

  async init(simSave?: SimulationStateSave) {
    SimulationRoom.logger.log(`Room initializig`);
    this.downloadProgress.total = simSave?.actorStates?.length ?? 0;
    this.simulation = await Simulation.init(
      simSave ?? {},
      () => {
        this.downloadProgress.loaded++;

        this.broadcast({
          type: WS.DOWNLOAD_PROGRESS,
          payload: this.downloadProgress,
        } as WS.MSG);
      },
      _actorState => {
        this.downloadProgress.succeded++;
      },
      _actorState => {
        this.downloadProgress.failed++;
      },
    );

    this.simulation.start();
    SimulationRoom.logger.log(`Room ${this.id} started.`);
    try {
      this.simSave = this.simulation.toStateSave();
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

    this.broadcast({
      type: WS.STATE,
      payload: this.simSave,
    } as WS.MSG);

    this.savingInterval = this.initSaving();
    this.tickInterval = this.initUpdate();
  }

  private getServer() {
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', async (ws: WebSocket) => {
      const client = await Client.init(ws); // @TODO send actual state @TODO catch reject
      this.closeTimeout && clearTimeout(this.closeTimeout);

      this.clients.set(ws, client);

      if (this.simSave) {
        WS.send(ws, {
          type: WS.STATE,
          payload: this.simSave,
        });
      }

      ws.onclose = (event: WebSocket.CloseEvent) => {
        this.onClose(event);
      };
    });
    return wss;
  }

  private onMessage(event: WebSocket.MessageEvent) {
    const message = WS.read(event);

    switch (message.type) {
      case WS.UPDATE: {
        const pgStateUpdate = message.payload;
        this.simulation.update(message.payload);
        if (pgStateUpdate.cursorPositions) {
          const cursor = Object.values(pgStateUpdate.cursorPositions)[0];
          this.cursors.set(event.target, cursor); // @TODO add typing for position
        }
        break;
      }
    }
  }

  private onClose(event: WebSocket.CloseEvent) {
    this.clients.delete(event.target);
    this.cursors.delete(event.target);
    if (this.clients.size === 0) {
      this.closeTimeout = setTimeout(() => {
        if (this.clients.size === 0) {
          this.closeRoom().catch(e => SimulationRoom.logger.error(e));
        }
      }, EMPTY_ROOM_PERSIST_DELAY);
    }
  }

  private async closeRoom() {
    this.tickInterval && clearInterval(this.tickInterval);
    this.savingInterval && clearInterval(this.savingInterval);
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

    let update: SimulationStateUpdate = {
      cursorPositions: cursors,
    };

    const delta = this.getDelta();
    update = { ...update, ...delta };

    this.broadcast({
      type: WS.UPDATE,
      payload: update,
    });
  }

  private initSaving(): NodeJS.Timeout {
    return setInterval(async () => {
      const simSave = this.simulation.toStateSave();
      const pgUpdate = this.simulation.toStateUpdate(this.simSave);
      if (simSave.actorStates?.length && simSave.actorStates.length > 0) {
        await this.roomsService.saveRoomProgressUpdate(this.id, pgUpdate);
      }
      this.simSave = simSave;
    }, this.savingDelay);
  }

  private initUpdate(): NodeJS.Timeout {
    return setInterval(() => {
      this.tick();
    }, this.stateTickDelay);
  }

  private getDelta(): SimulationStateUpdate | null {
    const delta = this.simulation.toStateUpdate(this.simSave);

    if (Object.keys(delta).length === 0) {
      return null;
    }
    this.simSave = this.simulation.toStateSave();

    return delta;
  }

  private broadcast(msg: WS.MSG, exclude: WebSocket[] = []) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && !exclude.includes(client)) {
        WS.send(client, msg);
      }
    });
  }
}
