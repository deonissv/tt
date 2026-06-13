import { Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { GamesModule } from '../games/games.module';
import { ActionHandler } from '../simulation/action-handler';
import { SimulationFactory } from '../simulation/simulation.factory';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { AssetUrlService } from './asset-url.service';
import { InMemoryRoomRegistry, RoomRegistry } from './room-registry';
import { SimulationRoomFactory } from './simulation-room.factory';

@Module({
  imports: [GamesModule, CaslModule],
  providers: [
    RoomsService,
    AssetUrlService,
    ActionHandler,
    SimulationRoomFactory,
    SimulationFactory,
    { provide: RoomRegistry, useClass: InMemoryRoomRegistry },
  ],
  controllers: [RoomsController],
  exports: [RoomsService, RoomRegistry],
})
export class RoomsModule {}
