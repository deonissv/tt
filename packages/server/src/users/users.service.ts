import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';

import type { CreateUserDto, UpdateUserDto } from '@shared/dto/users';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUser: CreateUserDto) {
    if (await this.emailExists(createUser.email)) {
      throw new BadRequestException('Email already exists');
    }
    const passwordHash = await this.hashPassword(createUser.password);

    return await this.prisma.user.create({
      data: {
        email: createUser.email,
        username: createUser.username,
        passwordHash,
        avatarUrl: createUser.avatarUrl,
        roleId: 2,
      },
    });
  }

  async findOneById(userId: number) {
    return await this.prisma.user.findUnique({ where: { userId } });
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async findUniqueByCode(code: string) {
    return await this.prisma.user.findUnique({ where: { code } });
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { userId },
      data: {
        username: updateUserDto?.username,
        avatarUrl: updateUserDto?.avatarUrl,
        passwordHash: updateUserDto.password ? await this.hashPassword(updateUserDto.password) : undefined,
      },
    });
  }

  async delete(userId: number) {
    return await this.prisma.user.delete({ where: { userId } });
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return !!user;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, +this.configService.getOrThrow<string>('SALT_ROUNDS'));
  }
}
