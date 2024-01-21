import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { CreateGameDto } from '@shared/dto/games/create-game.dto';
import { UpdateGameDto } from '@shared/dto/games/update-game.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ValidatedUser } from '../auth/validated-user';
import { GameDto } from '@shared/dto/games/game.dto';
import { GamePreviewDto } from '@shared/dto/games/game-preview.dto';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: { user: ValidatedUser }, @Body() createGameDto: CreateGameDto): Promise<GamePreviewDto> {
    return this.gamesService.create(req.user.userId, createGameDto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('/my')
  getAllOwnPreviews(@Request() req: { user: ValidatedUser }): Promise<GamePreviewDto[]> {
    return this.gamesService.findManyPreviewByAuthorId(req.user.userId);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('/user/:code')
  getAllUserPreviews(@Param('code') code: string): Promise<GamePreviewDto[]> {
    return this.gamesService.findManyPreviewByAuthorCode(code);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async get(@Param('id', new ParseIntPipe()) id: number): Promise<GameDto> {
    const game = await this.gamesService.findUnique(id);
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllPreviews() {
    return this.gamesService.findManyPreview();
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Put(':code')
  update(@Request() req: { user: ValidatedUser }, @Param('code') code: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(req.user.userId, code, updateGameDto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Delete(':code')
  delete(@Request() req: { user: ValidatedUser }, @Param('code') code: string) {
    return this.gamesService.delete(req.user.userId, code);
  }
}
