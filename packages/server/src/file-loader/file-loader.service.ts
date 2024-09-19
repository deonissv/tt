import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MimeDetector } from '@shared/playground';
import { MimeType } from '@shared/playground/Loader';
import { getB64URL, wait } from '@shared/utils';

export interface FetchedFile {
  url: string;
  mime: MimeType;
}

const RETRY_ATTEMPTS = 5;
const RETRY_DELAY = 300; // ms

@Injectable()
export class FileLoaderService {
  staticHost: string;

  constructor(private readonly configService: ConfigService) {
    this.staticHost = this.configService.getOrThrow<string>('STATIC_HOST');
  }

  static logger = new Logger('FileLoaderService');

  public Assets = new Map<string, Promise<FetchedFile | null>>();

  async _fetchFile(url: string): Promise<ArrayBuffer | null> {
    let attempts = 0;
    for (attempts = 0; attempts < RETRY_ATTEMPTS; attempts++) {
      try {
        await wait(attempts * RETRY_DELAY);
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer) {
          return arrayBuffer;
        }
      } catch (e) {
        FileLoaderService.logger.log(
          `Failed attempt to fetch: ${url} - ${(e as Error).message.toString().slice(0, 100)}`,
        );
      }
    }
    return null;
  }

  async fetchFile(url: string): Promise<FetchedFile | null> {
    if (!this.Assets.has(url)) {
      const promiseCb = async (): Promise<FetchedFile | null> => {
        const arrayBuffer = await this._fetchFile(url);
        if (arrayBuffer == null) {
          Logger.error(`Empty arrayBuffer: ${url}`);
          this.Assets.delete(url);
          return null;
        }

        const mime = MimeDetector.getMime(arrayBuffer) ?? MimeType.OBJ;
        const b64 = getB64URL(arrayBuffer);

        Logger.log(`Fetched file: ${url}`);
        return { url: b64, mime };
      };
      this.Assets.set(url, promiseCb());
    }
    return this.Assets.get(url)!;
  }

  async load(url: string): Promise<FetchedFile | null> {
    const patchedURL = url.replace('localhost', this.staticHost);
    const fetched = await this.fetchFile(patchedURL);
    if (!fetched) {
      throw new Error(`Failed to load file: ${patchedURL}`);
    }
    return fetched;
  }
}
