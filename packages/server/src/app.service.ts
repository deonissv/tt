import { Injectable, StreamableFile } from '@nestjs/common';

@Injectable()
export class AppService {
  async load(url: string) {
    const response = await fetch(url);
    const buffer = new Uint8Array(await response.arrayBuffer());
    return new StreamableFile(buffer);
  }
}
