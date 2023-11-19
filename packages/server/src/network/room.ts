import * as crypto from 'crypto';
import * as WebSocket from 'ws';

import { PlaygroundStateSave, PlaygroundStateUpdate, WS } from '@shared/index';
import { Simulation } from '../simulation/simulation';

import { Client } from './client';

const STATE_TICK_RATE = 60; // [hz]
const STATE_TICK_INTERVAL = 1000 / STATE_TICK_RATE; // [ms]

export class Room {
  id: string;
  sim: Simulation;
  wss: WebSocket.Server;
  clients: Map<WebSocket, Client>;
  cursors: Map<WebSocket, number[]>;
  pgSave: PlaygroundStateSave | undefined;

  constructor(id: string) {
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
  }

  private getServer() {
    const wss = new WebSocket.Server({ noServer: true });

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

      setInterval(() => {
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

  static getRandomString(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
