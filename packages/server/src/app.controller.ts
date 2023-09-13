import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RoomService } from './room/room.service';
import { PlaygroundState } from '@tt/shared';

export class CreateRoomDto {
  playground?: PlaygroundState;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly roomService: RoomService,
  ) {}

  @Get()
  async load(@Query('url') url: string) {
    return this.appService.load(url);
  }

  @Post('room')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.createRoom(createRoomDto.playground);
  }
}
