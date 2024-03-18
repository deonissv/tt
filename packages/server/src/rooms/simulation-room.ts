import * as WebSocket from 'ws';

import { PlaygroundStateSave, PlaygroundStateUpdate, WS } from '@shared/index';
import { Simulation } from '../simulation/simulation';

import { Client } from './client';
import { RoomsService } from './rooms.service';

export class SimulationRoom {
  id: string;
  simulation: Simulation;
  wss: WebSocket.Server;
  clients: Map<WebSocket, Client>;
  cursors: Map<WebSocket, number[]>;
  pgSave: PlaygroundStateSave | undefined;
  savingInterval: NodeJS.Timeout | undefined;
  tickInterval: NodeJS.Timeout | undefined;
  savingDelay: number;
  stateTickDelay: number;

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
    this.simulation = new Simulation();
    this.savingDelay = savingDelay;
    this.stateTickDelay = stateTickDelay;
  }

  async init(pgSave?: PlaygroundStateSave) {
    await this.simulation.init(pgSave);
    this.pgSave = pgSave;
    this.simulation.start();

    this.savingInterval = this.initSaving();
  }

  private getServer() {
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', async (ws: WebSocket) => {
      const client = await Client.init(ws, this.pgSave!); // @TODO send actual state @TODO catch reject
      this.clients.set(ws, client);

      ws.onmessage = (event: WebSocket.MessageEvent) => {
        this.onMessage(event);
      };

      ws.onclose = async (event: WebSocket.CloseEvent) => {
        await this.onClose(event);
      };

      this.tickInterval = this.initUpdate();
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

  private async onClose(event: WebSocket.CloseEvent) {
    this.clients.delete(event.target);
    this.cursors.delete(event.target);
    if (this.clients.size === 0) {
      this.tickInterval && clearInterval(this.tickInterval);
      this.savingInterval && clearInterval(this.savingInterval);
      await this.roomsService.saveRoomState(this.id);
      this.wss.close();
    }
  }

  private tick() {
    if (this.clients.size === 0) {
      return;
    }

    const cursors = Array.from(this.cursors).reduce((acc, [ws, cursor]) => {
      acc[this.clients.get(ws)!.id] = cursor;
      return acc;
    }, {});

    const update: PlaygroundStateUpdate = {
      ...this.getDelta(),
      cursorPositions: cursors,
    };

    this.broadcast({
      type: WS.UPDATE,
      payload: update,
    });
  }

  initSaving(): NodeJS.Timeout {
    return setInterval(async () => {
      const pgSave = this.simulation.toStateSave();
      const pgUpdate = this.simulation.toStateUpdate(this.pgSave);
      if (pgSave.actorStates?.length && pgSave.actorStates.length > 0) {
        await this.roomsService.saveRoomProgressUpdate(this.id, pgUpdate);
      }
      this.pgSave = pgSave;
    }, this.savingDelay);
  }

  initUpdate(): NodeJS.Timeout {
    return setInterval(() => {
      this.tick();
    }, this.stateTickDelay);
  }

  private getDelta(): PlaygroundStateUpdate {
    const delta = this.simulation.toStateUpdate(this.pgSave);
    this.pgSave = this.simulation.toStateSave();
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
