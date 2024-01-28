import * as WebSocket from 'ws';

import { PlaygroundStateSave, PlaygroundStateUpdate, WS } from '@shared/index';
import { Simulation } from '../simulation/simulation';

import { Client } from './client';
import { RoomsService } from './rooms.service';

const STATE_TICK_RATE = 60; // [hz]
const STATE_TICK_INTERVAL = 1000 / STATE_TICK_RATE; // [ms]

export class SimulationRoom {
  id: string;
  sim: Simulation;
  wss: WebSocket.Server;
  clients: Map<WebSocket, Client>;
  cursors: Map<WebSocket, number[]>;
  pgSave: PlaygroundStateSave | undefined;
  saving_interval: NodeJS.Timeout | undefined;

  constructor(
    private readonly roomsService: RoomsService,
    id: string,
  ) {
    this.id = id;
    this.clients = new Map();
    this.cursors = new Map();
    this.wss = this.getServer();
    this.sim = new Simulation();
  }

  async init(pgSave?: PlaygroundStateSave) {
    await this.sim.init(pgSave);
    this.pgSave = pgSave;
    this.sim.start();

    this.initSaving();
  }

  initSaving() {
    this.saving_interval = setInterval(async () => {
      const pgSave = this.sim._toSaveState();
      if (pgSave.actorStates?.length && pgSave.actorStates.length > 0) {
        // eslint-disable-next-line no-console
        console.log('saving');
        await this.roomsService.saveRoomProgress(this.id, pgSave);
      }
    }, 1000);
  }

  private getServer() {
    const wss = new WebSocket.Server({ noServer: true });
    let interval: NodeJS.Timeout;

    wss.on('connection', async (ws: WebSocket) => {
      const client = await Client.init(ws, this.pgSave!); // @TODO send actual state @TODO catch reject
      this.clients.set(ws, client);

      ws.onmessage = (event: WebSocket.MessageEvent) => {
        const message = WS.read(event);

        switch (message.type) {
          case WS.UPDATE: {
            const pgStateUpdate = message.payload;
            this.sim.update(message.payload);
            if (pgStateUpdate.cursorPositions) {
              const cursor = Object.values(pgStateUpdate.cursorPositions)[0];
              this.cursors.set(ws, cursor); // @TODO add typing for position
            }
            break;
          }
        }
      };

      ws.onclose = () => {
        this.clients.delete(ws);
        this.cursors.delete(ws);
        if (this.clients.size === 0) {
          interval && clearInterval(interval);
          this.saving_interval && clearInterval(this.saving_interval);
          wss.close();
        }
      };

      interval = setInterval(() => {
        if (this.clients.size === 0) {
          return;
        }

        const cursors = Array.from(this.cursors).reduce((acc, [ws, cursor]) => {
          acc[this.clients.get(ws)!.id] = cursor;
          return acc;
        }, {});

        const pgSaveState = this.sim.toSaveState();
        const update: PlaygroundStateUpdate = {
          ...pgSaveState,
          cursorPositions: cursors,
        };

        // console.log(
        //   JSON.stringify(
        //     update.actorStates?.map(actorState => ({
        //       guid: actorState.guid,
        //       position: actorState.transformation?.position,
        //     })),
        //   ),
        // );

        this.broadcast({
          type: WS.UPDATE,
          payload: update,
        });
      }, STATE_TICK_INTERVAL);
    });
    return wss;
  }

  private broadcast(msg: WS.MSG, exclude: WebSocket[] = []) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && !exclude.includes(client)) {
        WS.send(client, msg);
      }
    });
  }
}
