import { AssetUrlService } from './asset-url.service';

const STATIC_HOST = 'http://static.host';
const API_HOST = 'http://api.host';
const PROXY_HOST = `${API_HOST}/proxy`;
const ROOM_CODE = 'test-room';

function makeService() {
  const configService = {
    getOrThrow: (key: string) => {
      if (key === 'VITE_STATIC_HOST') return STATIC_HOST;
      if (key === 'VITE_API_HOST') return API_HOST;
      throw new Error(`Unknown config key: ${key}`);
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return new AssetUrlService(configService as any);
}

describe('AssetUrlService', () => {
  let service: AssetUrlService;

  beforeEach(() => {
    service = makeService();
  });

  describe('getAssetURL', () => {
    it('should return proxied and encoded URL', () => {
      const url = 'http://example.com/image.png';
      expect(service.getAssetURL(url, ROOM_CODE)).toBe(`${PROXY_HOST}/${ROOM_CODE}/${encodeURIComponent(url)}`);
    });
  });

  describe('patchStateURLs', () => {
    it('should proxy an http string URL', () => {
      const url = 'http://example.com/image.png';
      expect(service.patchStateURLs(url, ROOM_CODE)).toBe(service.getAssetURL(url, ROOM_CODE));
    });

    it('should proxy http URLs in an array', () => {
      const urls = ['http://example.com/a.png', 'http://example.com/b.png'];
      expect(service.patchStateURLs(urls, ROOM_CODE)).toEqual(urls.map(u => service.getAssetURL(u, ROOM_CODE)));
    });

    it('should proxy http URLs in an object', () => {
      const input = { image: 'http://example.com/image.png' };
      expect(service.patchStateURLs(input, ROOM_CODE)).toEqual({
        image: service.getAssetURL(input.image, ROOM_CODE),
      });
    });

    it('should proxy http URLs in nested objects', () => {
      const input = { nested: { image: 'http://example.com/image.png' } };
      expect(service.patchStateURLs(input, ROOM_CODE)).toEqual({
        nested: { image: service.getAssetURL(input.nested.image, ROOM_CODE) },
      });
    });

    it('should not modify non-string primitives', () => {
      expect(service.patchStateURLs(123 as any, ROOM_CODE)).toBe(123);
    });

    it('should not proxy non-http strings', () => {
      expect(service.patchStateURLs('image.png', ROOM_CODE)).toBe('image.png');
    });

    it('should not proxy static host asset URLs', () => {
      const url = `${STATIC_HOST}/assets/image.png`;
      expect(service.patchStateURLs(url, ROOM_CODE)).toBe(url);
    });

    it('should not re-proxy already proxied URLs', () => {
      const proxied = service.getAssetURL('http://example.com/image.png', ROOM_CODE);
      expect(service.patchStateURLs(proxied, ROOM_CODE)).toBe(proxied);
    });

    it('should handle complex nested structures', () => {
      const url = 'http://example.com/image.png';
      const staticUrl = `${STATIC_HOST}/assets/image.png`;
      const proxied = service.getAssetURL(url, ROOM_CODE);

      const input = {
        str: url,
        staticAsset: staticUrl,
        alreadyProxied: proxied,
        arr: [url, staticUrl, proxied],
        nested: { image: url },
      };

      expect(service.patchStateURLs(input, ROOM_CODE)).toEqual({
        str: service.getAssetURL(url, ROOM_CODE),
        staticAsset: staticUrl,
        alreadyProxied: proxied,
        arr: [service.getAssetURL(url, ROOM_CODE), staticUrl, proxied],
        nested: { image: service.getAssetURL(url, ROOM_CODE) },
      });
    });
  });
});
