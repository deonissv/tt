import request from 'supertest';
import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersModule } from './users.module';

import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';
import useDatabaseMock from '../../test/useDatabaseMock';
import useConfigServiceMock from '../../test/useConfigServiceMock';
import {
  authMockAdmin,
  authMockAdminToken,
  authMockGuest,
  authMockGuestToken,
  authMockUser,
  authMockUserToken,
} from '../../test/authMock';
import { mainConfig } from '../main.config';

describe('UsersModule', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prismaService: PrismaService;
  const mockDB = useDatabaseMock();

  beforeAll(async () => {
    prismaService = mockDB();

    const configService = useConfigServiceMock();
    module = await Test.createTestingModule({
      imports: [UsersModule, AuthModule],
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

  describe('PUT /users', () => {
    it('should update user', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('newPasswordHash'));

      await prismaService.user.create({
        data: authMockAdmin,
      });

      await request(app.getHttpServer())
        .put(`/users/${authMockAdmin.code}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .send({
          username: 'newUsername',
          avatarUrl: 'newAvatarUrl',
          password: 'password',
        })
        .expect(HttpStatus.OK)
        .expect(res => expect(res.body).toMatchObject({ username: 'newUsername', avatarUrl: 'newAvatarUrl' }));

      const users = await prismaService.user.findMany();
      expect(users.length).toBe(1);
      expect(users[0].userId).toBe(0);
      expect(users[0].username).toBe('newUsername');
      expect(users[0].avatarUrl).toBe('newAvatarUrl');
      expect(users[0].passwordHash).toBe('newPasswordHash');
    });

    it('should forbid updating user - user', async () => {
      await prismaService.user.create({
        data: authMockAdmin,
      });

      await prismaService.user.create({
        data: authMockUser,
      });

      await request(app.getHttpServer())
        .put(`/users/${authMockAdmin.code}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockUserToken}`)
        .send({
          username: 'newUsername',
          avatarUrl: 'newAvatarUrl',
          password: 'password',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow updating user - user (self)', async () => {
      await prismaService.user.create({
        data: authMockUser,
      });

      await request(app.getHttpServer())
        .put(`/users/${authMockUser.code}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockUserToken}`)
        .send({
          username: 'newUsername',
          avatarUrl: 'newAvatarUrl',
          password: 'password',
        })
        .expect(HttpStatus.OK);
    });

    it('should forbid updating user - guest', async () => {
      await prismaService.user.create({
        data: authMockAdmin,
      });

      await prismaService.user.create({
        data: authMockGuest,
      });

      await request(app.getHttpServer())
        .put(`/users/${authMockAdmin.code}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockGuestToken}`)
        .send({
          username: 'newUsername',
          avatarUrl: 'newAvatarUrl',
          password: 'password',
        })
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('DELETE /users', () => {
    it('should delete user', async () => {
      await prismaService.user.create({
        data: authMockAdmin,
      });

      await request(app.getHttpServer())
        .delete(`/users/${authMockAdmin.code}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockAdminToken}`)
        .expect(HttpStatus.OK);

      const users = await prismaService.user.findMany();
      expect(users.length).toBe(0);
    });

    it('should forbid deleting user - user', async () => {
      await prismaService.user.create({
        data: authMockAdmin,
      });

      await prismaService.user.create({
        data: authMockUser,
      });

      await request(app.getHttpServer())
        .delete(`/users/${authMockAdmin.code}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockUserToken}`)
        .send({
          username: 'newUsername',
          avatarUrl: 'newAvatarUrl',
          password: 'password',
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should allow deleting user - user (self)', async () => {
      await prismaService.user.create({
        data: authMockUser,
      });

      await request(app.getHttpServer())
        .delete(`/users/${authMockUser.code}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockUserToken}`)
        .send({
          username: 'newUsername',
          avatarUrl: 'newAvatarUrl',
          password: 'password',
        })
        .expect(HttpStatus.OK);
    });

    it('should forbid deleting user - guest', async () => {
      await prismaService.user.create({
        data: authMockAdmin,
      });

      await prismaService.user.create({
        data: authMockGuest,
      });

      await request(app.getHttpServer())
        .delete(`/users/${authMockAdmin.code}`)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${authMockGuestToken}`)
        .send({
          username: 'newUsername',
          avatarUrl: 'newAvatarUrl',
          password: 'password',
        })
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
