import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RoomService } from './room/room.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly roomService: RoomService
  ) {}

  @Get()
  async load(@Query('url') url: string) {
    return this.appService.load(url);
  }

  @Get('room')
  async test() {
    return this.roomService.createRoom();
  }
}
