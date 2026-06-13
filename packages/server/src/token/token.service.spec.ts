import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import { TokenService } from './token.service';

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

describe('TokenService', () => {
  let tokenService: TokenService;

  beforeEach(() => {
    const jwtService = new JwtService({
      secret: 'secret',
      signOptions: { expiresIn: '7d' },
    });
    tokenService = new TokenService(jwtService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(tokenService).toBeDefined();
  });

  describe('generateToken', () => {
    it('should return a token', () => {
      const signMock = vi.spyOn(JwtService.prototype, 'sign').mockReturnValue('token');

      const token = tokenService.generateToken(user);

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

  describe('verifyAsync', () => {
    it('should verify a token and return its payload', async () => {
      const payload = { sub: 1, username: 'username' };
      const verifyMock = vi.spyOn(JwtService.prototype, 'verifyAsync').mockResolvedValue(payload);

      const result = await tokenService.verifyAsync('token');

      expect(result).toEqual(payload);
      expect(verifyMock).toHaveBeenCalledWith('token');
    });
  });
});
