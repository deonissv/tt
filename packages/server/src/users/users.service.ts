import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from '@shared/dto/users/update-user.dto';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from '@shared/dto/users/create-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUser: CreateUserDto) {
    if (await this.emailExists(createUser.email)) {
      throw new BadRequestException('Email already exists');
    }
    const passwordHash = await bcrypt.hash(createUser.password, +this.configService.getOrThrow<string>('SALT_ROUNDS'));

    return await this.prisma.user.create({
      data: {
        email: createUser.email,
        username: createUser.username,
        passwordHash,
        avatarUrl: createUser.avatarUrl,
      },
    });
  }

  async findOneById(userId: number) {
    return await this.prisma.user.findUnique({ where: { userId } });
  }

  async findOneByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { userId },
      data: updateUserDto,
    });
  }

  async delete(userId: number) {
    return await this.prisma.user.delete({ where: { userId } });
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return !!user;
  }
}
