import { Body, Controller, Delete, Get, Param, Post, Put, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { CreateGameDto } from '@shared/dto/games/create-game.dto';
import { JWT } from '../auth/strategy/jwt';
import { UpdateGameDto } from '@shared/dto/games/update-game.dto';

@ApiTags('games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  create(@Request() req: { user: JWT }, @Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(req.user.sub, createGameDto);
  }

  @Get(':id')
  get(@Param('id') id: number) {
    return this.gamesService.findUnique(id);
  }

  @Put(':id')
  update(@Request() req: { user: JWT }, @Param('id') id: number, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(req.user.sub, id, updateGameDto);
  }

  @Delete(':id')
  delete(@Request() req: { user: JWT }, @Param('id') id: number) {
    return this.gamesService.delete(req.user.sub, id);
  }
}
