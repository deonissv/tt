import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from '@shared/dto/games/create-game.dto';
import { getRandomString } from '@shared/utils';
import { UpdateGameDto } from '@shared/dto/games/update-game.dto';

@Injectable()
export class GamesService {
  constructor(@InjectRepository(Game) private readonly gameRepository: Repository<Game>) {}

  async create(userId: number, createGameDto: CreateGameDto) {
    await this.gameRepository.save({
      code: getRandomString(),
      authorId: userId,
      ...createGameDto,
    });
  }

  async find(gameId: number): Promise<Game> {
    return await this.gameRepository.findOneByOrFail({ gameId });
  }

  async findAll(): Promise<Game[]> {
    return await this.gameRepository.find();
  }

  // async findUser(userId: number): Promise<Game> {
  //   return await this.gameRepository.findOneByOrFail({ authorId: userId });
  // }

  async update(userId: number, gameId: number, updateGameDto: UpdateGameDto) {
    // @TODO add filter by userId
    return await this.gameRepository.update({ gameId }, updateGameDto);
  }

  async delete(userId: number, gameId: number) {
    return await this.gameRepository.softDelete({ gameId });
  }
}
