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
import { CheckPolicies, PoliciesGuard } from '../decorators/policies.decorator';
import { AppAbility } from '../casl/casl-ability.factory';
import { User } from '../decorators/user.decorator';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @ApiBearerAuth('JWT')
  @CheckPolicies((ability: AppAbility) => ability.can('create', 'Game'))
  @UseGuards(PoliciesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@User() user: ValidatedUser, @Body() createGameDto: CreateGameDto): Promise<GamePreviewDto> {
    return this.gamesService.create(user.userId, createGameDto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('/my')
  getAllOwnPreviews(@User() user: ValidatedUser): Promise<GamePreviewDto[]> {
    return this.gamesService.findManyPreviewByAuthorId(user.userId);
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
  getAllPreviews(): Promise<GamePreviewDto[]> {
    return this.gamesService.findManyPreview();
  }

  @ApiBearerAuth('JWT')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'Game'))
  @UseGuards(PoliciesGuard)
  @UseGuards(JwtAuthGuard)
  @Put(':code')
  update(@User() user: ValidatedUser, @Param('code') code: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(user.userId, code, updateGameDto);
  }

  @ApiBearerAuth('JWT')
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Game'))
  @UseGuards(PoliciesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':code')
  delete(@User() user: ValidatedUser, @Param('code') code: string) {
    return this.gamesService.delete(user.userId, code);
  }
}
