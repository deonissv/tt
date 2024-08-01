import type { INestApplication } from '@nestjs/common';
import { useApp } from '@server/test/useApp';
import { useDatabaseMock } from '@server/test/useDatabaseMock';
import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/states';
import type { Server } from 'net';
import { authMockAdmin } from '../../test/authMock';
import type { PrismaService } from '../prisma.service';
import { RoomsService } from './rooms.service';
import type { SimulationRoom } from './simulation-room';

describe('RoomsService', () => {
  useDatabaseMock();
  let prismaService: PrismaService;
  let app: INestApplication<Server>;
  let roomsService: RoomsService;

  beforeAll(async () => {
    [app, prismaService] = await useApp();
    roomsService = app.get<RoomsService>(RoomsService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(roomsService).toBeDefined();
  });

  describe('RoomProgressUpdate', () => {
    it('it should be created', async () => {
      const simState: SimulationStateSave = {
        actorStates: [
          {
            type: 0,
            name: 'Munchkin',
            guid: '1',
            transformation: {
              position: [0, 50, 0],
            },
            mass: 1,
            // model: {
            //   meshURL: 'http://localhost:5500/munch.obj',
            // },
          },
        ],
      };

      const simStateUpdate: SimulationStateUpdate = {
        actorStates: [
          {
            type: 0,
            guid: '1',
            transformation: {
              position: [0, 100, 0],
            },
          },
        ],
      };

      await prismaService.user.create({
        data: authMockAdmin,
      });

      await prismaService.game.create({
        data: {
          gameId: 1,
          code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
          name: 'name',
          description: 'desc',
          bannerUrl: 'url',
          createdAt: new Date(),
          authorId: 0,
          deletedAt: null,
          GameVersion: {
            create: [
              {
                version: 1,
                content: JSON.stringify(simState),
              },
            ],
          },
        },
      });

      await prismaService.room.createMany({
        data: [
          {
            roomId: 1,
            code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
            authorId: 0,
            type: 1,
          },
        ],
      });

      await prismaService.roomUser.createMany({
        data: [
          {
            seatId: 1,
            userId: authMockAdmin.userId,
            roomId: 1,
          },
        ],
      });

      await prismaService.roomProgress.create({
        data: {
          roomId: 1,
          RoomProgressGameLoad: {
            create: {
              gameId: 1,
              gameVersion: 1,
            },
          },
        },
      });

      await roomsService.saveRoomProgressUpdate('4dbab385-0a62-442c-a4b2-c22e8ae35cb7', simStateUpdate);

      const roomProgressUpdate = await prismaService.roomProgressUpdate.findFirst({
        where: {
          roomId: 1,
        },
        orderBy: {
          order: 'desc',
        },
      });

      expect(roomProgressUpdate).toMatchObject({
        order: 2,
        roomId: 1,
        content: {
          actorStates: [
            {
              guid: '1',
              transformation: {
                position: [0, 100, 0],
              },
            },
          ],
        },
      });
    });
  });

  describe('RoomProgressSave', () => {
    it('it should be created', async () => {
      const simState: SimulationStateSave = {
        actorStates: [
          {
            type: 0,
            name: 'Munchkin',
            guid: '1',
            transformation: {
              position: [0, 50, 0],
            },
            mass: 1,
            // model: {
            //   meshURL: 'http://localhost:5500/munch.obj',
            // },
          },
        ],
      };

      const simState2: SimulationStateSave = {
        actorStates: [
          {
            type: 0,
            name: 'Munchkin',
            guid: '2',
            transformation: {
              position: [0, 50, 0],
            },
            mass: 1,
            // model: {
            //   meshURL: 'http://localhost:5500/munch.obj',
            // },
          },
        ],
      };

      const simStateUpdate: SimulationStateUpdate = {
        actorStates: [
          {
            guid: '1',
            transformation: {
              position: [0, 100, 0],
            },
          },
        ],
      };

      const simStateUpdate2: SimulationStateUpdate = {
        actorStates: [
          {
            guid: '2',
            transformation: {
              position: [0, 100, 0],
            },
          },
        ],
      };

      await prismaService.user.create({
        data: authMockAdmin,
      });

      await prismaService.game.create({
        data: {
          gameId: 1,
          code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
          name: 'name',
          description: 'desc',
          bannerUrl: 'url',
          createdAt: new Date(),
          authorId: 0,
          deletedAt: null,
          GameVersion: {
            create: [
              {
                version: 1,
                content: JSON.stringify(simState),
              },
            ],
          },
        },
      });

      await prismaService.game.create({
        data: {
          gameId: 2,
          code: '5dbab385-0a62-442c-a4b2-c22e8ae35cb7',
          name: 'name',
          description: 'desc',
          bannerUrl: 'url',
          createdAt: new Date(),
          authorId: 0,
          deletedAt: null,
          GameVersion: {
            create: [
              {
                version: 1,
                content: JSON.stringify(simState2),
              },
            ],
          },
        },
      });

      await prismaService.room.create({
        data: {
          roomId: 1,
          code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
          authorId: 0,
          type: 1,
        },
      });

      await prismaService.roomUser.create({
        data: {
          seatId: 1,
          userId: authMockAdmin.userId,
          roomId: 1,
        },
      });

      await prismaService.roomProgress.create({
        data: {
          roomId: 1,
          RoomProgressGameLoad: {
            create: {
              gameId: 1,
              gameVersion: 1,
            },
          },
        },
      });

      await prismaService.roomProgress.create({
        data: {
          roomId: 1,
          RoomProgressUpdate: {
            create: {
              content: JSON.stringify(simStateUpdate),
            },
          },
        },
      });

      await prismaService.roomProgress.create({
        data: {
          roomId: 1,
          RoomProgressGameLoad: {
            create: {
              gameId: 2,
              gameVersion: 1,
            },
          },
        },
      });

      await prismaService.roomProgress.create({
        data: {
          roomId: 1,
          RoomProgressUpdate: {
            create: {
              content: JSON.stringify(simStateUpdate2),
            },
          },
        },
      });

      vi.spyOn(RoomsService.rooms, 'get').mockReturnValue({
        simulation: {
          toState: () => simState2,
        },
      } as SimulationRoom);

      await roomsService.saveRoomState('4dbab385-0a62-442c-a4b2-c22e8ae35cb7');

      const roomProgressSave = await prismaService.roomProgressSave.findFirst({
        where: {
          roomId: 1,
        },
        orderBy: {
          order: 'desc',
        },
      });

      expect(roomProgressSave).toMatchObject({
        order: 5,
        roomId: 1,
        content: simState2,
      });
    });
  });
});
