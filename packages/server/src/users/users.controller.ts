import { Body, Controller, Delete, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { UsersService } from './users.service';

import { UpdateUserDto } from '@tt/dto';
import { ValidatedUser } from '../auth/validated-user';
import { TokenService } from '../token/token.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Delete(':code')
  delete(@User() user: ValidatedUser, @Param('code') code: string) {
    return this.usersService.delete(user, code);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Put(':code')
  async update(@User() user: ValidatedUser, @Param('code') code: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(user, code, updateUserDto);
    return this.tokenService.generateToken(updatedUser);
  }
}
