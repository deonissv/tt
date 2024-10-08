import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { configServiceMock } from '../../test/configServiceMock';
import type { PrismaService } from '../prisma/prisma.service';
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

const usersArray: User[] = [user];
const useDb = () => ({
  user: {
    findMany: vi.fn().mockResolvedValue(usersArray),
    findUnique: vi.fn().mockResolvedValue(user),
    findFirst: vi.fn().mockResolvedValue(user),
    create: vi.fn().mockResolvedValue(user),
    update: vi.fn().mockResolvedValue(user),
    delete: vi.fn().mockResolvedValue(user),
  },
});

describe('AuthService', () => {
  let authService: AuthService;
  let db = useDb();

  beforeEach(() => {
    db = useDb();
    const jwtService = new JwtService({
      secret: 'secret',
      signOptions: { expiresIn: '7d' },
    });
    authService = new AuthService(new UsersService(db as unknown as PrismaService, configServiceMock), jwtService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('generateToken', () => {
    it('should return a token', () => {
      const signMock = vi.spyOn(JwtService.prototype, 'sign').mockReturnValue('token');

      const token = authService.generateToken(user);

      expect(token).toBeDefined();
      expect(token.access_token).toBeDefined();
      expect(signMock).toHaveBeenCalledWith({
        email: 'email',
        sub: 1,
        username: 'username',
        avatar_url: 'avatarUrl',
        code: '6b23c425-1bbb-4f0e-adba-8db0ddd56f27',
        role: 2,
      });
    });
  });

  describe('validateUser', () => {
    it('should return a user', async () => {
      const compareMock = vi.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const user = await authService.validateUser('email', 'password');
      expect(user).toBeDefined();
      expect(user).toEqual(user);

      expect(compareMock).toHaveBeenCalledTimes(1);
      expect(compareMock).toHaveBeenCalledWith('password', 'passwordHash');
    });

    it('should throw an error if user not found', async () => {
      db.user.findFirst.mockResolvedValueOnce(null);
      await expect(authService.validateUser('email', 'password')).rejects.toThrow('Wrong email or password');
    });

    it('should throw an error if password is wrong', async () => {
      await expect(authService.validateUser('email', 'password')).rejects.toThrow('Wrong email or password');
    });
  });

  describe('signup', () => {
    it('should return an access token', async () => {
      vi.spyOn(UsersService.prototype, 'emailExists').mockResolvedValue(false);
      const signMock = vi.spyOn(JwtService.prototype, 'sign').mockReturnValue('token');

      const token = await authService.signup({
        email: 'email',
        username: 'username',
        password: 'password',
        avatarUrl: 'avatarUrl',
      });

      expect(token).toMatchObject({ access_token: 'token' });
      expect(signMock).toHaveBeenCalledWith({
        email: 'email',
        sub: 1,
        username: 'username',
        avatar_url: 'avatarUrl',
        code: '6b23c425-1bbb-4f0e-adba-8db0ddd56f27',
        role: 2,
      });
    });

    it('should throw if user exists', async () => {
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
