import { NotFoundException, StreamableFile } from '@nestjs/common';
import { ProxyService } from './proxy.service';

describe('ProxyService HTTP failures', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('does not persist an upstream error and retries the next request', async () => {
    const service = new ProxyService();
    const write = vi.spyOn(service, 'writeToFile').mockResolvedValue(undefined);
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response('temporarily unavailable', { status: 503 }))
      .mockResolvedValueOnce(new Response('asset'));
    vi.stubGlobal('fetch', fetcher);

    await expect(service.proxy('room', 'https://example.com/asset')).rejects.toBeInstanceOf(NotFoundException);
    expect(write).not.toHaveBeenCalled();
    const result = await service.proxy('room', 'https://example.com/asset');
    expect(result).toBeInstanceOf(StreamableFile);
    expect(write).toHaveBeenCalledWith('room', 'https://example.com/asset', new TextEncoder().encode('asset'));
    expect(write).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
