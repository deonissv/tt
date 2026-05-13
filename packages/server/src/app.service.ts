import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { FileLoaderService } from './file-loader/file-loader.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger('AppService');

  constructor(private readonly fileLoaderService: FileLoaderService) {}

  async b64ToBuffer(b64: string) {
    const res = await fetch(b64);
    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  }

  async load(url: string): Promise<StreamableFile | null> {
    const fetchedFile = await this.fileLoaderService.load(url);
    if (!fetchedFile) {
      this.logger.error(`Failure to load ${url}`);
      return null;
    }
    const buffer = await this.b64ToBuffer(fetchedFile.url).catch((e: Error) => {
      this.logger.error(`Failure to load ${url} - b64ToBuffer: ${e.message}`);
    });
    if (!buffer) return null;
    return new StreamableFile(buffer);
  }
}
