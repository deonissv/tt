import { User } from '@prisma/client';

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

export const authMockAdminToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiZW1haWwiOiJlbWFpbCIsImF2YXRhcl91cmwiOiJhdmF0YXJVcmwiLCJzdWIiOjAsImlhdCI6MTcwNDc0NTI4MywiZXhwIjozMzI2MjM0NTI4M30.fe0LLHknLsGmy-tc7QXyyMZDDxBDC1HD7B_99zeCnv8';

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

export const authMockUserToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiZW1haWwiOiJlbWFpbCIsImF2YXRhcl91cmwiOiJhdmF0YXJVcmwiLCJzdWIiOjEsImlhdCI6MTcwNTk4NzYwNywiZXhwIjoxNzA2MDc0MDA3fQ.PhMUljbdR7cjr4H2TvJzOhQXmi5vOrUmSaT5FrBLp84';
