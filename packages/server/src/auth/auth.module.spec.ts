import * as request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import useDatabaseMock from '../../test/useDatabaseMock';
import { AuthModule } from './auth.module';
import useConfigServiceMock from '../../test/useConfigServiceMock';

describe('AuthModule', () => {
  let app: INestApplication;
  let module: TestingModule;
  let prismaService: PrismaService;
  const mockDB = useDatabaseMock();

  beforeAll(async () => {
    prismaService = mockDB();

    const configService = useConfigServiceMock();
    module = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();

    app = module.createNestApplication({});
    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('/auth/signup', () => {
    it('should sign user up', async () => {
      await request(app.getHttpServer())
        .post('/auth/signup')
        .set('Accept', 'application/json')
        .send({
          email: 'email',
          username: 'username',
          password: 'password',
          avatarUrl: 'avatarUrl',
        })
        .expect(HttpStatus.CREATED)
        .expect(res => expect(res.body).toMatchObject({ access_token: expect.any(String) as string }));

      const users = await prismaService.user.findMany();
      expect(users.length).toBe(1);
      expect(users[0].userId).toBe(1);
      expect(users[0].email).toBe('email');
      expect(users[0].username).toBe('username');
      expect(users[0].passwordHash).toBeDefined();
      expect(users[0].avatarUrl).toBe('avatarUrl');
    });

    it('should not create user with same email', async () => {
      await prismaService.user.create({
        data: {
          email: 'email',
          username: 'username',
          passwordHash: 'passwordHash',
          avatarUrl: 'avatarUrl',
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
        .expect(HttpStatus.CREATED) // @TODO replace with HttpStatus.OK
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
        .expect(HttpStatus.BAD_REQUEST) // @TODO replace with HttpStatus.OK
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
        .expect(HttpStatus.BAD_REQUEST) // @TODO replace with HttpStatus.OK
        .expect(res => expect(res.body).toMatchObject({ message: 'Wrong email or password' }));
    });
  });
});
