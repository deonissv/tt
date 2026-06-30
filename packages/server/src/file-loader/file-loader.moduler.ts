import { Global, Module } from '@nestjs/common';
import { FileLoaderService } from './file-loader.service';

@Global()
@Module({
  providers: [FileLoaderService],
  exports: [FileLoaderService],
})
export class FileLoaderModule {}
