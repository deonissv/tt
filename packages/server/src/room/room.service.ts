import { createServer } from 'http';
import * as WebSocket from 'ws';
import { v4 } from 'uuid';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomService {
  static rooms: Map<string, WebSocket.Server> = new Map();
  clients: Map<WebSocket, string>;

  constructor() {
    this.clients = new Map();

    const server = createServer();
    server.on('upgrade', (request, socket, head) => {
      const pathname = request.url;
      const roomId = pathname!.split('/')[1];

      if (!RoomService.rooms.has(roomId)) {
        socket.destroy();
        return;
      }
      const wss = RoomService.rooms.get(roomId);
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
      });
    });

    server.listen(8081);
  }

  getServer(): WebSocket.Server {
    const wss = new WebSocket.Server({ noServer: true });

    wss.on('connection', (ws: WebSocket) => {
      const id = v4();
      this.clients.set(ws, id);

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
      }, 1000);
    });

    return wss;
  }

  getRandomString(): string {
    const buffer = Buffer.alloc(16);
    v4({}, buffer);
    const randomString = buffer.toString('hex');
    return randomString;
    // return crypto.createHash('sha256').update(randomString).digest('hex');
  }

  getRoomId(): string {
    let roomId = this.getRandomString();
    while (RoomService.rooms.has(roomId)) {
      roomId = this.getRandomString();
    }
    return roomId;
  }

  createRoom(): string {
    const roomId = this.getRoomId();
    const wss = this.getServer();

    RoomService.rooms.set(roomId, wss);
    return roomId;
  }
}
