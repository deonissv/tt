import { forwardRef, Module } from '@nestjs/common';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PermissionsService } from '../permissions.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [forwardRef(() => import('../auth/auth.module').then(m => m.AuthModule))],
  controllers: [UsersController],
  providers: [UsersService, PermissionsService, CaslAbilityFactory],
  exports: [UsersService],
})
export class UsersModule {}
