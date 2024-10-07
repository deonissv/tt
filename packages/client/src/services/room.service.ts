import axios from 'axios';
import { ENDPOINT } from '../config';
import { getAccessToken } from '../utils';

import { ServerAction } from '@tt/actions';
import { Channel } from '@tt/channel';
import { RoomPreviewDto, RoomwDto } from '@tt/dto';
import type { SimulationState } from '@tt/states';
import { Tuple } from '@tt/utils';
import type { Dispatch, SetStateAction } from 'react';

export const RoomService = {
  async createRoom(gameCode: string): Promise<string> {
    const response = await axios.post(
      ENDPOINT + 'rooms',
      {
        gameCode: gameCode,
      },
      {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      },
    );
    return response.data as string;
  },

  async getUserRooms(code: string): Promise<RoomPreviewDto[]> {
    const response = await axios.get(ENDPOINT + `rooms/user/${code}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as RoomPreviewDto[];
  },

  async getRoom(code: string): Promise<RoomwDto> {
    const response = await axios.get(ENDPOINT + `rooms/${code}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
    return response.data as RoomwDto;
  },

  async startRoom(code: string): Promise<string> {
    const response = await axios.post(ENDPOINT + `rooms/start/${code}`, null, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });

    return response.data as string;
  },

  async deleteRoom(code: string): Promise<void> {
    await axios.delete(ENDPOINT + `rooms/${code}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
  },

  async connect(
    roomId: string,
    setDownloadProgress: Dispatch<SetStateAction<Tuple<number, 2> | null>>,
  ): Promise<[WebSocket, SimulationState]> {
    const ws = new WebSocket(`${ENDPOINT}ws/${roomId}`, `Bearer.${getAccessToken()}`);
    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        const progressListener = (event: MessageEvent) => {
          const message = Channel.read(event);

          message.forEach(action => {
            if (action.type == ServerAction.DOWNLOAD_PROGRESS) {
              const succeded = action.payload.succeded;
              const total = action.payload.total;
              setDownloadProgress(_ => [succeded, total]);
            }
          });
        };

        const stateListener = (event: MessageEvent) => {
          const message = Channel.read(event);

          const action = message[0];
          if (action.type == ServerAction.STATE) {
            const simState = action.payload;

            setDownloadProgress([simState.downloadProgress.succeded, simState.downloadProgress.total]);

            ws.removeEventListener('message', stateListener);
            ws.removeEventListener('message', progressListener);
            resolve([ws, simState]);
          }
        };

        ws.addEventListener('message', stateListener);
        ws.addEventListener('message', progressListener);
      };
      ws.onerror = error => {
        reject(new Error(error.type));
      };
      ws.onclose = () => {
        ws.close();
      };
    });
  },
};
