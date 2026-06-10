import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { GamesModule } from '../games/games.module';
import { PermissionsService } from '../permissions.service';
import { ActionHandler } from '../simulation/action-handler';
import { SimulationFactory } from '../simulation/simulation.factory';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { AssetUrlService } from './asset-url.service';
import { InMemoryRoomRegistry, RoomRegistry } from './room-registry';
import { SimulationRoomFactory } from './simulation-room.factory';

@Module({
  imports: [GamesModule],
  providers: [
    RoomsService,
    AssetUrlService,
    PermissionsService,
    CaslAbilityFactory,
    ActionHandler,
    SimulationRoomFactory,
    SimulationFactory,
    { provide: RoomRegistry, useClass: InMemoryRoomRegistry },
  ],
  controllers: [RoomsController],
  exports: [RoomsService, RoomRegistry],
})
export class RoomsModule {}
