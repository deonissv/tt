import * as crypto from 'crypto';
import * as WebSocket from 'ws';

import { PlaygroundState, PlaygroundStateSave, WS } from '@shared/index';

const STATE_TICK_RATE = 6; // [hz]
const STATE_TICK_INTERVAL = 1000 / STATE_TICK_RATE; // [ms]

class Client {
  id: string;
  nickname: string;

  constructor(id: string, nickname: string) {
    this.id = id;
    this.nickname = nickname;
  }

  static async init(ws: WebSocket, pgSave: PlaygroundStateSave): Promise<Client> {
    const id = crypto.randomUUID();
    WS.send(ws, {
      type: 'clientId',
      payload: id,
    });

    return new Promise((resolve, reject) => {
      const handler = (event: WebSocket.MessageEvent) => {
        const message = WS.read(event);

        if (message.type === WS.NICKNAME) {
          const client = new Client(id, message.payload as string);
          WS.send(ws, {
            type: 'state',
            payload: pgSave,
          });

          ws.removeEventListener('message', handler);
          resolve(client);
        }
      };

      ws.addEventListener('message', handler);

      ws.onerror = () => {
        ws.removeEventListener('message', handler);
        reject();
      };

      ws.onclose = () => {
        ws.removeEventListener('message', handler);
        reject();
      };
    });
  }
}

export class Room {
  id: string;
  pg: PlaygroundState;
  wss: WebSocket.Server;
  clients: Map<WebSocket, Client>;
  cursors: Map<WebSocket, { x: number; y: number }>;

  constructor(id: string, pgSave?: PlaygroundStateSave) {
    this.id = id;
    // @TODO make pgSave optional
    this.pg = new PlaygroundState(pgSave!);
    this.clients = new Map();
    this.cursors = new Map();
    this.wss = this.getServer();
  }

  private getServer() {
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', async (ws: WebSocket) => {
      const client = await Client.init(ws, this.pg.save()); // @TODO catch reject
      this.clients.set(ws, client);

      ws.onmessage = (event: WebSocket.MessageEvent) => {
        const message = WS.read(event);

        switch (message.type) {
          case WS.CURSOR:
            this.cursors.set(ws, message.payload as { x: number; y: number }); // @TODO add typing for position
            break;
          case WS.UPDATE:
            this.pg.applyUpdate(message.payload as PlaygroundStateSave);
            break;
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
        this.broadcast({ type: WS.CURSOR, payload: cursors });
        this.broadcast({ type: WS.UPDATE, payload: this.pg.getUpdate() });
      }, STATE_TICK_INTERVAL);
    });

    return wss;
  }

  private broadcast(message: WS.MSG, exclude: WebSocket[] = []) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && !exclude.includes(client)) {
        WS.send(client, message);
      }
    });
  }

  static getRandomString(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
