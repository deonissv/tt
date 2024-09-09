import { DynamicModule, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { PermissionsService } from '../permissions.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const getAuthModele = async (): Promise<DynamicModule> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(AuthModule as unknown as DynamicModule);
    }, 1000);
  });
};
@Module({
  imports: [getAuthModele()],
  controllers: [UsersController],
  providers: [UsersService, PermissionsService, CaslAbilityFactory],
  exports: [UsersService],
})
export class UsersModule {}
