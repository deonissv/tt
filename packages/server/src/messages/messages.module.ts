import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PermissionsService } from '../permissions.service';
import { MessagesService } from './messages.service';

@Module({
  providers: [MessagesService, PermissionsService, CaslAbilityFactory],
})
export class MessagesModule {}
