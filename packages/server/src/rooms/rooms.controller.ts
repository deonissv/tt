import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRoomDto } from '@shared/dto/rooms/create-room.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private roomService: RoomsService) {}

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createRoomDto: CreateRoomDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    console.log(req.user);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.roomService.createRoom(req.user, createRoomDto.playground);
  }
}
