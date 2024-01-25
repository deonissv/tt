import { createServer } from 'http';

import { BadRequestException, Injectable } from '@nestjs/common';
import { SimulationRoom } from './simulation-room';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { GamesService } from '../games/games.service';
import { PlaygroundStateSave } from '@shared/PlaygroundState';
import { RoomPreviewDto } from '@shared/dto/rooms/room-preview.dto';

@Injectable()
export class RoomsService {
  static rooms = new Map<string, SimulationRoom>();
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly gameService: GamesService,
  ) {
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

    if (configService.getOrThrow<string>('NODE_ENV') !== 'test') {
      server.listen(configService.getOrThrow<string>('WS_PORT'));
    }
  }

  private async startRoomSimulation(roomCode: string, pgSave?: PlaygroundStateSave) {
    const room = new SimulationRoom(this, roomCode);
    await room.init(pgSave);
    RoomsService.rooms.set(roomCode, room);
    return roomCode;
  }

  async createRoom(creatorId: number, gameCode?: string): Promise<string> {
    const pgSave = gameCode ? (await this.gameService.findContentByCode(gameCode)) ?? {} : {};
    const roomTable = await this.prisma.room.create({
      data: {
        creatorId,
        type: 1,
      },
    });

    return await this.startRoomSimulation(roomTable.code, pgSave);
  }

  async getUserRooms(userCode: string): Promise<RoomPreviewDto[]> {
    const usersRooms = await this.prisma.user.findFirst({
      where: {
        code: userCode,
      },
      include: {
        Rooms: {
          include: {
            RoomProgress: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    if (!usersRooms) {
      throw new BadRequestException('User not found');
    }

    return usersRooms.Rooms.map(room => ({
      roomCode: room.code,
    }));
  }

  async startRoom(roomCode: string): Promise<string> {
    if (RoomsService.rooms.has(roomCode)) {
      throw new BadRequestException('Room already started');
    }

    const roomProgress = await this.prisma.room.findFirst({
      where: {
        code: roomCode,
      },
      include: {
        RoomProgress: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!roomProgress) {
      throw new BadRequestException('Room not found');
    }

    if (!roomProgress.RoomProgress?.[0]) {
      throw new BadRequestException('No saved progress');
    }

    const pgSave = JSON.parse(roomProgress.RoomProgress[0].stateDelta as string) as PlaygroundStateSave;
    return await this.startRoomSimulation(roomCode, pgSave);
  }

  async saveRoomProgress(roomCode: string, stateDelta: PlaygroundStateSave) {
    const room = await this.prisma.room.findFirst({
      where: {
        code: roomCode,
      },
    });

    if (!room) {
      throw new BadRequestException('Room not found');
    }

    await this.prisma.roomProgress.create({
      data: {
        roomId: room.roomId,
        stateDelta: JSON.stringify(stateDelta),
      },
    });
  }
}
