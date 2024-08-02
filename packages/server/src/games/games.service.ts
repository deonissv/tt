import { Injectable, Logger } from '@nestjs/common';
import type { Game, GameVersion, Prisma } from '@prisma/client';

import type { CreateGameDto, GameDto, GamePreviewDto, UpdateGameDto } from '@shared/dto/games';
import { SimulationStateSave } from '@shared/dto/states';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createGameDto: CreateGameDto): Promise<GamePreviewDto> {
    this.logger.log(`Parsing game context: ${createGameDto.name}`);
    const content = JSON.parse(createGameDto.content) as Prisma.JsonObject;

    this.logger.log(`Creating game: ${createGameDto.name}`);
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
    this.logger.log(`Game created: ${createdGame.name}`);
    return GamesService.toGamePreviewDto(createdGame);
  }

  async findUnique(gameId: number): Promise<GameDto | null> {
    this.logger.log(`Finding game with ID: ${gameId}`);
    const game = await this.prisma.game.findUnique({ where: { gameId }, include: { GameVersion: true } });
    if (!game) {
      this.logger.log(`Game with ID ${gameId} not found`);
      return null;
    }
    if (!game.GameVersion.length) {
      this.logger.log(`Game with ID ${gameId} has no versions`);
      return null;
    }
    this.logger.log(`Found game with ID: ${gameId}`);
    return GamesService.toGameDto(game);
  }

  async findUniqueByCode(code: string): Promise<GameDto | null> {
    this.logger.log(`Finding game with code: ${code}`);
    const game = await this.prisma.game.findUnique({
      where: { code },
      include: {
        GameVersion: {
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!game) {
      this.logger.log(`Game with code ${code} not found`);
      return null;
    }

    if (!game.GameVersion?.[0]?.content) {
      this.logger.log(`Game with code ${code} has no versions`);
      return null;
    }

    this.logger.log(`Found game with code: ${code}`);
    return GamesService.toGameDto(game);
  }

  async findLastVersionByCode(code: string): Promise<GameVersion | null> {
    this.logger.log(`Finding last version of game with code: ${code}`);
    const game = await this.prisma.game.findFirst({
      where: { code },
      include: {
        GameVersion: {
          orderBy: { version: 'desc' },
        },
      },
    });
    if (!game) {
      this.logger.log(`Game with code ${code} not found`);
      return null;
    }
    const lastVersion = game.GameVersion?.[0];
    if (!lastVersion) {
      this.logger.log(`Game with code ${code} has no versions`);
      return null;
    }
    this.logger.log(`Found last version of game with code: ${code}`);
    return lastVersion;
  }

  async findContentByCode(code: string): Promise<SimulationStateSave | null> {
    this.logger.log(`Finding content for game with code: ${code}`);
    const game = await this.prisma.game.findFirst({
      where: { code },
      include: {
        GameVersion: {
          orderBy: { version: 'desc' },
        },
      },
    });

    if (!game?.GameVersion?.[0]?.content) {
      this.logger.log(`Content not found for game with code: ${code}`);
      return null;
    }

    const content = game.GameVersion?.[0]?.content;
    if (typeof content !== 'object') {
      this.logger.log(`Invalid content format for game with code: ${code}`);
      return null;
    }

    this.logger.log(`Content found for game with code: ${code}`);
    return content as SimulationStateSave;
  }

  async findManyPreview(): Promise<GamePreviewDto[]> {
    this.logger.log('Finding many game previews');
    const previews = await this.prisma.game.findMany();
    this.logger.log(`Found ${previews.length} game previews`);
    return previews.map(preview => {
      this.logger.log(`Converting game preview with code: ${preview.code}`);
      return GamesService.toGamePreviewDto(preview);
    });
  }

  async findManyPreviewByAuthorId(authorId: number): Promise<GamePreviewDto[]> {
    this.logger.log(`Finding many game previews by author ID: ${authorId}`);
    const previews = await this.prisma.game.findMany({ where: { authorId } });
    this.logger.log(`Found ${previews.length} game previews for author ID: ${authorId}`);
    return previews.map(preview => {
      this.logger.log(`Converting game preview with code: ${preview.code}`);
      return GamesService.toGamePreviewDto(preview);
    });
  }

  async findManyPreviewByAuthorCode(authorCode: string): Promise<GamePreviewDto[]> {
    this.logger.log(`Finding many game previews by author code: ${authorCode}`);
    const previews = await this.prisma.game.findMany({
      where: {
        User: {
          code: authorCode,
        },
      },
    });
    this.logger.log(`Found ${previews.length} game previews for author code: ${authorCode}`);
    return previews.map(preview => {
      this.logger.log(`Converting game preview with code: ${preview.code}`);
      return GamesService.toGamePreviewDto(preview);
    });
  }

  async update(authorId: number, code: string, updateGameDto: UpdateGameDto): Promise<GamePreviewDto> {
    this.logger.log(`Updating game with code: ${code}`);
    const preview = updateGameDto.content
      ? await this._updateFull(authorId, code, updateGameDto)
      : await this._updatePreview(authorId, code, updateGameDto);
    this.logger.log(`Game with code ${code} updated`);
    return GamesService.toGamePreviewDto(preview);
  }

  async _updatePreview(authorId: number, code: string, updateGameDto: UpdateGameDto) {
    this.logger.log(`Updating game preview with code: ${code}`);
    const updatedGame = await this.prisma.game.update({
      where: { code, authorId },
      data: {
        name: updateGameDto.name,
        description: updateGameDto.description,
        bannerUrl: updateGameDto.bannerUrl,
      },
    });
    this.logger.log(`Game preview with code ${code} updated`);
    return updatedGame;
  }

  async _updateFull(authorId: number, code: string, updateGameDto: UpdateGameDto) {
    this.logger.log(`Updating game with code: ${code}`);
    const content = JSON.parse(updateGameDto.content!) as Prisma.JsonObject;
    const updatedGame = await this.prisma.game.update({
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
    this.logger.log(`Game with code ${code} updated`);
    return updatedGame;
  }

  async delete(code: string) {
    this.logger.log(`Deleting game with code: ${code}`);
    const deletedGame = await this.prisma.game.delete({ where: { code } });
    this.logger.log(`Game with code ${code} deleted`);
    return deletedGame;
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
