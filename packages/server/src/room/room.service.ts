import { createServer } from 'http';
import { Injectable } from '@nestjs/common';
import { PlaygroundStateSave } from '@shared/index';
import { Room } from '../network';

@Injectable()
export class RoomService {
  static rooms = new Map<string, Room>();

  constructor() {
    const server = createServer();
    server.on('upgrade', (request, socket, head) => {
      const pathname = request.url!;
      const roomId = pathname.split('/')[1];

      if (!RoomService.rooms.has(roomId)) {
        socket.destroy();
        return;
      }
      const wss = RoomService.rooms.get(roomId)!.wss;
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
      });
    });

    server.listen(8081);
  }

  getRoomId(): string {
    let roomId = Room.getRandomString();
    while (RoomService.rooms.has(roomId)) {
      roomId = Room.getRandomString();
    }
    return roomId;
  }

  async createRoom(pgSave?: PlaygroundStateSave): Promise<string> {
    const roomId = this.getRoomId();
    const room = new Room(roomId);
    await room.init(pgSave);

    RoomService.rooms.set(roomId, room);
    return roomId;
  }
}
