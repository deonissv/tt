import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';

import { AccessTokenDto, JWTPayload } from '@tt/dto';

@Injectable()
export class TokenService {
  private readonly logger = new Logger('TokenService');

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generate an access token for a user.
   * @param user - The user for whom to generate the token.
   * @returns The generated access token.
   */
  generateToken(user: User): AccessTokenDto {
    this.logger.log(`Generating access token for user with email: ${user.email}`);
    const payload: JWTPayload = {
      username: user.username,
      email: user.email,
      avatar_url: user.avatarUrl,
      sub: user.userId,
      code: user.code,
      role: user.roleId,
    };
    const accessToken = this.jwtService.sign(payload);
    this.logger.log(`Access token generated for user with email: ${user.email}`);
    return {
      access_token: accessToken,
    };
  }

  /**
   * Verify the validity of an access token.
   * @param token - The access token to verify.
   * @returns A promise that resolves to the decoded JWT payload.
   */
  async verifyAsync(token: string): Promise<JWTPayload> {
    this.logger.log(`Verifying access token`);
    const payload = await this.jwtService.verifyAsync<JWTPayload>(token);
    this.logger.log(`Access token verified`);
    return payload;
  }
}
