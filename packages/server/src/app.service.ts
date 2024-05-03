import { Injectable, Logger, StreamableFile } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async load(url: string): Promise<StreamableFile | null> {
    try {
      const response = await fetch(url);
      const buffer = new Uint8Array(await response.arrayBuffer());

      this.logger.log(`Proxied: ${url}`);
      return new StreamableFile(buffer);
    } catch (e) {
      this.logger.error(`Proxing ${url} failed: ${e.message}`);
      return null;
    }
  }
}
