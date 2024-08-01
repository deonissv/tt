import { WS } from '@shared/ws';
import type * as WebSocket from 'ws';

export class Client {
  id: string;
  nickname: string;

  constructor(id: string, nickname: string) {
    this.id = id;
    this.nickname = nickname;
  }

  static async init(ws: WebSocket): Promise<Client> {
    const id = crypto.randomUUID();
    WS.send(ws, {
      type: WS.CLIENT_ID,
      payload: id,
    });

    return new Promise((resolve, reject) => {
      const handler = (event: WebSocket.MessageEvent) => {
        const message = WS.read(event);
        if (message.type === WS.NICKNAME) {
          const client = new Client(id, message.payload);

          ws.removeEventListener('message', handler);
          resolve(client);
        }
      };

      ws.addEventListener('message', handler);

      ws.onerror = error => {
        ws.removeEventListener('message', handler);
        reject(new Error(error.type));
      };

      ws.onclose = error => {
        ws.removeEventListener('message', handler);
        reject(new Error(error.type));
      };
    });
  }
}
