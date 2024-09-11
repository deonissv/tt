import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { Prisma, Room } from '@prisma/client';
import { GamesService } from '../games/games.service';
import { PrismaService } from '../prisma/prisma.service';
import { SimulationRoom } from './simulation-room';

import type { RoomPreviewDto } from '@shared/dto/rooms';
import { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/states';
import { Simulation } from '../simulation/simulation';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger('RoomsService');
  static rooms = new Map<string, SimulationRoom>();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly gameService: GamesService,
  ) {}

  /**
   * Starts the simulation for a room.
   *
   * @param roomCode - The code of the room to start the simulation for.
   * @param savingDelay - The delay (in milliseconds) between saving simulation state.
   * @param stateTickDelay - The delay (in milliseconds) between simulation state ticks.
   * @param simSave - Optional. The simulation state to initialize the room with.
   * @returns The code of the room.
   */
  startRoomSimulation(roomCode: string, savingDelay: number, stateTickDelay: number, simSave?: SimulationStateSave) {
    const room = new SimulationRoom(this, roomCode, savingDelay, stateTickDelay);
    try {
      room.init(simSave).catch((e: Error) => this.logger.error(e.message));
    } catch (e) {
      this.logger.error((e as Error).message);
    }
    RoomsService.setRoom(room);
    return roomCode;
  }

  /**
   * Creates a new room with the specified author ID and game code.
   *
   * @param authorId - The ID of the author creating the room.
   * @param gameCode - The code of the game associated with the room.
   * @returns A Promise that resolves to the code of the created room.
   * @throws BadRequestException if the game is not found.
   */
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

  /**
   * Retrieves the rooms associated with a user.
   *
   * @param userCode The code of the user.
   * @returns A promise that resolves to an array of RoomPreviewDto objects representing the user's rooms.
   * @throws BadRequestException if the user is not found.
   */
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

  /**
   * Starts a room with the specified room code.
   *
   * @param roomCode - The code of the room to start.
   * @returns A Promise that resolves to a string representing the result of starting the room.
   * @throws BadRequestException if the room is already started or not found.
   */
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

    const simSave = lastState.content;

    updates.forEach(update => {
      Simulation.mergeStateDelta(simSave, update.content as SimulationStateUpdate);
    });

    return this.startRoomSimulation(roomCode, room.savingDelay, room.stateTickDelay, simSave);
  }

  /**
   * Retrieves the last state of a room.
   *
   * @param roomId - The ID of the room.
   * @returns A promise that resolves to an object containing the order and content of the last room state.
   * @throws `BadRequestException` if the room progress is not found.
   */
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

  /**
   * Saves the progress update of a room.
   *
   * @param roomCode - The code of the room.
   * @param stateUpdate - The state update to be saved.
   * @throws BadRequestException if the room is not found.
   */
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

  /**
   * Saves the state of a room.
   *
   * @param roomCode - The code of the room.
   * @throws BadRequestException if the room or simulation room is not found.
   */
  async saveRoomState(roomCode: string) {
    const room = await this.findRoomByCode(roomCode);
    const simulationRoom = RoomsService.getRoom(roomCode);

    if (!room || !simulationRoom) {
      throw new BadRequestException('Room not found');
    }

    const simSave = simulationRoom.simulation.toState();

    await this.prismaService.roomProgress.create({
      data: {
        roomId: room.roomId,
        RoomProgressSave: {
          create: {
            content: simSave as Prisma.InputJsonObject,
          },
        },
      },
    });
  }

  /**
   * Saves the game load information for a room.
   *
   * @param roomCode - The code of the room.
   * @param gameId - The ID of the game.
   * @param gameVersion - The version of the game.
   * @throws BadRequestException if the room is not found.
   */
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

  /**
   * Removes a room with the specified room code.
   * If the room is currently running, a BadRequestException is thrown.
   *
   * @param roomCode - The code of the room to be removed.
   * @throws BadRequestException - If the room is currently running.
   */
  async removeRoom(roomCode: string) {
    if (RoomsService.hasRoom(roomCode)) {
      throw new BadRequestException('Room is running');
    }

    this.logger.log(`Removing room with code: ${roomCode}`);
    await this.prismaService.room.delete({ where: { code: roomCode } });
    this.logger.log(`Room with code: ${roomCode} successfully removed`);
  }

  /**
   * Finds a room by its code.
   *
   * @param roomCode - The code of the room to find.
   * @returns A promise that resolves to the found room, or null if no room is found.
   */
  async findRoomByCode(roomCode: string): Promise<Room | null> {
    return await this.prismaService.room.findFirst({
      where: {
        code: roomCode,
      },
    });
  }

  /**
   * Sets the specified room in the RoomsService.
   *
   * @param room - The room to be set.
   */
  static setRoom(room: SimulationRoom) {
    RoomsService.rooms.set(room.id, room);
  }

  /**
   * Retrieves a simulation room by its room code.
   *
   * @param roomCode - The code of the room to retrieve.
   * @returns The simulation room associated with the given room code, or undefined if not found.
   */
  static getRoom(roomCode: string): SimulationRoom | undefined {
    return RoomsService.rooms.get(roomCode);
  }

  /**
   * Deletes a room from the RoomsService.
   *
   * @param roomCode - The code of the room to delete.
   */
  static deleteRoom(roomCode: string) {
    RoomsService.rooms.delete(roomCode);
  }

  /**
   * Checks if a room with the specified room code exists.
   *
   * @param roomCode - The code of the room to check.
   * @returns `true` if the room exists, `false` otherwise.
   */
  static hasRoom(roomCode: string): boolean {
    return RoomsService.rooms.has(roomCode);
  }
}
