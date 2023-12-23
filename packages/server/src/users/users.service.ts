import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from '../../../shared/dto/users/create-user.dto';
import { UpdateUserDto } from '@shared/dto/users/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async create(createUser: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUser.password, 7);
    const user = this.usersRepository.create({
      ...createUser,
      passwordHash,
    });

    return await this.usersRepository.save(user);
  }

  async findOneById(userId: number) {
    return await this.usersRepository.findOneBy({ userId });
  }

  async findOneByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    return await this.usersRepository.update({ userId }, updateUserDto);
  }

  async delete(userId: number) {
    return await this.usersRepository.softDelete({ userId });
  }
}
