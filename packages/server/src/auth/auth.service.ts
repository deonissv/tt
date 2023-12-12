import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signin(signInDto: SignInDto) {
    const user = await this.usersService.findOneByEmail(signInDto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.generateToken(user);
  }

  async signup(createUser: CreateUserDto): Promise<{ access_token: string }> {
    const candidate = await this.usersService.findOneByEmail(createUser.email);
    if (candidate) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.usersService.create(createUser);
    return this.generateToken(user);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);
    if (password !== user?.passwordHash) {
      throw new BadRequestException('Wrong email or password');
    }
    return user;
  }

  generateToken(user: User): { access_token: string } {
    const payload = {
      username: user.username,
      email: user.email,
      avatar_url: user.avatarUrl,
      sub: user.userId,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
