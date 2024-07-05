import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma, Room } from '@prisma/client';
import { Logger } from 'testcontainers/build/common';
import { GamesService } from '../games/games.service';
import { PrismaService } from '../prisma.service';
import { SimulationRoom } from './simulation-room';

import type { RoomPreviewDto } from '@shared/dto/rooms';
import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/simulation';
import { Simulation } from '../simulation/simulation';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);
  static rooms = new Map<string, SimulationRoom>();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly gameService: GamesService,
  ) {}

  startRoomSimulation(roomCode: string, savingDelay: number, stateTickDelay: number, simSave?: SimulationStateSave) {
    const room = new SimulationRoom(this, roomCode, savingDelay, stateTickDelay);
    try {
      room.init(simSave).catch((e: Error) => this.logger.error(e.message));
    } catch (e) {
      this.logger.error((e as unknown as Error).message);
    }
    RoomsService.setRoom(room);
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

    const simSave = gameVersion.content as SimulationStateSave;
    return this.startRoomSimulation(roomTable.code, roomTable.savingDelay, roomTable.stateTickDelay, simSave);
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
    if (RoomsService.hasRoom(roomCode)) {
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
      Simulation.mergeStateDelta(pgSave, update.content as SimulationStateUpdate);
    });

    return this.startRoomSimulation(roomCode, room.savingDelay, room.stateTickDelay, pgSave);
  }

  private async getRoomLastState(roomId: number): Promise<{ order: number; content: SimulationStateSave }> {
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
        content: lastSave.content as SimulationStateSave,
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
      content: gameLoad.GameVersion.content as SimulationStateSave,
    };
  }

  async saveRoomProgressUpdate(roomCode: string, stateUpdate: SimulationStateUpdate) {
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
    const simulationRoom = RoomsService.getRoom(roomCode);

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

  static setRoom(room: SimulationRoom) {
    RoomsService.rooms.set(room.id, room);
  }

  static getRoom(roomCode: string): SimulationRoom | undefined {
    return RoomsService.rooms.get(roomCode);
  }

  static deleteRoom(roomCode: string) {
    RoomsService.rooms.delete(roomCode);
  }

  static hasRoom(roomCode: string): boolean {
    return RoomsService.rooms.has(roomCode);
  }
}
