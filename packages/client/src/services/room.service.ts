import { type CreateRoomDto } from '@shared/dto/rooms/create-room.dto';
import { PlaygroundStateSave, WS } from '@shared/index';
import axios from 'axios';

const LOADER_URL = 'http://localhost:3000/';
const WSS_URL = 'ws://localhost:8081/';

export const roomService = {
  async createRoom(payload?: CreateRoomDto): Promise<string> {
    const response = await axios.post(LOADER_URL + 'rooms', payload);
    return response.data as string;
  },

  async connect(roomId: string, nickname: string): Promise<[WebSocket, string, PlaygroundStateSave]> {
    const ws = new WebSocket(WSS_URL + roomId);
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        const idListener = (event: MessageEvent) => {
          const message = WS.read(event);

          if (message.type == 'clientId') {
            const id = message.payload;

            WS.send(ws, {
              type: WS.NICKNAME,
              payload: nickname,
            });

            const stateListener = (event: MessageEvent) => {
              const message = WS.read(event);

              if (message.type == WS.STATE) {
                ws.removeEventListener('message', stateListener);
                const pgState = message.payload;
                resolve([ws, id, pgState]);
              }
            };
            ws.removeEventListener('message', idListener);
            ws.addEventListener('message', stateListener);
          }
        };
        ws.addEventListener('message', idListener);
      };
      ws.onerror = error => {
        reject(error);
      };
    });
  },
};
