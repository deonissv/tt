import { Module } from '@nestjs/common';
import { PermissionsService } from '../permissions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PolicyControlService } from './policy-control.service';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  imports: [PrismaModule],
  providers: [CaslAbilityFactory, PermissionsService, PolicyControlService],
  exports: [CaslAbilityFactory, PermissionsService, PolicyControlService],
})
export class CaslModule {}
