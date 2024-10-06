import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import type { Room } from '@prisma/client';
import { useApp } from '@server/test/useApp';
import { useDatabaseMock } from '@server/test/useDatabaseMock';
import type { SimulationStateSave } from '@tt/states';
import type { CreateRoomDto, RoomwDto } from '@tt/dto';
import type { Server } from 'net';
import request from 'supertest';
import type { MockInstance } from 'vitest';
import { authMockAdmin, authMockAdminToken, authMockUserToken } from '../../test/authMock';
import type { PrismaService } from '../prisma/prisma.service';
import { RoomsService } from './rooms.service';

describe('Rooms', () => {
  useDatabaseMock();
  let prismaService: PrismaService;
  let app: INestApplication<Server>;
  let startSimulationMock: MockInstance<
    (roomTable: Room, simSave?: SimulationStateSave, gameId?: number, gameVersion?: number) => string
  >;

  beforeAll(async () => {
    [app, prismaService] = await useApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    startSimulationMock = vi.spyOn(RoomsService.prototype, 'startSimulationRoom').mockReturnValue('code');
  });

  async function setupTestData() {
    await prismaService.user.create({ data: authMockAdmin });
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
          create: [{ version: 1, content: '{}' }],
        },
      },
    });
  }

  describe('POST /rooms', () => {
    it('should create a room', async () => {
      await setupTestData();

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

    it('should return 400 if game does not exist', async () => {
      const dto: CreateRoomDto = { gameCode: 'nonexistent' };

      const response = await request(app.getHttpServer())
        .post('/rooms')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .send(dto);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({ message: 'Game not found' });
    });
  });

  describe('GET /rooms/user/:code', () => {
    it('should return user rooms', async () => {
      await setupTestData();

      await prismaService.room.createMany({
        data: [
          { roomId: 1, code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7', authorId: 0, type: 1 },
          { roomId: 2, code: '5dbab385-0a62-442c-a4b2-c22e8ae35cb7', authorId: 0, type: 1 },
        ],
      });

      await prismaService.roomUser.createMany({
        data: [
          { seatId: 1, userId: authMockAdmin.userId, roomId: 1 },
          { seatId: 1, userId: authMockAdmin.userId, roomId: 2 },
        ],
      });

      await Promise.all(
        [1, 2].map(roomId =>
          prismaService.roomProgress.create({
            data: {
              roomId,
              RoomProgressGameLoad: {
                create: { gameId: 1, gameVersion: 1 },
              },
            },
          }),
        ),
      );

      const response = await request(app.getHttpServer())
        .get(`/rooms/user/${authMockAdmin.code}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.OK);
    });

    it('should return 400 if user does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/rooms/user/nonexistent')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({ message: 'User not found' });
    });
  });

  describe('POST /rooms/start/:code', () => {
    it('should start a room', async () => {
      await setupTestData();

      await prismaService.room.create({
        data: {
          roomId: 1,
          code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
          authorId: 0,
          type: 1,
          RoomUsers: {
            create: {
              seatId: 1,
              userId: authMockAdmin.userId,
            },
          },
          RoomProgress: {
            create: {
              RoomProgressGameLoad: {
                create: {
                  gameId: 1,
                  gameVersion: 1,
                },
              },
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post('/rooms/start/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(startSimulationMock).toHaveBeenCalledTimes(1);
    });

    it('should not find a room', async () => {
      await setupTestData();

      const response = await request(app.getHttpServer())
        .post('/rooms/start/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({ message: 'Room not found' });
      expect(startSimulationMock).not.toHaveBeenCalled();
    });

    it('should not find a room progress', async () => {
      await setupTestData();

      await prismaService.room.create({
        data: {
          roomId: 1,
          code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
          authorId: 0,
          type: 1,
          RoomUsers: {
            create: {
              seatId: 1,
              userId: authMockAdmin.userId,
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post('/rooms/start/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({ message: 'Room progress not found' });
      expect(startSimulationMock).not.toHaveBeenCalled();
    });

    it('should handle room with no initial state', async () => {
      await setupTestData();

      const room = await prismaService.room.create({
        data: {
          authorId: authMockAdmin.userId,
          type: 1,
          code: '00000000-0a62-442c-a4b2-c22e8ae35cb7',
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/rooms/start/${room.code}`)
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({ message: 'Room progress not found' });
    });
  });

  describe('DELETE /rooms/:code', () => {
    it('should delete a room', async () => {
      const user = await prismaService.user.create({ data: authMockAdmin });
      const room = await prismaService.room.create({
        data: {
          authorId: user.userId,
          type: 1,
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/rooms/${room.code}`)
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.OK);

      const deletedRoom = await prismaService.room.findFirst({
        where: { code: room.code },
      });
      expect(deletedRoom).toBeNull();
    });

    it('should return 404 if room does not exist', async () => {
      const response = await request(app.getHttpServer())
        .delete('/rooms/nonexistent')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body).toMatchObject({ message: 'Room not found' });
    });

    it('should return 403 if user does not have permission to delete the room', async () => {
      const owner = await prismaService.user.create({ data: { ...authMockAdmin, userId: 2 } });
      const room = await prismaService.room.create({
        data: {
          authorId: owner.userId,
          type: 1,
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/rooms/${room.code}`)
        .set('Authorization', `Bearer ${authMockUserToken}`);

      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body).toMatchObject({ message: 'Cannot delete the room' });
    });
  });

  describe('GET /rooms/:code', () => {
    it('should get a room', async () => {
      const user = await prismaService.user.create({ data: authMockAdmin });
      const room = await prismaService.room.create({
        data: {
          authorId: user.userId,
          type: 1,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/rooms/${room.code}`)
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toMatchObject({
        authorId: user.userId,
      });
      expect((response.body as RoomwDto).code).toBeTypeOf('string');
    });

    it('should return 400 if room does not exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/rooms/nonexistent')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toMatchObject({ message: 'Room not found' });
    });
  });
});
