import request from 'supertest';
import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import useDatabaseMock from '../../test/useDatabaseMock';
import useConfigServiceMock from '../../test/useConfigServiceMock';
import { mainConfig } from '../main.config';
import { AuthModule } from '../auth/auth.module';
import { RoomsModule } from './rooms.module';
import { authMockAdmin, authMockAdminToken } from '../../test/authMock';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from '@shared/dto/rooms/create-room.dto';

describe('Rooms', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prismaService: PrismaService;
  const mockDB = useDatabaseMock();

  beforeAll(async () => {
    prismaService = mockDB();

    const configService = useConfigServiceMock();
    module = await Test.createTestingModule({
      imports: [RoomsModule, AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();

    app = module.createNestApplication({});
    mainConfig(app);

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /rooms', () => {
    it('should create a room', async () => {
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
                content: '{}',
              },
            ],
          },
        },
      });

      const startSimulationMock = jest.spyOn(RoomsService.prototype, 'startRoomSimulation').mockReturnValue('code');
      const dto: CreateRoomDto = {
        gameCode: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
      };

      const response = await request(app.getHttpServer())
        .post('/rooms')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .send(dto);
      expect(response.status).toBe(HttpStatus.CREATED);

      expect(startSimulationMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /rooms/:code', () => {
    it('should return user rooms', async () => {
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
                content: '{}',
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
          {
            roomId: 2,
            code: '5dbab385-0a62-442c-a4b2-c22e8ae35cb7',
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
          {
            seatId: 1,
            userId: authMockAdmin.userId,
            roomId: 2,
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get(`/rooms/${authMockAdmin.code}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.OK);
    });
  });

  describe('POST /rooms/start/:code', () => {
    it('should start a room', async () => {
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
                content: '{"test": "zxc"}',
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

      const startSimulationMock = jest.spyOn(RoomsService.prototype, 'startRoomSimulation').mockReturnValue('code');
      const response = await request(app.getHttpServer())
        .post('/rooms/start/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(startSimulationMock).toHaveBeenCalledTimes(1);
    });

    it('should not find a room', async () => {
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
                content: '{"test": "zxc"}',
              },
            ],
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post('/rooms/start/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({ message: 'Room not found' });
      const startSimulationMock = jest.spyOn(RoomsService.prototype, 'startRoomSimulation').mockReturnValue('code');
      expect(startSimulationMock).toHaveBeenCalledTimes(0);
    });

    it('should not find a room progress', async () => {
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
                content: '{"test": "zxc"}',
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

      const startSimulationMock = jest.spyOn(RoomsService.prototype, 'startRoomSimulation').mockReturnValue('code');
      const response = await request(app.getHttpServer())
        .post('/rooms/start/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({ message: 'Room progress not found' });
      expect(startSimulationMock).toHaveBeenCalledTimes(0);
    });
  });
});
