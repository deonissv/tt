import * as crypto from 'crypto';
import * as WebSocket from 'ws';

import { PlaygroundState, WS } from '@shared/index';

const STATE_TICK_RATE = 66; // [hz]
const STATE_TICK_INTERVAL = 1000 / STATE_TICK_RATE; // [ms]

class Client {
  id: string;
  nickname: string;

  constructor(id: string, nickname: string) {
    this.id = id;
    this.nickname = null;
  }

  static async init(ws: WebSocket, pg: PlaygroundState): Promise<Client> {
    const id = crypto.randomUUID();
    WS.send(ws, {
      type: 'clientId',
      payload: { id },
    });

    return new Promise((resolve, reject) => {
      const handler = (event: WebSocket.MessageEvent) => {
        const message = WS.read(event);

        if (message.type === WS.NICKNAME) {
          const client = new Client(id, message.payload.nickname);
          WS.send(ws, {
            type: 'state',
            payload: pg,
          });

          ws.removeEventListener('message', handler);
          resolve(client);
        }
      };

      ws.onmessage = handler;

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
  playground: PlaygroundState;
  wss: WebSocket.Server;
  clients: Map<WebSocket, Client>;
  cursors: Map<WebSocket, { x: number; y: number }>;

  constructor(id: string, playground?: PlaygroundState) {
    this.id = id;
    this.playground = playground;
    this.clients = new Map();
    this.cursors = new Map();
    this.wss = this.getServer();
  }

  private getServer() {
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', async (ws: WebSocket) => {
      const client = await Client.init(ws, this.playground); // @TODO catch reject
      this.clients.set(ws, client);

      ws.onmessage = (event: WebSocket.MessageEvent) => {
        const message = WS.read(event);

        if (message.type === WS.CURSOR) {
          this.cursors.set(ws, message.payload);
        }
      };

      setInterval(() => {
        if (this.clients.size === 0) {
          return;
        }

        const cursors = Array.from(this.cursors).reduce((acc, [ws, cursor]) => {
          acc[this.clients.get(ws).id] = cursor;
          return acc;
        }, {});
        this.broadcast({ type: WS.CURSOR, payload: cursors });
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
