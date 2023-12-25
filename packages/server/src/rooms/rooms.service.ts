import * as crypto from 'crypto';
import { createServer } from 'http';

import { Injectable } from '@nestjs/common';
import { Room as RRoom } from './room';
import { PlaygroundStateSave } from '@shared/PlaygroundState';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class RoomsService {
  static rooms = new Map<string, RRoom>();
  constructor(private readonly prisma: PrismaService) {
    const server = createServer();
    server.on('upgrade', (request, socket, head) => {
      const pathname = request.url!;
      const roomId = pathname.split('/')[1];
      if (!RoomsService.rooms.has(roomId)) {
        socket.destroy();
        return;
      }
      const wss = RoomsService.rooms.get(roomId)!.wss;
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
      });
    });
    server.listen(8081);
  }

  getRoomCode(): string {
    let roomId = RoomsService.getRandomString();
    while (RoomsService.rooms.has(roomId)) {
      roomId = RoomsService.getRandomString();
    }
    return roomId;
  }

  async createRoom(author: User, pgSave?: PlaygroundStateSave): Promise<string> {
    const roomCode = this.getRoomCode();
    const room = new RRoom(roomCode);
    await this.prisma.room.create({
      data: {
        code: roomCode,
        creatorId: author.userId,
        type: 1,
      },
    });

    await room.init(pgSave);
    RoomsService.rooms.set(roomCode, room);
    return roomCode;
  }

  static getRandomString(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
