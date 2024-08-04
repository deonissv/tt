import { Injectable, Logger, StreamableFile } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  async load(url: string): Promise<StreamableFile | null> {
    try {
      this.logger.log(`Proxing: ${url}`);
      const response = await fetch(url).catch((e: Error) => {
        this.logger.error(`Proxing ${url} failed - fetching: ${e.message}`);
      });

      if (!response) return null;

      if (!response.ok) {
        this.logger.error(`Proxing ${url} failed - response: ${response.statusText}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer().catch((e: Error) => {
        this.logger.error(`Proxing ${url} failed - reading arrayBuffer: ${e.message}`);
      });
      if (!arrayBuffer) return null;

      this.logger.log(`Proxied: ${url}`);

      const buffer = new Uint8Array(arrayBuffer);
      return new StreamableFile(buffer);
    } catch (e) {
      this.logger.error(`Proxing ${url} failed - Unknow error: ${e instanceof Error ? e.message : String(e)}`);
      return null;
    }
  }
}
