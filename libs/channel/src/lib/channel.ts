import type { MSG } from '@tt/actions';
import type ws from 'ws';
import { type MessageEvent as me } from 'ws';

export class Channel {
  static send = (ws: WebSocket | ws, msg: MSG) => {
    if (ws && ws.readyState == ws.OPEN) ws.send(JSON.stringify(msg));
  };

  static read = (event: MessageEvent | me): MSG => {
    return JSON.parse(event.data as string) as MSG;
  };
}
