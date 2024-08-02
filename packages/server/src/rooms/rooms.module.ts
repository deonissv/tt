import { Module } from '@nestjs/common';
import { GamesModule } from '../games/games.module';
import { PermissionsService } from '../permissions.service';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  imports: [GamesModule],
  providers: [RoomsService, PermissionsService],
  controllers: [RoomsController],
  exports: [RoomsService],
})
export class RoomsModule {}
