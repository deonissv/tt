import { Injectable } from '@nestjs/common';
import type { Game, GameVersion, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma.service';

import type { CreateGameDto, GameDto, GamePreviewDto, UpdateGameDto } from '@shared/dto/games';
import type { SimulationStateSave } from '../../../shared/src/dto/states/simulation';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createGameDto: CreateGameDto): Promise<GamePreviewDto> {
    const content = JSON.parse(createGameDto.content) as Prisma.JsonObject;
    const createdGame = await this.prisma.game.create({
      data: {
        name: createGameDto.name,
        description: createGameDto.description,
        bannerUrl: createGameDto.bannerUrl,
        authorId: userId,
        GameVersion: {
          create: {
            content,
          },
        },
      },
      include: {
        GameVersion: true,
      },
    });

    return GamesService.toGamePreviewDto(createdGame);
  }

  async findUnique(gameId: number): Promise<GameDto | null> {
    const game = await this.prisma.game.findUnique({ where: { gameId }, include: { GameVersion: true } });
    if (!game) return null;
    if (!game.GameVersion.length) return null;
    return GamesService.toGameDto(game);
  }

  async findUniqueByCode(code: string): Promise<GameDto | null> {
    const game = await this.prisma.game.findUnique({
      where: { code },
      include: {
        GameVersion: {
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!game || !game.GameVersion?.[0]?.content) return null;
    return GamesService.toGameDto(game);
  }

  async findLastVersionByCode(code: string): Promise<GameVersion | null> {
    const game = await this.prisma.game.findFirst({
      where: { code },
      include: {
        GameVersion: {
          orderBy: { version: 'desc' },
        },
      },
    });
    return game?.GameVersion?.[0] ?? null;
  }

  async findContentByCode(code: string): Promise<SimulationStateSave | null> {
    const game = await this.prisma.game.findFirst({
      where: { code },
      include: {
        GameVersion: {
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!game || !game.GameVersion?.[0]?.content) return null;
    const content = game.GameVersion?.[0]?.content;
    if (typeof content !== 'object') return null;
    return content as SimulationStateSave;
  }

  async findManyPreview(): Promise<GamePreviewDto[]> {
    const previews = await this.prisma.game.findMany();
    return previews.map(preview => GamesService.toGamePreviewDto(preview));
  }

  async findManyPreviewByAuthorId(authorId: number): Promise<GamePreviewDto[]> {
    const previews = await this.prisma.game.findMany({ where: { authorId } });
    return previews.map(preview => GamesService.toGamePreviewDto(preview));
  }

  async findManyPreviewByAuthorCode(authorCode: string): Promise<GamePreviewDto[]> {
    const previews = await this.prisma.game.findMany({
      where: {
        User: {
          code: authorCode,
        },
      },
    });
    return previews.map(preview => GamesService.toGamePreviewDto(preview));
  }

  async update(authorId: number, code: string, updateGameDto: UpdateGameDto): Promise<GamePreviewDto> {
    const preview = updateGameDto.content
      ? await this._updateFull(authorId, code, updateGameDto)
      : await this._updatePreview(authorId, code, updateGameDto);
    return GamesService.toGamePreviewDto(preview);
  }

  async _updatePreview(authorId: number, code: string, updateGameDto: UpdateGameDto) {
    return await this.prisma.game.update({
      where: { code, authorId },
      data: {
        name: updateGameDto.name,
        description: updateGameDto.description,
        bannerUrl: updateGameDto.bannerUrl,
      },
    });
  }

  async _updateFull(authorId: number, code: string, updateGameDto: UpdateGameDto) {
    const content = JSON.parse(updateGameDto.content!) as Prisma.JsonObject;
    return await this.prisma.game.update({
      where: { code, authorId },
      include: { GameVersion: true },
      data: {
        name: updateGameDto.name,
        description: updateGameDto.description,
        bannerUrl: updateGameDto.bannerUrl,
        GameVersion: {
          create: {
            content,
          },
        },
      },
    });
  }

  async delete(code: string) {
    return await this.prisma.game.delete({ where: { code } });
  }

  static toGamePreviewDto(game: Game): GamePreviewDto {
    return {
      code: game.code,
      name: game.name,
      description: game.description,
      bannerUrl: game.bannerUrl,
    };
  }

  static toGameDto(game: Game & { GameVersion: GameVersion[] }): GameDto {
    const gameVersion = game.GameVersion.at(-1)!;
    return {
      code: game.code,
      version: gameVersion.version,
      name: game.name,
      description: game.description,
      bannerUrl: game.bannerUrl,
      content: JSON.stringify(gameVersion.content),
      authorId: game.authorId,
    };
  }
}
