import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomService } from './room/room.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, RoomService],
})
export class AppModule {}
