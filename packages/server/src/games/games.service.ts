import { Body, Injectable, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from '@shared/dto/games/create-game.dto';
import { getRandomString } from '@shared/utils';

@Injectable()
export class GamesService {
  constructor(@InjectRepository(Game) private readonly gameRepository: Repository<Game>) {}
  async create(@Request() req, @Body() createGameDto: CreateGameDto) {
    await this.gameRepository.save({
      code: getRandomString(),
      ...createGameDto,
    });
  }
  async findAll(): Promise<Game[]> {
    return await this.gameRepository.find();
  }
}
