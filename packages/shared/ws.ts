import ws from 'ws';

export namespace WS {
  export const CLIENT_ID = 'clientId';
  export const NICKNAME = 'nickname';
  export const STATE = 'state';
  export const CURSOR = 'cursor';
  export const UPDATE = 'update';

  export type MSG = {
    type: typeof CLIENT_ID | typeof NICKNAME | typeof STATE | typeof CURSOR | typeof UPDATE;
    payload: any;
  };

  export const send = (ws: WebSocket | ws.WebSocket, message: WS.MSG) => {
    ws.send(JSON.stringify(message));
  };

  export const read = (event: MessageEvent | ws.MessageEvent): WS.MSG => {
    return JSON.parse(event.data.toString());
  };
}
