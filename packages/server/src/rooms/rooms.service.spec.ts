import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { PrismaService } from '../prisma.service';
import useDatabaseMock from '../../test/useDatabaseMock';
import useConfigServiceMock from '../../test/useConfigServiceMock';
import { AuthModule } from '../auth/auth.module';
import { RoomsModule } from './rooms.module';
import { RoomsService } from './rooms.service';
import { authMockAdmin } from '../../test/authMock';
import { PlaygroundStateUpdate, PlaygroundStateSave } from '@shared/index';
import { SimulationRoom } from './simulation-room';

describe('RoomsService', () => {
  let roomsService: RoomsService;
  let prismaService: PrismaService;
  const mockDB = useDatabaseMock();

  beforeAll(async () => {
    prismaService = mockDB();

    const configService = useConfigServiceMock();
    const module = await Test.createTestingModule({
      imports: [RoomsModule, AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();

    roomsService = module.get<RoomsService>(RoomsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(roomsService).toBeDefined();
  });

  describe('RoomProgressUpdate', () => {
    it('it should be created', async () => {
      const pgState: PlaygroundStateSave = {
        actorStates: [
          {
            name: 'Munchkin',
            guid: '1',
            transformation: {
              position: [0, 50, 0],
            },
            mass: 1,
            model: {
              meshURL: 'http://localhost:5500/munch.obj',
            },
          },
        ],
      };

      const pgStateUpdate: PlaygroundStateUpdate = {
        actorStates: [
          {
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
                content: JSON.stringify(pgState),
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

      await roomsService.saveRoomProgressUpdate('4dbab385-0a62-442c-a4b2-c22e8ae35cb7', pgStateUpdate);

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
      const pgState: PlaygroundStateSave = {
        actorStates: [
          {
            name: 'Munchkin',
            guid: '1',
            transformation: {
              position: [0, 50, 0],
            },
            mass: 1,
            model: {
              meshURL: 'http://localhost:5500/munch.obj',
            },
          },
        ],
      };

      const pgState2: PlaygroundStateSave = {
        actorStates: [
          {
            name: 'Munchkin',
            guid: '2',
            transformation: {
              position: [0, 50, 0],
            },
            mass: 1,
            model: {
              meshURL: 'http://localhost:5500/munch.obj',
            },
          },
        ],
      };

      const pgStateUpdate: PlaygroundStateUpdate = {
        actorStates: [
          {
            guid: '1',
            transformation: {
              position: [0, 100, 0],
            },
          },
        ],
      };

      const pgStateUpdate2: PlaygroundStateUpdate = {
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
                content: JSON.stringify(pgState),
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
                content: JSON.stringify(pgState2),
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
              content: JSON.stringify(pgStateUpdate),
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
              content: JSON.stringify(pgStateUpdate2),
            },
          },
        },
      });

      jest.spyOn(RoomsService.rooms, 'get').mockReturnValue({
        simulation: {
          toStateSave: () => pgState2,
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
        content: pgState2,
      });
    });
  });
});
