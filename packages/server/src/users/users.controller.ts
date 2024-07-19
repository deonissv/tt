import { subject } from '@casl/ability';
import { Body, Controller, Delete, ForbiddenException, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ValidatedUser } from '../auth/validated-user';
import type { AppAbility } from '../casl/casl-ability.factory';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { CheckPolicies, PoliciesGuard } from '../decorators/policies.decorator';
import { User } from '../decorators/user.decorator';
import { PermissionsService } from '../permissions.service';
import { UsersService } from './users.service';

import { UpdateUserDto } from '@shared/dto/users';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @ApiBearerAuth('JWT')
  @CheckPolicies((ability: AppAbility) => ability.can('update', 'User'))
  @UseGuards(PoliciesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':code')
  async delete(@User() user: ValidatedUser, @Param('code') code: string) {
    const userToDelete = await this.usersService.findUniqueByCode(code);
    if (!userToDelete) {
      throw new ForbiddenException('User not found');
    }

    const userWithPermissions = await this.permissionsService.getUserWithPermissions(user);
    const ability = new CaslAbilityFactory().createForUser(userWithPermissions);

    if (!ability.can('delete', subject('User', userToDelete))) {
      throw new ForbiddenException('Cannot update the user');
    }

    return this.usersService.delete(user.userId);
  }

  @ApiBearerAuth('JWT')
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'User'))
  @UseGuards(PoliciesGuard)
  @UseGuards(JwtAuthGuard)
  @Put(':code')
  async update(@User() user: ValidatedUser, @Param('code') code: string, @Body() updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.usersService.findUniqueByCode(code);
    if (!userToUpdate) {
      throw new ForbiddenException('User not found');
    }

    const userWithPermissions = await this.permissionsService.getUserWithPermissions(user);
    const ability = new CaslAbilityFactory().createForUser(userWithPermissions);

    if (!ability.can('update', subject('User', userToUpdate))) {
      throw new ForbiddenException('Cannot delete the user');
    }

    return this.usersService.update(user.userId, updateUserDto);
  }
}
