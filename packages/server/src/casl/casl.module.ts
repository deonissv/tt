import { Module } from '@nestjs/common';
import { PermissionsService } from '../permissions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  imports: [PrismaModule],
  providers: [CaslAbilityFactory, PermissionsService],
  exports: [CaslAbilityFactory, PermissionsService],
})
export class CaslModule {}
