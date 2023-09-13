import { PlaygroundState } from '@tt/shared';
import * as WebSocket from 'ws';
import { v4 } from 'uuid';

const STATE_UPDATE_INTERVAL = 1000;

export class Room {
  id: string;
  playground: PlaygroundState;
  wss: WebSocket.Server;
  clients: Map<WebSocket, string>;

  constructor(id: string, playground?: PlaygroundState) {
    this.id = id;
    this.playground = playground;
    this.clients = new Map();
    this.wss = this.getServer();
  }

  private getServer() {
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', (ws: WebSocket) => {
      const id = v4();
      this.clients.set(ws, id);

      ws.send(JSON.stringify(this.playground));

      ws.on('message', function message(data, isBinary) {
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(data, { binary: isBinary });
          }
        });
      });

      ws.on('close', (ws: WebSocket) => {
        this.clients.delete(ws);
      });

      setInterval(() => {
        wss.clients.forEach(function each(client) {
          client.send('ping');
        });
      }, STATE_UPDATE_INTERVAL);
    });

    return wss;
  }

  static getRandomString(): string {
    const buffer = Buffer.alloc(16);
    v4({}, buffer);
    const randomString = buffer.toString('hex');
    return randomString;
    // return crypto.createHash('sha256').update(randomString).digest('hex');
  }
}
