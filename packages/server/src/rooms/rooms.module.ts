import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { GamesModule } from '../games/games.module';
import { PermissionsService } from '../permissions.service';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { AssetUrlService } from './asset-url.service';

@Module({
  imports: [GamesModule],
  providers: [RoomsService, AssetUrlService, PermissionsService, CaslAbilityFactory],
  controllers: [RoomsController],
  exports: [RoomsService],
})
export class RoomsModule {}
