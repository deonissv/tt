import { Logger } from '@nestjs/common';
import { WS } from '@shared/ws';
import type * as WebSocket from 'ws';

const logger = new Logger('Client');

export class Client {
  id: string;
  nickname: string;

  constructor(id: string, nickname: string) {
    this.id = id;
    this.nickname = nickname;
  }

  static async init(ws: WebSocket): Promise<Client> {
    logger.log('Initializing client...');

    const id = crypto.randomUUID();
    logger.log('Sending client ID: ', id);

    WS.send(ws, [
      {
        type: WS.SimActionType.CLIENT_ID,
        payload: id,
      },
    ]);

    return new Promise((resolve, reject) => {
      const handler = (event: WebSocket.MessageEvent) => {
        logger.log('Receiving nickname:', event.data);

        const message = WS.read(event);

        const action = message[0];
        if (action.type === WS.SimActionType.NICKNAME) {
          const client = new Client(id, action.payload);

          ws.removeEventListener('message', handler);

          logger.log(`Client ${id} initialized`);
          resolve(client);
        }
      };

      ws.addEventListener('message', handler);

      ws.onerror = error => {
        logger.error('WebSocket error:', error);
        ws.removeEventListener('message', handler);
        reject(new Error(error.type));
      };

      ws.onclose = error => {
        logger.log(`Client ${id} disconnected: `, error);
        ws.removeEventListener('message', handler);
        reject(new Error(error.type));
      };
    });
  }
}
