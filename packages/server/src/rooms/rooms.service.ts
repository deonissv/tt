import { createServer } from 'http';

import { BadRequestException, Injectable } from '@nestjs/common';
import { SimulationRoom } from './simulation-room';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { GamesService } from '../games/games.service';
import { RoomPreviewDto } from '@shared/dto/rooms/room-preview.dto';
import { PlaygroundStateUpdate, PlaygroundStateSave } from '@shared/index';
import { Prisma, Room } from '@prisma/client';
import { Simulation } from '../simulation/simulation';

@Injectable()
export class RoomsService {
  static rooms = new Map<string, SimulationRoom>();

  constructor(
    private readonly prismaService: PrismaService,
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

      wss.on('close', _ws => {
        RoomsService.rooms.delete(roomId);
      });
    });

    if (configService.getOrThrow<string>('NODE_ENV') !== 'test') {
      server.listen(configService.getOrThrow<string>('WS_PORT'));
    }
  }

  async startRoomSimulation(roomCode: string, pgSave?: PlaygroundStateSave) {
    const room = new SimulationRoom(this, roomCode);
    await room.init(pgSave);
    RoomsService.rooms.set(roomCode, room);
    return roomCode;
  }

  async createRoom(authorId: number, gameCode: string): Promise<string> {
    const gameVersion = await this.gameService.findLastVersionByCode(gameCode);
    if (!gameVersion) {
      throw new BadRequestException('Game not found');
    }

    const roomTable = await this.prismaService.room.create({
      data: {
        authorId,
        type: 1,
        RoomProgress: {
          create: {
            RoomProgressGameLoad: {
              create: {
                gameId: gameVersion.gameId,
                gameVersion: gameVersion.version,
              },
            },
          },
        },
      },
      include: {
        RoomProgress: true,
      },
    });

    const pgSave = gameVersion.content as PlaygroundStateSave;
    return await this.startRoomSimulation(roomTable.code, pgSave);
  }

  async getUserRooms(userCode: string): Promise<RoomPreviewDto[]> {
    const usersRooms = await this.prismaService.user.findFirst({
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

    const room = await this.findRoomByCode(roomCode);

    if (!room) {
      throw new BadRequestException('Room not found');
    }

    const lastState = await this.getRoomLastState(room.roomId);
    const updates = await this.prismaService.roomProgressUpdate.findMany({
      where: {
        roomId: room.roomId,
        order: {
          gt: lastState.order,
        },
      },
      orderBy: {
        order: 'desc',
      },
    });

    const pgSave = lastState.content;

    updates.forEach(update => {
      Simulation.mergeStateDelta(pgSave, update.content as PlaygroundStateUpdate);
    });

    return await this.startRoomSimulation(roomCode, pgSave);
  }

  private async getRoomLastState(roomId: number): Promise<{ order: number; content: PlaygroundStateSave }> {
    const lastSave = await this.prismaService.roomProgressSave.findFirst({
      where: {
        roomId,
      },
      orderBy: {
        order: 'desc',
      },
    });

    if (lastSave) {
      return {
        order: 0,
        content: lastSave.content as PlaygroundStateSave,
      };
    }
    const gameLoad = await this.prismaService.roomProgressGameLoad.findFirst({
      where: {
        roomId,
      },
      include: {
        GameVersion: true,
      },
      orderBy: {
        order: 'desc',
      },
    });
    if (!gameLoad) {
      throw new BadRequestException('Room progress not found');
    }
    return {
      order: gameLoad.order,
      content: gameLoad.GameVersion.content as PlaygroundStateSave,
    };
  }

  async saveRoomProgressUpdate(roomCode: string, stateUpdate: PlaygroundStateUpdate) {
    const room = await this.findRoomByCode(roomCode);

    if (!room) {
      throw new BadRequestException('Room not found');
    }

    await this.prismaService.roomProgress.create({
      data: {
        roomId: room.roomId,
        RoomProgressUpdate: {
          create: {
            content: stateUpdate as Prisma.InputJsonObject,
          },
        },
      },
      include: {
        RoomProgressUpdate: true,
      },
    });
  }

  async saveRoomState(roomCode: string) {
    const room = await this.findRoomByCode(roomCode);
    const simulationRoom = RoomsService.rooms.get(roomCode);

    if (!room || !simulationRoom) {
      throw new BadRequestException('Room not found');
    }

    const pgSave = simulationRoom.simulation.toStateSave();

    await this.prismaService.roomProgress.create({
      data: {
        roomId: room.roomId,
        RoomProgressSave: {
          create: {
            content: pgSave as Prisma.InputJsonObject,
          },
        },
      },
    });
  }

  async saveRoomGameLoad(roomCode: string, gameId: number, gameVersion: number) {
    const room = await this.findRoomByCode(roomCode);

    if (!room) {
      throw new BadRequestException('Room not found');
    }

    await this.prismaService.roomProgress.create({
      data: {
        roomId: room.roomId,
        RoomProgressGameLoad: {
          create: {
            gameId,
            gameVersion,
          },
        },
      },
    });
  }

  async findRoomByCode(roomCode: string): Promise<Room | null> {
    return await this.prismaService.room.findFirst({
      where: {
        code: roomCode,
      },
    });
  }
}
