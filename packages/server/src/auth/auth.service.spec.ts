import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { Mock } from 'vitest';

import { TokenService } from '../token/token.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

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

const logSpy = (service: AuthService) => {
  const logger = (service as unknown as { logger: { log: Mock } }).logger;
  return vi.spyOn(logger, 'log');
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersServiceMock: { findOneByEmail: Mock; create: Mock };
  let tokenServiceMock: { generateToken: Mock };

  beforeEach(async () => {
    usersServiceMock = {
      findOneByEmail: vi.fn().mockResolvedValue(user),
      create: vi.fn().mockResolvedValue(user),
    };
    tokenServiceMock = {
      generateToken: vi.fn().mockReturnValue({ access_token: 'token' }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: TokenService, useValue: tokenServiceMock },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signin', () => {
    it('validates the credentials and returns an access token', async () => {
      const compareMock = vi.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      const logger = logSpy(authService);

      const token = await authService.signin({ email: 'email', password: 'password' });

      expect(token).toEqual({ access_token: 'token' });
      expect(usersServiceMock.findOneByEmail).toHaveBeenCalledWith('email');
      expect(compareMock).toHaveBeenCalledWith('password', 'passwordHash');
      expect(logger).toHaveBeenCalledWith(expect.stringContaining('Signing in user with email: email'));
      expect(logger).toHaveBeenCalledWith(expect.stringContaining('successfully signed in'));
    });

    it('rejects wrong credentials', async () => {
      usersServiceMock.findOneByEmail.mockResolvedValueOnce(null);

      await expect(authService.signin({ email: 'email', password: 'password' })).rejects.toThrow(
        'Wrong email or password',
      );
    });
  });

  describe('validateUser', () => {
    it('should return a user', async () => {
      const compareMock = vi.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      const logger = logSpy(authService);

      const result = await authService.validateUser('email', 'password');

      expect(result).toEqual(user);
      expect(usersServiceMock.findOneByEmail).toHaveBeenCalledWith('email');
      expect(compareMock).toHaveBeenCalledWith('password', 'passwordHash');
      expect(logger).toHaveBeenCalledWith(expect.stringContaining('Validating user with email: email'));
      expect(logger).toHaveBeenCalledWith(expect.stringContaining('successfully validated'));
    });

    it('should throw an error if user not found', async () => {
      usersServiceMock.findOneByEmail.mockResolvedValueOnce(null);
      const logger = logSpy(authService);

      await expect(authService.validateUser('email', 'password')).rejects.toThrow('Wrong email or password');
      expect(logger).toHaveBeenCalledWith(expect.stringContaining('Invalid email or password'));
    });

    it('should throw an error if password is wrong', async () => {
      vi.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));
      await expect(authService.validateUser('email', 'password')).rejects.toThrow('Wrong email or password');
    });
  });

  describe('signup', () => {
    it('should return an access token', async () => {
      const dto = { email: 'email', username: 'username', password: 'password', avatarUrl: 'avatarUrl' };
      const logger = logSpy(authService);

      const token = await authService.signup(dto);

      expect(token).toEqual({ access_token: 'token' });
      expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
      expect(tokenServiceMock.generateToken).toHaveBeenCalledWith(user);
      expect(logger).toHaveBeenCalledWith(expect.stringContaining('Creating new user account for email'));
      expect(logger).toHaveBeenCalledWith(expect.stringContaining('created for email'));
    });

    it('should throw if user exists', async () => {
      usersServiceMock.create.mockRejectedValueOnce(new BadRequestException('Email already exists'));

      await expect(
        authService.signup({
          email: 'email1',
          username: 'username',
          password: 'password',
          avatarUrl: 'avatarUrl',
        }),
      ).rejects.toThrowError('Email already exists');
    });
  });
});
