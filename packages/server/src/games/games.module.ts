import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { PrismaService } from '../prisma.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';

@Module({
  providers: [GamesService, PrismaService, CaslAbilityFactory],
  exports: [GamesService],
  controllers: [GamesController],
})
export class GamesModule {}
