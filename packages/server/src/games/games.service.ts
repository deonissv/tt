import { Injectable } from '@nestjs/common';
import { CreateGameDto } from '@shared/dto/games/create-game.dto';
import { getRandomString } from '@shared/utils';
import { UpdateGameDto } from '@shared/dto/games/update-game.dto';
import { PrismaService } from '../prisma.service';
import { Game } from '@prisma/client';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createGameDto: CreateGameDto) {
    return await this.prisma.game.create({
      data: {
        ...createGameDto,
        code: getRandomString(),
        authorId: userId,
      },
    });
  }

  async findUnique(gameId: number): Promise<Game | null> {
    return await this.prisma.game.findUnique({ where: { gameId } });
  }

  async findMany(): Promise<Game[]> {
    return await this.prisma.game.findMany();
  }

  async findManyByAuthorId(authorId: number): Promise<Game[]> {
    return await this.prisma.game.findMany({ where: { authorId } });
  }
  async update(authorId: number, gameId: number, updateGameDto: UpdateGameDto) {
    return await this.prisma.game.update({
      where: { gameId, authorId },
      data: updateGameDto,
    });
  }

  async delete(authorId: number, gameId: number) {
    return await this.prisma.game.delete({ where: { gameId, authorId } });
  }
}
