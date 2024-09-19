import { Global, Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { FileLoaderService } from './file-loader.service';

@Global()
@Module({
  providers: [UsersService, FileLoaderService],
  exports: [FileLoaderService],
})
export class FileLoaderModule {}
