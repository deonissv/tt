import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [GamesService, PrismaService],
  exports: [GamesService],
  controllers: [GamesController],
})
export class GamesModule {}
