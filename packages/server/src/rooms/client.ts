import * as WebSocket from 'ws';

import { PlaygroundStateSave, WS } from '@shared/index';

export class Client {
  id: string;
  nickname: string;

  constructor(id: string, nickname: string) {
    this.id = id;
    this.nickname = nickname;
  }

  static async init(ws: WebSocket, pgSave: PlaygroundStateSave): Promise<Client> {
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
          WS.send(ws, {
            type: WS.STATE,
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
