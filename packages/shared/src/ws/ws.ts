import { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/simulation';
import ws from 'ws';

export const CLIENT_ID = 'clientId';
export const NICKNAME = 'nickname';
export const STATE = 'state';
export const CURSOR = 'cursor';
export const UPDATE = 'update';
export const DOWNLOAD_PROGRESS = 'downloadProgress';

export interface DownloadProgress {
  loaded: number;
  total: number;
  succeded: number;
  failed: number;
}

export type MSG =
  | {
      type: typeof CLIENT_ID | typeof NICKNAME;
      payload: string;
    }
  | {
      type: typeof STATE;
      payload: SimulationStateSave;
    }
  | {
      type: typeof UPDATE;
      payload: SimulationStateUpdate;
    }
  | {
      type: typeof DOWNLOAD_PROGRESS;
      payload: DownloadProgress;
    };

export const send = (ws: WebSocket | ws.WebSocket, msg: MSG) => {
  ws.send(JSON.stringify(msg));
};

export const read = (event: MessageEvent | ws.MessageEvent): MSG => {
  return JSON.parse(event.data as string) as MSG;
};
