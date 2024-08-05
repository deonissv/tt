import type { Tuple } from '@babylonjs/core/types';
import type { SimulationStateSave } from '@shared/dto/states';
import type ws from 'ws';
import { type MessageEvent as me } from 'ws';

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

export type Cursors = Record<string, Tuple<number, 2>>;

interface ActionPayloads {
  [SimActionType.CLIENT_ID]: string;
  [SimActionType.NICKNAME]: string;
  [SimActionType.STATE]: SimulationStateSave;
  [SimActionType.CURSOR]: Tuple<number, 2>;
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

export const send = (ws: WebSocket | ws, msg: MSG) => {
  if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(msg));
};

export const read = (event: MessageEvent | me): MSG => {
  return JSON.parse(event.data as string) as MSG;
};
