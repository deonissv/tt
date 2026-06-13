import { forwardRef, Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [CaslModule, forwardRef(() => import('../auth/auth.module').then(m => m.AuthModule))],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
