import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import type { JWTPayload } from '@shared/dto/auth';

const jwtService = new JwtService({
  secret: 'secret',
  signOptions: { expiresIn: '1d' },
});

const signToken = (user: User): string => {
  const payload: JWTPayload = {
    username: user.username,
    email: user.email,
    avatar_url: user.avatarUrl,
    code: user.code,
    sub: user.userId,
    role: user.roleId,
  };
  return jwtService.sign(payload);
};

export const authMockAdmin: User = {
  userId: 0,
  code: '6b23c425-1bbb-4f0e-adba-8db0ddd56f27',
  username: 'username',
  email: 'email',
  passwordHash: 'passwordHash',
  avatarUrl: 'avatarUrl',
  deletedAt: null,
  roleId: 1,
};

export const authMockUser: User = {
  userId: 1,
  code: 'aa23c425-1bbb-4f0e-adba-8db0ddd56f27',
  username: 'userrname',
  email: 'emmail',
  passwordHash: 'passwordHash',
  avatarUrl: 'avatarUrl',
  deletedAt: null,
  roleId: 2,
};

export const authMockGuest: User = {
  userId: 2,
  code: 'acd3c425-1bbb-4f0e-adba-8db0ddd56f27',
  username: 'userrname',
  email: 'emmail',
  passwordHash: 'passwordHash',
  avatarUrl: 'avatarUrl',
  deletedAt: null,
  roleId: 2,
};

export const authMockAdminToken = signToken(authMockAdmin);
export const authMockUserToken = signToken(authMockUser);
export const authMockGuestToken = signToken(authMockGuest);
