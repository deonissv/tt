import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRoomDto } from '@shared/dto/rooms/create-room.dto';
import { ValidatedUser } from '../auth/validated-user';
import { User } from '../decorators/user.decorator';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private roomService: RoomsService) {}

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@User() user: ValidatedUser, @Body() createRoomDto: CreateRoomDto) {
    return this.roomService.createRoom(user.userId, createRoomDto?.gameCode);
  }
}
