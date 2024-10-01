import { Controller, Get, Logger, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { isURL } from 'class-validator';

import { RoomsService } from '../rooms/rooms.service';
import { ProxyService } from './proxy.service';

@ApiTags('proxy')
@Controller('proxy')
export class ProxyController {
  static logger = new Logger('ProxyController');

  constructor(
    private readonly roomsService: RoomsService,
    private readonly proxyService: ProxyService,
  ) {}

  @Get('/:roomCode/:url')
  async proxy(@Param('roomCode') roomCode: string, @Param('url') url: string) {
    ProxyController.logger.log(`Received request to proxy URL: ${url} for room: ${roomCode}`);

    if (!this.roomsService.isRoomRunning(roomCode)) {
      ProxyController.logger.warn(`Room not found: ${roomCode}`);
      throw new NotFoundException();
    }

    if (!isURL(url)) {
      ProxyController.logger.warn(`Invalid URL: ${url}`);
      throw new NotFoundException();
    }

    return await this.proxyService.proxy(roomCode, url);
  }
}
