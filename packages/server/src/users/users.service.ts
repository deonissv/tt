import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

import type { CreateUserDto, UpdateUserDto } from '@tt/dto';
import type { ValidatedUser } from '../auth/validated-user';
import { PolicyControlService } from '../casl/policy-control.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly policyControl: PolicyControlService,
  ) {}

  /**
   * Creates a new user.
   *
   * @param createUser - The data for creating a new user.
   * @returns A promise that resolves to the created user.
   * @throws BadRequestException if the email already exists.
   */
  async create(createUser: CreateUserDto) {
    if (await this.emailExists(createUser.email)) {
      throw new BadRequestException('Email already exists');
    }
    const passwordHash = await this.hashPassword(createUser.password);

    this.logger.log('Creating a new user:', createUser.email);

    const newUser = await this.prisma.user.create({
      data: {
        email: createUser.email,
        username: createUser.username,
        passwordHash,
        avatarUrl: createUser.avatarUrl,
        roleId: 2,
      },
    });

    this.logger.log('New user created:', newUser.code);
    return newUser;
  }

  /**
   * Finds a user by their ID.
   *
   * @param userId - The ID of the user to find.
   * @returns A promise that resolves to the found user.
   */
  async findOneById(userId: number) {
    this.logger.log(`Finding user by ID: ${userId}`);
    const user = await this.prisma.user.findUnique({ where: { userId } });
    this.logger.log(`User found: ${user?.code}`);
    return user;
  }

  /**
   * Finds a user by their email address.
   *
   * @param email - The email address of the user to find.
   * @returns A promise that resolves to the user object if found, or `null` if not found.
   */
  async findOneByEmail(email: string) {
    this.logger.log(`Finding user by email: ${email}`);
    const user = await this.prisma.user.findUnique({ where: { email } });
    this.logger.log(`User found: ${user?.code}`);
    return user;
  }

  /**
   * Finds a unique user by the provided code.
   *
   * @param code - The code to search for.
   * @returns A promise that resolves to the unique user found, or `null` if no user is found.
   */
  async findUniqueByCode(code: string) {
    this.logger.log(`Finding user by code: ${code}`);
    const user = await this.prisma.user.findUnique({ where: { code } });
    this.logger.log(`User found: ${user?.code}`);
    return user;
  }

  /**
   * Updates the authenticated user, after authorizing them to update the user
   * identified by `code`. Mutates the caller's own record.
   *
   * @param actor - The authenticated user performing the update.
   * @param code - The code of the user the update is authorized against.
   * @param updateUserDto - The data to update the user with.
   * @returns A promise that resolves to the updated user.
   */
  async update(actor: ValidatedUser, code: string, updateUserDto: UpdateUserDto) {
    const target = await this.findUniqueByCode(code);
    if (!target) {
      throw new NotFoundException('User not found');
    }
    await this.policyControl.authorize(actor, 'update', 'User', target);

    this.logger.log(`Updating user with ID: ${actor.userId}`);
    const updatedUser = await this.prisma.user.update({
      where: { userId: actor.userId },
      data: {
        username: updateUserDto?.username,
        avatarUrl: updateUserDto?.avatarUrl,
        passwordHash: updateUserDto.password ? await this.hashPassword(updateUserDto.password) : undefined,
      },
    });
    this.logger.log(`User updated: ${updatedUser?.code}`);
    return updatedUser;
  }

  /**
   * Deletes the authenticated user, after authorizing them to delete the user
   * identified by `code`. Mutates the caller's own record.
   *
   * @param actor - The authenticated user performing the deletion.
   * @param code - The code of the user the deletion is authorized against.
   * @returns A promise that resolves to the deleted user.
   */
  async delete(actor: ValidatedUser, code: string) {
    const target = await this.findUniqueByCode(code);
    if (!target) {
      throw new NotFoundException('User not found');
    }
    await this.policyControl.authorize(actor, 'delete', 'User', target);

    this.logger.log(`Deleting user with ID: ${actor.userId}`);
    const deletedUser = await this.prisma.user.delete({ where: { userId: actor.userId } });
    this.logger.log(`User deleted: ${deletedUser?.code}`);
    return deletedUser;
  }

  /**
   * Checks if an email exists in the database.
   *
   * @param email - The email to check.
   * @returns A promise that resolves to a boolean indicating whether the email exists.
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  /**
   * Hashes the given password using bcrypt.
   *
   * @param password - The password to be hashed.
   * @returns A promise that resolves to the hashed password.
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, +this.configService.getOrThrow<string>('SALT_ROUNDS'));
  }
}
