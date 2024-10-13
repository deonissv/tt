import { subject } from '@casl/ability';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateGameDto, GameDto, GamePreviewDto, UpdateGameDto } from '@tt/dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ValidatedUser } from '../auth/validated-user';
import type { AppAbility } from '../casl/casl-ability.factory';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { CheckPolicies, PoliciesGuard } from '../decorators/policies.decorator';
import { User } from '../decorators/user.decorator';
import { PermissionsService } from '../permissions.service';
import { GamesService } from './games.service';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly permissionsService: PermissionsService,
  ) {}

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
  @Get(':code')
  async get(@Param('code') code: string): Promise<GameDto> {
    const game = await this.gamesService.findUniqueByCode(code);
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
  async update(@User() user: ValidatedUser, @Param('code') code: string, @Body() updateGameDto: UpdateGameDto) {
    const userWithPermissions = await this.permissionsService.getUserWithPermissions(user);
    const ability = new CaslAbilityFactory().createForUser(userWithPermissions);

    const game = await this.gamesService.findUniqueByCode(code);
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (!ability.can('update', subject('Game', game))) {
      throw new ForbiddenException('Cannot update the game');
    }

    return this.gamesService.update(user.userId, code, updateGameDto);
  }

  @ApiBearerAuth('JWT')
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Game'))
  @UseGuards(PoliciesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':code')
  async delete(@User() user: ValidatedUser, @Param('code') code: string) {
    const userWithPermissions = await this.permissionsService.getUserWithPermissions(user);
    const ability = new CaslAbilityFactory().createForUser(userWithPermissions);

    const game = await this.gamesService.findUniqueByCode(code);
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (!ability.can('delete', subject('Game', game))) {
      throw new ForbiddenException('Not authorized to delete the game');
    }

    return this.gamesService.delete(code);
  }
}
