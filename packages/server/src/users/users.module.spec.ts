import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import request from 'supertest';

import { useApp } from '@server/test/useApp';
import { useDatabaseMock } from '@server/test/useDatabaseMock';
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

describe('UsersModule', () => {
  useDatabaseMock();
  let prismaService: PrismaService;
  let app: INestApplication<Server>;

  beforeAll(async () => {
    [app, prismaService] = await useApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('PUT /users', () => {
    it('should update user', async () => {
      vi.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('newPasswordHash'));

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
        .expect(res => expect(res.body).toMatchObject({ access_token: expect.any(String) as string }));

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
