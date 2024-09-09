import axios from 'axios';
import { LOADER_URL, WSS_URL } from '../config';
import { getAccessToken } from '../utils';

import type { Tuple } from '@babylonjs/core/types';
import type { CreateRoomDto, RoomPreviewDto } from '@shared/dto/rooms';
import type { SimulationStateSave } from '@shared/dto/states';
import { ClientAction, ServerAction, WS } from '@shared/ws';
import type { Dispatch, SetStateAction } from 'react';

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

  async deleteRoom(code: string): Promise<void> {
    await axios.delete(LOADER_URL + `rooms/${code}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
  },

  async connect(
    roomId: string,
    nickname: string,
    setDownloadProgress: Dispatch<SetStateAction<Tuple<number, 2> | null>>,
  ): Promise<[WebSocket, string, SimulationStateSave]> {
    const ws = new WebSocket(WSS_URL + roomId, `Bearer.${getAccessToken()}`);
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        const progressListener = (event: MessageEvent) => {
          const message = WS.read(event);

          message.forEach(action => {
            if (action.type == ServerAction.DOWNLOAD_PROGRESS) {
              const loaded = action.payload.total;
              const total = action.payload.total;
              setDownloadProgress(_ => [loaded, total]);
            }
          });
        };

        const idListener = (event: MessageEvent) => {
          const message = WS.read(event);

          const action = message[0];
          if (action.type == ServerAction.CLIENT_ID) {
            const id = action.payload;

            WS.send(ws, [
              {
                type: ClientAction.NICKNAME,
                payload: nickname,
              },
            ]);

            const stateListener = (event: MessageEvent) => {
              const message = WS.read(event);

              const action = message[0];
              if (action.type == ServerAction.STATE) {
                ws.removeEventListener('message', stateListener);
                ws.removeEventListener('message', progressListener);
                const simState = action.payload;
                resolve([ws, id, simState]);
              }
            };
            ws.removeEventListener('message', idListener);
            ws.addEventListener('message', stateListener);
          }
        };
        ws.addEventListener('message', idListener);
        ws.addEventListener('message', progressListener);
      };
      ws.onerror = error => {
        reject(new Error(error.type));
      };
    });
  },
};
