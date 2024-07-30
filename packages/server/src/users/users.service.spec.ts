import { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

import configServiceMock from '../../test/configServiceMock';
import { PrismaService } from '../prisma.service';

const user: User = {
  userId: 1,
  code: '6b23c425-1bbb-4f0e-adba-8db0ddd56f27',
  email: 'email',
  username: 'username',
  passwordHash: 'passwordHash',
  avatarUrl: 'avatarUrl',
  deletedAt: null,
  roleId: 2,
};

const usersArray: User[] = [user];

const db = {
  user: {
    findMany: vi.fn().mockResolvedValue(usersArray),
    findUnique: vi.fn().mockResolvedValue(user),
    findFirst: vi.fn().mockResolvedValue(user),
    create: vi.fn().mockResolvedValue(user),
    update: vi.fn().mockResolvedValue(user),
    delete: vi.fn().mockResolvedValue(user),
  },
};

describe('AuthService', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: db,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      vi.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('passwordHash'));
      db.user.findUnique.mockResolvedValueOnce(null);

      await usersService.create({
        email: 'email',
        username: 'username',
        password: 'password',
        avatarUrl: 'avatarUrl',
      });

      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          email: 'email',
          username: 'username',
          passwordHash: 'passwordHash',
          avatarUrl: 'avatarUrl',
          roleId: 2,
        },
      });
    });

    it('should throw as email exists', async () => {
      vi.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('passwordHash'));

      await expect(
        usersService.create({
          email: 'email',
          username: 'username',
          password: 'password',
          avatarUrl: 'avatarUrl',
        }),
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      vi.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('passwordHash'));
      await usersService.update(1, {
        username: 'username',
        avatarUrl: 'avatarUrl',
        password: 'password',
      });

      expect(db.user.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: {
          username: 'username',
          avatarUrl: 'avatarUrl',
          passwordHash: 'passwordHash',
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      await usersService.delete(1);

      expect(db.user.delete).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });
});
