import type { INestApplication } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import type { User } from '@prisma/client';
import { useApp } from '@server/test/useApp';
import { CreateUserDto } from '@tt/dto';
import type { Server } from 'net';
import { useDatabaseMock } from '../../test/useDatabaseMock';
import type { PrismaService } from '../prisma/prisma.service';

describe('AuthModule', () => {
  useDatabaseMock();
  let prismaService: PrismaService;
  let app: INestApplication<Server>;

  beforeAll(async () => {
    [app, prismaService] = await useApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup', () => {
    it('should sign user up and return jwt', async () => {
      const reqBody: CreateUserDto = {
        email: 'email',
        username: 'username',
        password: 'password',
        avatarUrl: 'avatarUrl',
      };

      await request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send(reqBody)
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body).toMatchObject({ access_token: expect.any(String) as string }));

      const users = await prismaService.user.findMany();
      const expectedUser: Partial<User> = {
        userId: 1,
        email: 'email',
        username: 'username',
        passwordHash: expect.any(String) as string,
        avatarUrl: 'avatarUrl',
        deletedAt: null,
        roleId: 2,
      };

      expect(users.length).toBe(1);
      expect(users.at(0)).toMatchObject(expectedUser);
    });

    it('should not create user with same email', async () => {
      await prismaService.user.create({
        data: {
          email: 'email',
          username: 'username',
          passwordHash: 'passwordHash',
          avatarUrl: 'avatarUrl',
          roleId: 1,
        },
      });

      await request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send({
          email: 'email',
          username: 'username',
          password: 'password',
          avatarUrl: 'avatarUrl',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect(res => expect(res.body).toMatchObject({ message: 'Email already exists' }));
    });
  });

  describe('/auth/signin', () => {
    it('should sign user in', async () => {
      await request(app.getHttpServer()).post('/auth/signup').set('Accept', 'application/json').send({
        email: 'email',
        username: 'username',
        password: 'password',
        avatarUrl: 'avatarUrl',
      });

      await request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send({
          email: 'email',
          password: 'password',
        })
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body).toMatchObject({ access_token: expect.any(String) as string }));
    });

    it('should not sign unexisting user', async () => {
      await request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send({
          email: 'email',
          password: 'password',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect(res => expect(res.body).toMatchObject({ message: 'Wrong email or password' }));
    });

    it('should not sign user with wrong password', async () => {
      await request(app.getHttpServer()).post('/auth/signup').set('Accept', 'application/json').send({
        email: 'email',
        username: 'username',
        password: 'password',
        avatarUrl: 'avatarUrl',
      });

      await request(app.getHttpServer())
        .post('/auth/signin')
        .set('Accept', 'application/json')
        .send({
          email: 'email',
          password: 'wrongPassword',
        })
        .expect(HttpStatus.BAD_REQUEST)
        .expect(res => expect(res.body).toMatchObject({ message: 'Wrong email or password' }));
    });
  });
});
