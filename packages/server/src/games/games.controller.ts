import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { CreateGameDto } from '@shared/dto/games/create-game.dto';
import { JWT } from '../auth/jwt';
import { UpdateGameDto } from '@shared/dto/games/update-game.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: { user: JWT }, @Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(req.user.sub, createGameDto);
  }
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  get(@Param('id') id: number) {
    return this.gamesService.findUnique(id);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Request() req: { user: JWT }, @Param('id') id: number, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(req.user.sub, id, updateGameDto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Request() req: { user: JWT }, @Param('id') id: number) {
    return this.gamesService.delete(req.user.sub, id);
  }
}
