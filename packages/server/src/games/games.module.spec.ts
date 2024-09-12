import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { useApp } from '@server/test/useApp';
import { useDatabaseMock } from '@server/test/useDatabaseMock';
import type { GamePreviewDto } from '@shared/dto/games';
import type { Server } from 'net';
import {
  authMockAdmin,
  authMockAdminToken,
  authMockGuest,
  authMockGuestToken,
  authMockUser,
  authMockUserToken,
} from '../../test/authMock';
import type { PrismaService } from '../prisma/prisma.service';

describe('GamesModule', () => {
  useDatabaseMock();
  let prismaService: PrismaService;
  let app: INestApplication<Server>;

  beforeAll(async () => {
    [app, prismaService] = await useApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /games', () => {
    it('should return game previews', async () => {
      await prismaService.user.create({
        data: authMockAdmin,
      });

      await prismaService.game.create({
        data: {
          gameId: 1,
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
                content: {},
              },
              {
                version: 2,
                content: {},
              },
            ],
          },
        },
      });

      await prismaService.game.create({
        data: {
          gameId: 2,
          name: 'name1',
          description: 'desc1',
          bannerUrl: 'url1',
          createdAt: new Date(),
          authorId: 0,
          deletedAt: null,
          GameVersion: {
            create: {
              version: 1,
              content: {},
            },
          },
        },
      });

      await prismaService.game.create({
        data: {
          gameId: 3,
          name: 'name1',
          description: 'desc1',
          bannerUrl: 'url1',
          createdAt: new Date(),
          authorId: 0,
          deletedAt: new Date('01-01-2000'),
          GameVersion: {
            create: {
              version: 1,
              content: {},
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .get('/games')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`);

      expect(response.status).toEqual(HttpStatus.OK);
      expect((response.body as any[]).length).toEqual(2);
      expect(response.body).toEqual([
        {
          authorId: 0,
          code: expect.any(String) as string,
          name: 'name',
          description: 'desc',
          bannerUrl: 'url',
        },
        {
          authorId: 0,
          code: expect.any(String) as string,
          name: 'name1',
          description: 'desc1',
          bannerUrl: 'url1',
        },
      ]);
    });

    it('should throw no auth', async () => {
      await request(app.getHttpServer())
        .get('/games')
        .set('Accept', 'application/json')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /games/:id', () => {
    it('should return game with content', async () => {
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
                content: {},
              },
              {
                version: 2,
                content: {},
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .get('/games/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .expect(HttpStatus.OK)
        .expect(res =>
          expect(res.body).toEqual({
            code: expect.any(String) as string,
            name: 'name',
            description: 'desc',
            bannerUrl: 'url',
            content: expect.stringContaining('{}') as string,
            version: 2,
            authorId: 0,
          }),
        );
    });

    it('should return not found', async () => {
      await prismaService.user.create({
        data: authMockAdmin,
      });

      await request(app.getHttpServer())
        .get('/games/4dbab385-0a62-442c-a4b2-c22e8ae35cbc')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /games/my', () => {
    it('should throw no auth', async () => {
      await request(app.getHttpServer())
        .get('/games/my')
        .set('Accept', 'application/json')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return user game previews', async () => {
      await prismaService.user.createMany({
        data: [
          authMockAdmin,
          {
            email: 'email1',
            username: 'username1',
            passwordHash: 'passwordHash1',
            roleId: 1,
          },
        ],
      });

      await prismaService.game.create({
        data: {
          gameId: 1,
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
                content: {},
              },
              {
                version: 2,
                content: {},
              },
            ],
          },
        },
      });

      await prismaService.game.create({
        data: {
          gameId: 2,
          name: 'name1',
          description: 'desc1',
          bannerUrl: 'url1',
          createdAt: new Date(),
          authorId: 1,
          deletedAt: new Date('01-01-2020'),
          GameVersion: {
            create: {
              version: 1,
              content: {},
            },
          },
        },
      });

      await request(app.getHttpServer())
        .get('/games/my')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .expect(HttpStatus.OK)
        .expect(res =>
          expect(res.body).toEqual([
            {
              authorId: 0,
              code: expect.any(String) as string,
              name: 'name',
              description: 'desc',
              bannerUrl: 'url',
            } satisfies GamePreviewDto,
          ]),
        );
    });
  });

  describe('GET /games/user/:code', () => {
    it('should throw no auth', async () => {
      await request(app.getHttpServer())
        .get('/games/user/username')
        .set('Accept', 'application/json')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return user game previews', async () => {
      await prismaService.user.createMany({
        data: [
          authMockAdmin,
          {
            email: 'email1',
            username: 'username1',
            passwordHash: 'passwordHash1',
            roleId: 1,
          },
        ],
      });

      await prismaService.game.create({
        data: {
          gameId: 1,
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
                content: {},
              },
              {
                version: 2,
                content: {},
              },
            ],
          },
        },
      });

      await prismaService.game.create({
        data: {
          gameId: 2,
          name: 'name1',
          description: 'desc1',
          bannerUrl: 'url1',
          createdAt: new Date(),
          authorId: 1,
          deletedAt: null,
          GameVersion: {
            create: {
              version: 1,
              content: {},
            },
          },
        },
      });

      await request(app.getHttpServer())
        .get(`/games/user/${authMockAdmin.code}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .expect(HttpStatus.OK)
        .expect(res =>
          expect(res.body).toEqual([
            {
              authorId: 0,
              code: expect.any(String) as string,
              name: 'name',
              description: 'desc',
              bannerUrl: 'url',
            } satisfies GamePreviewDto,
          ]),
        );
    });
  });

  describe('PUT /games/:id', () => {
    it('should throw no auth', async () => {
      await request(app.getHttpServer())
        .put('/games/1')
        .set('Accept', 'application/json')
        .send({
          name: 'name',
          description: 'desc',
          bannerUrl: 'url',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should update a game preview', async () => {
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
                content: {},
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .put('/games/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .send({
          name: 'name1',
          description: 'desc1',
          bannerUrl: 'url1',
        })
        .expect(HttpStatus.OK)
        .expect(res =>
          expect(res.body).toEqual({
            authorId: 0,
            code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
            name: 'name1',
            description: 'desc1',
            bannerUrl: 'url1',
          } satisfies GamePreviewDto),
        );

      const games = await prismaService.game.findMany({ include: { GameVersion: true } });
      expect(games.length).toBe(1);
      expect(games).toEqual([
        {
          gameId: 1,
          code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
          name: 'name1',
          description: 'desc1',
          bannerUrl: 'url1',
          authorId: 0,
          createdAt: expect.any(Date) as Date,
          deletedAt: null,
          GameVersion: [
            {
              gameId: 1,
              version: 1,
              content: {},
              createdAt: expect.any(Date) as Date,
            },
          ],
        },
      ]);
    });

    it('should update a game with content', async () => {
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
                content: {},
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .put('/games/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .send({
          name: 'name1',
          description: 'desc1',
          bannerUrl: 'url1',
          content: '{}',
        })
        .expect(HttpStatus.OK)
        .expect(res =>
          expect(res.body).toEqual({
            authorId: 0,
            code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
            name: 'name1',
            description: 'desc1',
            bannerUrl: 'url1',
          } satisfies GamePreviewDto),
        );

      const games = await prismaService.game.findMany({ include: { GameVersion: true } });
      expect(games.length).toBe(1);
      expect(games).toEqual([
        {
          gameId: 1,
          code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
          name: 'name1',
          description: 'desc1',
          bannerUrl: 'url1',
          authorId: 0,
          createdAt: expect.any(Date) as Date,
          deletedAt: null,
          GameVersion: [
            {
              gameId: 1,
              version: 1,
              content: {},
              createdAt: expect.any(Date) as Date,
            },
            {
              gameId: 1,
              version: 2,
              content: {},
              createdAt: expect.any(Date) as Date,
            },
          ],
        },
      ]);
    });

    it('should forbid updating a game preview - user', async () => {
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
                content: {},
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .put('/games/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockUserToken}`)
        .send({
          name: 'name1',
          description: 'desc1',
          bannerUrl: 'url1',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should forbid updating a game preview - guest', async () => {
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
                content: {},
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .put('/games/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockGuestToken}`)
        .send({
          name: 'name1',
          description: 'desc1',
          bannerUrl: 'url1',
        })
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('POST /games', () => {
    it('should throw no auth', async () => {
      await request(app.getHttpServer())
        .post('/games')
        .set('Accept', 'application/json')
        .send({
          name: 'name',
          description: 'desc',
          bannerUrl: 'url',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should create game', async () => {
      await prismaService.user.create({
        data: authMockAdmin,
      });

      await request(app.getHttpServer())
        .post('/games')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .send({
          name: 'name',
          description: 'desc',
          bannerUrl: 'url',
          content: '{}',
        })
        .expect(HttpStatus.CREATED)
        .expect(res =>
          expect(res.body).toEqual({
            authorId: 0,
            code: expect.any(String) as string,
            name: 'name',
            description: 'desc',
            bannerUrl: 'url',
          } satisfies GamePreviewDto),
        );

      const games = await prismaService.game.findMany({ include: { GameVersion: true } });
      expect(games.length).toBe(1);
      expect(games).toEqual([
        {
          gameId: 1,
          code: expect.any(String) as string,
          name: 'name',
          description: 'desc',
          bannerUrl: 'url',
          authorId: 0,
          createdAt: expect.any(Date) as Date,
          deletedAt: null,
          GameVersion: [
            {
              gameId: 1,
              version: 1,
              content: {},
              createdAt: expect.any(Date) as Date,
            },
          ],
        },
      ]);
    });
  });

  describe('DELETE /games/:id', () => {
    it('should throw no auth', async () => {
      await request(app.getHttpServer())
        .delete('/games/1')
        .set('Accept', 'application/json')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should soft delete game - admin', async () => {
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
                content: {},
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .delete('/games/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .expect(HttpStatus.OK);

      const games = await prismaService.game.findMany({ include: { GameVersion: true } });
      expect(games.length).toBe(0);

      const gamesIncludeDeleted = await prismaService.$queryRaw`SELECT * FROM "Game"`;
      expect((gamesIncludeDeleted as any[]).length).toBe(1);
      expect(gamesIncludeDeleted).toEqual([
        {
          gameId: 1,
          code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
          name: 'name',
          description: 'desc',
          bannerUrl: 'url',
          authorId: 0,
          createdAt: expect.any(Date) as Date,
          deletedAt: expect.any(Date) as Date,
        },
      ]);
    });

    it('should forbid game deletion - user', async () => {
      await prismaService.user.create({
        data: authMockAdmin,
      });

      await prismaService.user.create({
        data: authMockUser,
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
                content: {},
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .delete('/games/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockUserToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow game deletion - user (owner)', async () => {
      await prismaService.user.create({
        data: authMockUser,
      });

      await prismaService.game.create({
        data: {
          gameId: 1,
          code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
          name: 'name',
          description: 'desc',
          bannerUrl: 'url',
          createdAt: new Date(),
          authorId: 1,
          deletedAt: null,
          GameVersion: {
            create: [
              {
                content: {},
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .delete('/games/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockUserToken}`)
        .expect(HttpStatus.OK);

      const games = await prismaService.game.findMany({ include: { GameVersion: true } });
      expect(games.length).toBe(0);
    });

    it('should forbid game deletion - guest', async () => {
      await prismaService.user.create({
        data: authMockAdmin,
      });

      await prismaService.user.create({
        data: authMockGuest,
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
                content: {},
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .delete('/games/4dbab385-0a62-442c-a4b2-c22e8ae35cb7')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockGuestToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
