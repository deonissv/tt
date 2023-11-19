import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RoomService } from './room/room.service';
import { PlaygroundStateSave } from '@shared/index';

export class CreateRoomDto {
  playground?: PlaygroundStateSave;
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
  createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.createRoom(createRoomDto.playground);
  }
}
