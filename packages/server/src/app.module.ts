import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomService } from './room/room.service';
import { RoomControllerController } from './room-controller/room-controller.controller';

@Module({
  imports: [],
  controllers: [AppController, RoomControllerController],
  providers: [AppService, RoomService],
})
export class AppModule {}
