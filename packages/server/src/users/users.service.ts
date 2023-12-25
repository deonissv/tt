import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from '@shared/dto/users/update-user.dto';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from '@shared/dto/users/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUser: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUser.password, 7);
    return await this.prisma.user.create({
      data: {
        ...createUser,
        passwordHash,
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
}
