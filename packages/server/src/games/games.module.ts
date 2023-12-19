import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game])],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
