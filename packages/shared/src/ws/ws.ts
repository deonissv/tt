import type { SimulationStateSave } from '@shared/dto/states';
import type { Tuple } from '@shared/types';
import type ws from 'ws';

export const enum SimActionType {
  CLIENT_ID,
  NICKNAME,
  STATE,
  CURSOR,
  CURSORS,
  DOWNLOAD_PROGRESS,

  MOVE_ACTOR,
  PICK_ITEM,
}

export interface DownloadProgress {
  loaded: number;
  total: number;
  succeded: number;
  failed: number;
}

export interface MoveActor {
  guid: string;
  position: Tuple<number, 3>;
}

export interface CursorMove {
  position: Tuple<number, 2>;
}

export type Cursors = Record<string, Tuple<number, 2>>;

interface ActionPayloads {
  [SimActionType.CLIENT_ID]: string;
  [SimActionType.NICKNAME]: string;
  [SimActionType.STATE]: SimulationStateSave;
  [SimActionType.CURSOR]: CursorMove;
  [SimActionType.CURSORS]: Cursors;
  [SimActionType.DOWNLOAD_PROGRESS]: DownloadProgress;
  [SimActionType.MOVE_ACTOR]: MoveActor;
  [SimActionType.PICK_ITEM]: string;
}

type MsgMap = {
  [K in SimActionType]: { type: K; payload: ActionPayloads[K] };
};

export type SimAction = MsgMap[SimActionType];
export type MSG = SimAction[];

export const send = (ws: WebSocket | ws.WebSocket, msg: MSG) => {
  if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(msg));
};

export const read = (event: MessageEvent | ws.MessageEvent): MSG => {
  return JSON.parse(event.data as string) as MSG;
};
