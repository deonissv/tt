import { Module } from '@nestjs/common';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { PrismaService } from '../prisma.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PermissionsService } from '../permissions.service';

@Module({
  providers: [GamesService, PrismaService, PermissionsService, CaslAbilityFactory],
  exports: [GamesService],
  controllers: [GamesController],
})
export class GamesModule {}
