import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    

    const client: WebSocket = context?.switchToWs()?.getClient();
    console.log('client.protocol', client.protocol);
    
    // console.log(client.handshake.headers);
    
    return true;
  }
}
