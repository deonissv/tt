import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ValidatedUser } from '../auth/validated-user';
import { User } from '../decorators/user.decorator';
import { RoomsService } from './rooms.service';

import { subject } from '@casl/ability';
import { CreateRoomDto, RoomwDto } from '@tt/dto';
import { AppAbility, CaslAbilityFactory } from '../casl/casl-ability.factory';
import { CheckPolicies, PoliciesGuard } from '../decorators/policies.decorator';
import { PermissionsService } from '../permissions.service';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private roomService: RoomsService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post()
  async createRoom(@User() user: ValidatedUser, @Body() createRoomDto: CreateRoomDto) {
    return await this.roomService.createRoom(user.userId, createRoomDto.gameCode);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get(':code')
  async getRoom(@Param('code') code: string): Promise<RoomwDto> {
    return await this.roomService.findRoom(code);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('user/:code')
  async getUserRooms(@Param('code') code: string) {
    return await this.roomService.getUserRooms(code);
  }

  @ApiBearerAuth('JWT')
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'Room'))
  @UseGuards(PoliciesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':code')
  async delete(@User() user: ValidatedUser, @Param('code') code: string) {
    const userWithPermissions = await this.permissionsService.getUserWithPermissions(user);
    const ability = new CaslAbilityFactory().createForUser(userWithPermissions);

    const room = await this.roomService.findRoomByCode(code).catch(() => {
      throw new NotFoundException('Room not found');
    });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (!ability.can('delete', subject('Room', room))) {
      throw new ForbiddenException('Cannot delete the room');
    }

    return await this.roomService.deleteRoom(code);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post('start/:code')
  async start(@Param('code') code: string) {
    return await this.roomService.resumeRoom(code);
  }
}
