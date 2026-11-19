import { MimeType } from '@tt/mime-resolver';
import { Loader, type FileFetcher } from '../src';

type FetchedFile = NonNullable<Awaited<ReturnType<FileFetcher>>>;

const fetchedFile = (url: string): FetchedFile => ({ url, mime: MimeType.OBJ });

describe('Loader.cachedFileFetcher', () => {
  afterEach(() => {
    Loader.Assets.clear();
  });

  it('fetches each URL once and replays the same result', async () => {
    const fetcher = vi.fn((url: string) => Promise.resolve(fetchedFile(url)));
    const cached = Loader.cachedFileFetcher(fetcher);

    const first = await cached('a.obj');
    const second = await cached('a.obj');

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  it('keeps different URLs separate', async () => {
    const fetcher = vi.fn((url: string) => Promise.resolve(fetchedFile(url)));
    const cached = Loader.cachedFileFetcher(fetcher);

    await Promise.all([cached('a.obj'), cached('b.obj')]);

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('does not cache a null answer so the next call can retry', async () => {
    let fail = true;
    const fetcher = vi.fn(() => Promise.resolve(fail ? null : fetchedFile('a.obj')));
    const cached = Loader.cachedFileFetcher(fetcher);

    await expect(cached('a.obj')).resolves.toBeNull();
    fail = false;
    await expect(cached('a.obj')).resolves.toEqual(fetchedFile('a.obj'));

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('does not cache a rejected fetch so the next call can retry', async () => {
    let fail = true;
    const fetcher = vi.fn(() =>
      fail ? Promise.reject(new Error('network down')) : Promise.resolve(fetchedFile('a.obj')),
    );
    const cached = Loader.cachedFileFetcher(fetcher);

    await expect(cached('a.obj')).rejects.toThrow('network down');
    fail = false;
    await expect(cached('a.obj')).resolves.toEqual(fetchedFile('a.obj'));

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('shares one in-flight promise for concurrent requests', async () => {
    const fetcher = vi.fn(
      () =>
        new Promise<FetchedFile | null>(resolve => {
          setTimeout(() => resolve(fetchedFile('a.obj')), 5);
        }),
    );
    const cached = Loader.cachedFileFetcher(fetcher);

    const [a, b] = await Promise.all([cached('a.obj'), cached('a.obj')]);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(b).toBe(a);
  });
  it('clears successful results when a new fetcher is registered', async () => {
    const first = vi.fn(() => Promise.resolve(fetchedFile('old.obj')));
    Loader.registerFileFetcher(Loader.cachedFileFetcher(first));
    await Loader.fetchFile('a.obj');

    const next = vi.fn(() => Promise.resolve(fetchedFile('new.obj')));
    Loader.registerFileFetcher(Loader.cachedFileFetcher(next));
    expect(Loader.Assets.size).toBe(0);
    await expect(Loader.fetchFile('a.obj')).resolves.toEqual(fetchedFile('new.obj'));
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('fetches again after cleanup without restoring a late successful result', async () => {
    let finish!: (file: FetchedFile) => void;
    const fetcher = vi.fn(
      () =>
        new Promise<FetchedFile>(resolve => {
          finish = resolve;
        }),
    );
    const cached = Loader.cachedFileFetcher(fetcher);
    const pending = cached('a.obj');
    Loader.Assets.clear();
    finish(fetchedFile('a.obj'));
    await pending;
    expect(Loader.Assets.size).toBe(0);
    const next = cached('a.obj');
    finish(fetchedFile('a.obj'));
    await next;
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it.each(['null', 'rejection'])('does not evict a new session request after an old %s failure', async failure => {
    let finish!: (file: FetchedFile | null) => void;
    let fail!: (error: Error) => void;
    const cached = Loader.cachedFileFetcher(
      () =>
        new Promise<FetchedFile | null>((resolve, reject) => {
          finish = resolve;
          fail = reject;
        }),
    );
    const old = cached('a.obj');
    const outcome = old.catch(() => null);
    const finishOld = finish;
    const failOld = fail;
    Loader.Assets.clear();
    const current = cached('a.obj');
    if (failure === 'null') finishOld(null);
    else failOld(new Error('old request failed'));
    await outcome;
    expect(cached('a.obj')).toBe(current);
    finish(fetchedFile('a.obj'));
    await current;
  });
});
