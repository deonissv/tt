import * as http from 'http';
import type internal from 'node:stream';

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { OnGatewayInit } from '@nestjs/websockets';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import { AuthService } from '../auth/auth.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { RoomsService } from '../rooms/rooms.service';

/**
 * Aborts the WebSocket handshake with the given code and message.
 * taken from ws
 * https://github.com/websockets/ws/blob/master/lib/websocket-server.js#L490
 */
function abortHandshake(
  socket: internal.Duplex,
  code: keyof typeof http.STATUS_CODES,
  message?: string,
  headers: Record<string, string | number> = [] as unknown as Record<string, string>,
) {
  message = message ?? http.STATUS_CODES[code] ?? '500';
  headers = {
    Connection: 'close',
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(message),
    ...headers,
  };

  socket.once('finish', () => {
    socket.destroy();
  });

  socket.end(
    `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
      Object.keys(headers)
        .map(h => `${h}: ${headers[h]}`)
        .join('\r\n') +
      '\r\n\r\n' +
      message,
  );
}

@WebSocketGateway({ transports: ['websocket'] })
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly authService: AuthService,
    private readonly jwtStrategy: JwtStrategy,
    private readonly roomsService: RoomsService,
  ) {}

  afterInit(_wss: Server) {
    _wss.setMaxListeners(255);
    const httpServer = (this.adapterHost ? this.adapterHost.httpAdapter.getHttpServer() : this.server) as http.Server;
    httpServer.removeAllListeners('upgrade');
    httpServer.on('upgrade', async (request, socket, head) => {
      const tokenString = request.headers['sec-websocket-protocol']?.split(' ').find(p => p.startsWith('Bearer'));
      const token = tokenString?.substring(7);
      if (!token) {
        abortHandshake(socket, 401, 'Unauthorized');
        return;
      }

      try {
        const verifiedToken = await this.authService.verifyAsync(token);
        const validatedUser = this.jwtStrategy.validate(verifiedToken);
        if (!validatedUser) {
          abortHandshake(socket, 500, 'Token is damaged');
        }
      } catch {
        abortHandshake(socket, 401, 'Unauthorized');
        return new UnauthorizedException();
      }

      const roomId = this.getRoomUrl(request);
      if (!roomId || !RoomsService.hasRoom(roomId)) {
        abortHandshake(socket, 400, 'No room found');
        return new BadRequestException('no room found');
      }

      const wss = RoomsService.getRoom(roomId)!.wss;
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
      });

      wss.on('close', _ws => {
        RoomsService.deleteRoom(roomId);
      });
    });
  }

  private getRoomUrl(request: http.IncomingMessage): string | undefined {
    return request.url?.split('/')?.[1];
  }
}
