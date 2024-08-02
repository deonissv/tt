import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PermissionsService } from '../permissions.service';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
  providers: [GamesService, PermissionsService, CaslAbilityFactory],
  exports: [GamesService],
  controllers: [GamesController],
})
export class GamesModule {}
