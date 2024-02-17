import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma.service';
import { PermissionsService } from '../permissions.service';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';

@Module({
  providers: [MessagesService, PrismaService, PermissionsService, CaslAbilityFactory],
})
export class MessagesModule {}
