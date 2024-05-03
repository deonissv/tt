import { type CreateRoomDto } from '@shared/dto/rooms/create-room.dto';
import { PlaygroundStateSave, WS } from '@shared/index';
import axios from 'axios';
import { LOADER_URL, WSS_URL } from '../config';
import { RoomPreviewDto } from '@shared/dto/rooms/room-preview.dto';
import { getAccessToken } from '../utils';

export const RoomService = {
  async createRoom(payload: CreateRoomDto): Promise<string> {
    const response = await axios.post(LOADER_URL + 'rooms', payload, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as string;
  },

  async getUserRooms(code: string): Promise<RoomPreviewDto[]> {
    const response = await axios.get(LOADER_URL + `rooms/${code}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as RoomPreviewDto[];
  },

  async startRoom(code: string): Promise<string> {
    const response = await axios.post(LOADER_URL + `rooms/start/${code}`, null, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });

    return response.data as string;
  },

  async connect(roomId: string, nickname: string): Promise<[WebSocket, string, PlaygroundStateSave]> {
    const ws = new WebSocket(WSS_URL + roomId, `Bearer.${getAccessToken()}`);
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
