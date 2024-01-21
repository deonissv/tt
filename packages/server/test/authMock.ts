import { User } from '@prisma/client';

export const authMockUser: User = {
  userId: 0,
  code: '6b23c425-1bbb-4f0e-adba-8db0ddd56f27',
  username: 'username',
  email: 'email',
  passwordHash: 'passwordHash',
  avatarUrl: 'avatarUrl',
  deletedAt: null,
};

export const authMockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXJuYW1lIiwiZW1haWwiOiJlbWFpbCIsImF2YXRhcl91cmwiOiJhdmF0YXJVcmwiLCJzdWIiOjAsImlhdCI6MTcwNDc0NTI4MywiZXhwIjozMzI2MjM0NTI4M30.fe0LLHknLsGmy-tc7QXyyMZDDxBDC1HD7B_99zeCnv8';
