import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isObject, isString } from '@tt/utils';

@Injectable()
export class AssetUrlService {
  private readonly staticHost: string;
  private readonly proxyHost: string;

  constructor(private readonly configService: ConfigService) {
    this.staticHost = this.configService.getOrThrow<string>('VITE_STATIC_HOST');
    const apiHost = this.configService.getOrThrow<string>('VITE_API_HOST');
    this.proxyHost = `${apiHost}/proxy`;
  }

  getAssetURL(url: string, roomCode: string): string {
    const uri = encodeURIComponent(url);
    return `${this.proxyHost}/${roomCode}/${uri}`;
  }

  patchStateURLs<T>(item: T, roomCode: string): T {
    if (
      isString(item) &&
      item.startsWith('http') &&
      !item.startsWith(`${this.staticHost}/assets`) &&
      !item.startsWith(this.proxyHost)
    ) {
      return this.getAssetURL(item, roomCode) as T;
    } else if (Array.isArray(item)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return item.map(i => this.patchStateURLs(i, roomCode)) as T;
    } else if (isObject(item)) {
      return Object.keys(item).reduce(
        (acc, key) => ({
          ...acc,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          [key]: this.patchStateURLs(item[key], roomCode),
        }),
        {},
      ) as T;
    }
    return item;
  }
}
