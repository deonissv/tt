import type { ConfigService } from '@nestjs/config';
import { MimeResolver, MimeType } from '@tt/mime-resolver';
import { vi } from 'vitest';
import { FileLoaderService } from './file-loader.service';

describe('FileLoaderService', () => {
  let service: FileLoaderService;

  beforeEach(() => {
    service = new FileLoaderService({
      getOrThrow: () => 'http://example.com',
    } as unknown as ConfigService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully load and cache a file', async () => {
    const url = 'http://example.com/file.obj';
    const arrayBuffer = new ArrayBuffer(8);
    const b64 = 'data:;base64,AAAAAAAAAAA=';

    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(arrayBuffer),
    });

    vi.spyOn(MimeResolver, 'getMime').mockReturnValue(MimeType.OBJ);

    const result = await service.load(url);

    expect(result).toEqual({ url: b64, mime: MimeType.OBJ });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(service.Assets.has(url)).toBe(true);
  });

  it('should throw an error when the file cannot be fetched', async () => {
    const url = 'http://example.com/file.obj';

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(service.load(url)).rejects.toThrow(`Failed to load file: ${url}`);
    expect(global.fetch).toHaveBeenCalledTimes(5);
    expect(service.Assets.has(url)).toBe(false);
  });

  it('should use the cache for subsequent requests', async () => {
    const url = 'http://example.com/file.obj';
    const arrayBuffer = new ArrayBuffer(8);

    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(arrayBuffer),
    });

    vi.spyOn(MimeResolver, 'getMime').mockReturnValue(MimeType.OBJ);

    await service.load(url);
    await service.load(url);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(service.Assets.has(url)).toBe(true);
  });

  it('should handle multiple concurrent requests for the same file', async () => {
    const url = 'http://example.com/file.obj';
    const arrayBuffer = new ArrayBuffer(8);
    const b64 = 'data:;base64,AAAAAAAAAAA=';

    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(arrayBuffer),
    });

    vi.spyOn(MimeResolver, 'getMime').mockReturnValue(MimeType.OBJ);

    const [result1, result2] = await Promise.all([service.load(url), service.load(url)]);

    expect(result1).toEqual({ url: b64, mime: MimeType.OBJ });
    expect(result2).toEqual({ url: b64, mime: MimeType.OBJ });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(service.Assets.has(url)).toBe(true);
  });

  it('should retry fetching the file up to the maximum attempts', async () => {
    const url = 'http://example.com/file.obj';

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(service.load(url)).rejects.toThrow(`Failed to load file: ${url}`);
    expect(global.fetch).toHaveBeenCalledTimes(5);
    expect(service.Assets.has(url)).toBe(false);
  });

  it('should delete the cache entry if fetching fails', async () => {
    const url = 'http://example.com/file.obj';

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(service.load(url)).rejects.toThrow(`Failed to load file: ${url}`);
    expect(service.Assets.has(url)).toBe(false);
  });
});
