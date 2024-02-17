import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { ConfigModule } from '@nestjs/config';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PermissionsService } from '../permissions.service';

@Module({
  imports: [ConfigModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, PermissionsService, CaslAbilityFactory],
  exports: [UsersService],
})
export class UsersModule {}
