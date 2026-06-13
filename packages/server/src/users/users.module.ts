import { Module } from '@nestjs/common';
import { CaslModule } from '../casl/casl.module';
import { TokenModule } from '../token/token.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [CaslModule, TokenModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
