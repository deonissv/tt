import type { Tuple } from '@babylonjs/core/types';
import type { SimulationStateSave } from '@shared/dto/states';
import type ws from 'ws';
import { type MessageEvent as me } from 'ws';
import type { ClientAction, ServerAction, SimAction } from './actions';
import type {
  CursorsPld,
  DownloadProgressPld,
  DropActorPld,
  MoveClientActorPld,
  MoveServerActorPld,
  SpawnActorPld,
} from './payloads';

interface ActionPayloads {
  // handshake
  [ClientAction.NICKNAME]: string;
  [ServerAction.CLIENT_ID]: string;
  [ServerAction.STATE]: SimulationStateSave;
  [ServerAction.DOWNLOAD_PROGRESS]: DownloadProgressPld;

  [ClientAction.MOVE_ACTOR]: MoveServerActorPld;
  [ServerAction.MOVE_ACTOR]: MoveClientActorPld;

  [ClientAction.PICK_ITEM]: string;
  [ClientAction.CURSOR]: Tuple<number, 2>;
  [ClientAction.PICK_ACTOR]: string;
  [ClientAction.RELEASE_ACTOR]: string;

  [ServerAction.CURSORS]: CursorsPld;
  [ServerAction.SPAWN_ACTOR]: SpawnActorPld;
  [ServerAction.DROP_ACTOR]: DropActorPld;
  [ServerAction.REMOVE_ACTOR]: string;
}

export type MsgMap = {
  [K in SimAction]: { type: K; payload: ActionPayloads[K] };
};

export type ServerActionMsg = MsgMap[ServerAction];
export type ClientActionMsg = MsgMap[ClientAction];

export type ActionMsg = MsgMap[SimAction];
export type MSG = ActionMsg[];

export const send = (ws: WebSocket | ws, msg: MSG) => {
  if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(msg));
};

export const read = (event: MessageEvent | me): MSG => {
  return JSON.parse(event.data as string) as MSG;
};
