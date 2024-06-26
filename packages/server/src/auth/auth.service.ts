import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import type { AccessTokenDto, JWTPayload, SignInDto } from '@shared/dto/auth';
import type { CreateUserDto } from '@shared/dto/users';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signin(signInDto: SignInDto): Promise<AccessTokenDto> {
    const user = await this.validateUser(signInDto.email, signInDto.password);
    return this.generateToken(user);
  }

  async signup(createUser: CreateUserDto): Promise<AccessTokenDto> {
    const user = await this.usersService.create(createUser);
    return this.generateToken(user);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(password, user?.passwordHash))) {
      throw new BadRequestException('Wrong email or password');
    }
    return user;
  }

  generateToken(user: User): AccessTokenDto {
    const payload: JWTPayload = {
      username: user.username,
      email: user.email,
      avatar_url: user.avatarUrl,
      sub: user.userId,
      code: user.code,
      role: user.roleId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyAsync(token: string): Promise<JWTPayload> {
    return this.jwtService.verifyAsync(token);
  }
}
