import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ValidatedUser } from '../auth/validated-user';
import { User } from '../decorators/user.decorator';
import { RoomsService } from './rooms.service';

import { CreateRoomDto, RoomwDto } from '@tt/dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomService: RoomsService) {}

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async createRoom(@User() user: ValidatedUser, @Body() createRoomDto: CreateRoomDto) {
    return await this.roomService.createRoom(user.userId, createRoomDto.gameCode);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get(':code')
  async getRoom(@User() user: ValidatedUser, @Param('code') code: string): Promise<RoomwDto> {
    return await this.roomService.findRoom(user, code);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('user/:code')
  async getUserRooms(@Param('code') code: string) {
    return await this.roomService.getUserRooms(code);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Delete(':code')
  delete(@User() user: ValidatedUser, @Param('code') code: string) {
    return this.roomService.deleteRoom(user, code);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('start/:code')
  async start(@Param('code') code: string) {
    return await this.roomService.resumeRoom(code);
  }
}
