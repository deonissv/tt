import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { Prisma, Room } from '@prisma/client';
import { GamesService } from '../games/games.service';
import { PrismaService } from '../prisma/prisma.service';
import { SimulationRoom } from './simulation-room';

import type { RoomPreviewDto, RoomwDto } from '@shared/dto/rooms';
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
   * Starts the simulation for a given room.
   *
   * @param roomTable - The room configuration.
   * @param simSave - Optional parameter to provide a saved simulation state.
   * @returns The code of the room.
   */
  startSimulationRoom(roomTable: Room, simSave?: SimulationStateSave, gameId?: number, gameVersion?: number): string {
    const room = new SimulationRoom(this, roomTable);
    try {
      room.init(simSave, gameId, gameVersion).catch(e => {
        this.logger.error((e as Error).message);
      });
    } catch (e) {
      this.logger.error((e as Error).message);
    }
    RoomsService.setRoom(room);
    return roomTable.code;
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
    return this.startSimulationRoom(roomTable, simSave);
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
            RoomProgressGameLoad: {
              take: 1,
              orderBy: { order: 'desc' },
              include: {
                GameVersion: {
                  include: {
                    Game: true,
                  },
                },
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
      gameCode: room.RoomProgressGameLoad[0].GameVersion.Game.code,
      gameName: room.RoomProgressGameLoad[0].GameVersion.Game.name,
      gameBannerUrl: room.RoomProgressGameLoad[0].GameVersion.Game.bannerUrl,
    }));
  }

  async findRoom(roomCode: string): Promise<RoomwDto> {
    const room = await this.prismaService.room.findFirst({
      where: {
        code: roomCode,
      },
    });

    if (!room) {
      throw new BadRequestException('Room not found');
    }

    return room;
  }

  /**
   * Starts an existing room with the specified room code.
   *
   * @param roomCode - The code of the room to start.
   * @returns A Promise that resolves to a string representing the result of starting the room.
   * @throws BadRequestException if the room is already started or not found.
   */
  async resumeRoom(roomCode: string): Promise<string> {
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
        order: 'asc',
      },
    });

    const simSave = lastState.content;

    let finalSimSave = structuredClone(simSave);
    updates.forEach(update => {
      finalSimSave = Simulation.mergeStateDelta(finalSimSave, update.content as SimulationStateUpdate);
    });

    return this.startSimulationRoom(room, finalSimSave);
  }

  /**
   * Retrieves the last state of a room.
   *
   * @param roomId - The ID of the room.
   * @returns A promise that resolves to an object containing the order and content of the last room state.
   * @throws `BadRequestException` if the room progress is not found.
   */
  private async getRoomLastState(roomId: number): Promise<{ order: number; content: SimulationStateSave }> {
    this.logger.log(`Retrieving last state for room with ID: ${roomId}`);

    const lastSave = await this.prismaService.roomProgress.findFirst({
      where: {
        roomId,
        OR: [{ RoomProgressSave: { isNot: null } }, { RoomProgressGameLoad: { isNot: null } }],
      },
      orderBy: {
        order: 'desc',
      },
      include: {
        RoomProgressSave: true,
        RoomProgressGameLoad: {
          include: {
            GameVersion: true,
          },
        },
      },
    });

    if (!lastSave) {
      this.logger.warn(`Room progress not found for room ID: ${roomId}`);
      throw new BadRequestException('Room progress not found');
    }

    if (lastSave.RoomProgressSave) {
      this.logger.log(`Found RoomProgressSave for room ID: ${roomId}`);
      return {
        order: lastSave.order,
        content: lastSave.RoomProgressSave.content as SimulationStateSave,
      };
    }

    if (lastSave.RoomProgressGameLoad) {
      this.logger.log(`Found RoomProgressGameLoad for room ID: ${roomId}`);
      return {
        order: lastSave.order,
        content: lastSave.RoomProgressGameLoad.GameVersion.content as SimulationStateSave,
      };
    }

    this.logger.error(`Failed to load game progress for room ID: ${roomId}`);
    throw new BadRequestException('Failed to load game progress');
  }

  /**
   * Saves the progress update of a room.
   *
   * @param roomCode - The code of the room.
   * @param stateUpdate - The state update to be saved.
   * @throws BadRequestException if the room is not found.
   */
  async saveRoomProgressUpdate(roomCode: string, stateUpdate: SimulationStateUpdate) {
    this.logger.log(`Saving progress update for room with code: ${roomCode}`);

    const room = await this.findRoomByCode(roomCode);

    if (!room) {
      this.logger.warn(`Room not found with code: ${roomCode}`);
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

    this.logger.log(`Progress update saved for room with code: ${roomCode}`);
  }

  /**
   * Saves the state of a room.
   *
   * @param roomCode - The code of the room.
   * @throws BadRequestException if the room or simulation room is not found.
   */
  async saveRoomState(roomCode: string) {
    this.logger.log(`Saving state for room with code: ${roomCode}`);

    const room = await this.findRoomByCode(roomCode);
    const simulationRoom = RoomsService.getRoom(roomCode);

    if (!room || !simulationRoom) {
      this.logger.warn(`Room not found with code: ${roomCode}`);
      throw new BadRequestException('Room not found');
    }

    const simSave = simulationRoom.simulation.toState();
    this.logger.log(`Simulation state generated for room with code: ${roomCode}`);

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

    this.logger.log(`State saved for room with code: ${roomCode}`);
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
    this.logger.log(`Saving game load for room with code: ${roomCode}, gameId: ${gameId}, gameVersion: ${gameVersion}`);

    const room = await this.findRoomByCode(roomCode);

    if (!room) {
      this.logger.warn(`Room not found with code: ${roomCode}`);
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

    this.logger.log(`Game load saved for room with code: ${roomCode}`);
  }

  /**
   * Removes a room with the specified room code.
   * If the room is currently running, a BadRequestException is thrown.
   *
   * @param roomCode - The code of the room to be removed.
   * @throws BadRequestException - If the room is currently running.
   */
  async deleteRoom(roomCode: string) {
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
    this.logger.log(`Finding room with code: ${roomCode}`);
    const room = await this.prismaService.room.findFirst({
      where: {
        code: roomCode,
      },
    });
    if (room) {
      this.logger.log(`Room found with code: ${roomCode}`);
    } else {
      this.logger.warn(`Room not found with code: ${roomCode}`);
    }
    return room;
  }

  /**
   * Sets the specified room in the RoomsService.
   *
   * @param room - The room to be set.
   */
  static setRoom(room: SimulationRoom) {
    RoomsService.rooms.set(room.room.code, room);
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
