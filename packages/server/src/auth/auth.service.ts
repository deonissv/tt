import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { AccessTokenDto, CreateUserDto, SignInDto } from '@tt/dto';
import { TokenService } from '../token/token.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Sign in a user with the provided credentials.
   * @param signInDto - The sign-in data containing email and password.
   * @returns A promise that resolves to an access token.
   * @throws BadRequestException if the email or password is incorrect.
   */
  async signin(signInDto: SignInDto): Promise<AccessTokenDto> {
    this.logger.log(`Signing in user with email: ${signInDto.email}`);
    const user = await this.validateUser(signInDto.email, signInDto.password);
    this.logger.log(`User with email ${signInDto.email} successfully signed in`);
    return this.tokenService.generateToken(user);
  }

  /**
   * Create a new user account.
   * @param createUser - The data for creating a new user.
   * @returns A promise that resolves to an access token.
   */
  async signup(createUser: CreateUserDto): Promise<AccessTokenDto> {
    this.logger.log(`Creating new user account for ${createUser.email}`);
    const user = await this.usersService.create(createUser);
    this.logger.log(`New user account created for ${user.email}`);
    return this.tokenService.generateToken(user);
  }

  /**
   * Validate a user's credentials.
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns A promise that resolves to the validated user.
   * @throws BadRequestException if the email or password is incorrect.
   */
  async validateUser(email: string, password: string): Promise<User> {
    this.logger.log(`Validating user with email: ${email}`);
    const user = await this.usersService.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(password, user?.passwordHash))) {
      this.logger.log(`Invalid email or password for user with email: ${email}`);
      throw new BadRequestException('Wrong email or password');
    }
    this.logger.log(`User with email ${email} successfully validated`);
    return user;
  }
}
