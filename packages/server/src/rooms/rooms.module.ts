import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { GamesModule } from '../games/games.module';
import { PermissionsService } from '../permissions.service';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { AssetUrlService } from './asset-url.service';
import { InMemoryRoomRegistry, RoomRegistry } from './room-registry';

@Module({
  imports: [GamesModule],
  providers: [
    RoomsService,
    AssetUrlService,
    PermissionsService,
    CaslAbilityFactory,
    { provide: RoomRegistry, useClass: InMemoryRoomRegistry },
  ],
  controllers: [RoomsController],
  exports: [RoomsService, RoomRegistry],
})
export class RoomsModule {}
