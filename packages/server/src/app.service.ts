import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { FileLoaderService } from './file-loader/file-loader.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger('AppService');

  constructor(private readonly fileLoaderService: FileLoaderService) {}

  async b64tobuffer(b64: string): Promise<Uint8Array> {
    const res = await fetch(b64);
    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  }

  async load(url: string): Promise<StreamableFile | null> {
    const fetchedFile = await this.fileLoaderService.load(url);
    if (!fetchedFile) {
      this.logger.error(`Failer to load ${url}`);
      return null;
    }
    const buffer = await this.b64tobuffer(fetchedFile.url).catch((e: Error) => {
      this.logger.error(`Failer to load ${url} - b64tobuffer: ${e.message}`);
    });
    if (!buffer) return null;
    return new StreamableFile(buffer);
  }
}
