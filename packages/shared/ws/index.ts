import ws from 'ws';
import { PlaygroundStateUpdate, Transformation } from '..';

export const CLIENT_ID = 'clientId';
export const NICKNAME = 'nickname';
export const STATE = 'state';
export const CURSOR = 'cursor';
export const UPDATE = 'update';

// make consistent with PlaygroundStateUpdate/PlaygroundState positions
export interface Position {
  x: number;
  y: number;
}
export type CursorsUpdate = Record<string, Position>;

export type MSG_TYPE = typeof CLIENT_ID | typeof NICKNAME | typeof STATE | typeof CURSOR | typeof UPDATE;
export type MSG_PAYLOAD = string | PlaygroundStateUpdate | Position | CursorsUpdate;

export interface MSG {
  type: MSG_TYPE;
  payload: MSG_PAYLOAD;
}

export interface Actor {
  guid: string;
  pickedBy?: string;
  scale?: number[];
  rotation?: number[];
  position?: number[];
}

export const ACTOR_UPDATE = 'ACTOR_UPDATE';

export class PGUpdate extends CustomEvent<PlaygroundStateUpdate> {
  constructor(guid: string, transformation: Transformation, mass?: number) {
    super(ACTOR_UPDATE, {
      detail: {
        actortStates: [{ guid, transformation, mass }],
      },
    });
  }
}

export const send = (ws: WebSocket | ws.WebSocket, message: MSG) => {
  ws.send(JSON.stringify(message));
};

export const read = (event: MessageEvent | ws.MessageEvent): MSG => {
  return JSON.parse(event.data as string) as MSG;
};
