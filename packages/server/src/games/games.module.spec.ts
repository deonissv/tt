import * as request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import useDatabaseMock from '../../test/useDatabaseMock';
import useConfigServiceMock from '../../test/useConfigServiceMock';
import { GamesModule } from './games.module';
import { mainConfig } from '../main.config';
import { AuthModule } from '../auth/auth.module';
import { authMockAdminToken, authMockAdmin, authMockUser, authMockUserToken } from '../../test/authMock';

describe('GamesModule', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prismaService: PrismaService;
  const mockDB = useDatabaseMock();

  beforeAll(async () => {
    prismaService = mockDB();

    const configService = useConfigServiceMock();
    module = await Test.createTestingModule({
      imports: [GamesModule, AuthModule],
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

  it('should be defined', () => {
    expect(app).toBeDefined();
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
                content: '{}',
              },
              {
                version: 2,
                content: '{}',
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
              content: '{}',
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
              content: '{}',
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
          code: expect.any(String) as string,
          name: 'name',
          description: 'desc',
          bannerUrl: 'url',
        },
        {
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
              {
                version: 2,
                content: '{}',
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .get('/games/1')
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
          }),
        );
    });

    it('should throw bad request in id is not a number', async () => {
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
                content: '{}',
              },
              {
                version: 2,
                content: '{}',
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .get('/games/asd')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return not found', async () => {
      await prismaService.user.create({
        data: authMockAdmin,
      });

      await request(app.getHttpServer())
        .get('/games/1')
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
                content: '{}',
              },
              {
                version: 2,
                content: '{}',
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
              content: '{}',
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
              code: expect.any(String) as string,
              name: 'name',
              description: 'desc',
              bannerUrl: 'url',
            },
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
                content: '{}',
              },
              {
                version: 2,
                content: '{}',
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
              content: '{}',
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
              code: expect.any(String) as string,
              name: 'name',
              description: 'desc',
              bannerUrl: 'url',
            },
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
                content: '{}',
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
            code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
            name: 'name1',
            description: 'desc1',
            bannerUrl: 'url1',
          }),
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
              content: '{}',
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
                content: '{}',
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
            code: '4dbab385-0a62-442c-a4b2-c22e8ae35cb7',
            name: 'name1',
            description: 'desc1',
            bannerUrl: 'url1',
          }),
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
              content: '{}',
              createdAt: expect.any(Date) as Date,
            },
            {
              gameId: 1,
              version: 2,
              content: '{}',
              createdAt: expect.any(Date) as Date,
            },
          ],
        },
      ]);
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
            code: expect.any(String) as string,
            name: 'name',
            description: 'desc',
            bannerUrl: 'url',
          }),
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
              content: '{}',
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
                content: '{}',
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
                content: '{}',
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

    it('should allow game deletion - user', async () => {
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
                content: '{}',
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
  });
});
