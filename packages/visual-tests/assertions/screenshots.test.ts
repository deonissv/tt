import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Page, TestInfo } from '@playwright/test';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  assertSnapshotComparisonMode,
  expectChangedCanvases,
  expectMatchingCanvases,
  expectStoredScreenshot,
} from './screenshots';
import { captureCanvases } from '../support/screenshots';

const compare = vi.hoisted(() => vi.fn());
const compareChanged = vi.hoisted(() => vi.fn());
const quiet = vi.hoisted(() => vi.fn());
vi.mock('@playwright/test', () => ({
  expect: () => ({
    toHaveCount: quiet,
    toHaveScreenshot: compare,
    not: { toHaveScreenshot: compareChanged },
  }),
}));
const temporary: string[] = [];
afterEach(() => {
  vi.resetAllMocks();
  for (const root of temporary.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

function fixture(updateSnapshots = 'none') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-screenshots-'));
  temporary.push(root);
  const info = {
    testId: 'id',
    config: { updateSnapshots },
    snapshotPath: (name: string) => path.join(root, name),
    attach: vi.fn().mockResolvedValue(undefined),
  } as unknown as TestInfo;
  const screenshot = vi.fn(({ path: target }: { path: string }) => {
    if (target) fs.writeFileSync(target, 'reference PNG');
    return Promise.resolve(Buffer.from('reference PNG'));
  });
  const move = vi.fn().mockResolvedValue(undefined);
  const page = {
    getByRole: vi.fn(),
    locator: () => ({ screenshot, boundingBox: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 1280, height: 720 }) }),
    screenshot,
    mouse: { move },
    evaluate: vi.fn().mockResolvedValue(undefined),
  } as unknown as Page;
  return { root, info, page, screenshot, move };
}

describe('cross-player screenshot assertions', () => {
  it('refreshes a moving reference before comparing either player against it', async () => {
    const { info, page, screenshot } = fixture();
    compare
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Reference changed while settling'))
      .mockResolvedValue(undefined);
    await expect(expectMatchingCanvases(info, 'extract', [page, page])).resolves.toBeUndefined();
    expect(screenshot).toHaveBeenCalledTimes(2);
  });
  it('clears pointer highlights and transient toasts before comparing images', async () => {
    const { info, page, move } = fixture();
    compare.mockImplementation(() => {
      expect(move).toHaveBeenCalledWith(10, 10);
      expect(quiet).toHaveBeenCalledWith(0);
    });
    await expectMatchingCanvases(info, 'rotate', [page, page]);
    expect(quiet).toHaveBeenCalledTimes(3);
  });
  it.each(['none', 'missing'])('compares every canvas in %s mode and removes its temporary reference', async mode => {
    const { root, info, page } = fixture(mode);
    await expectMatchingCanvases(info, 'roll', [page, page]);
    expect(compare).toHaveBeenCalledTimes(2);
    expect(fs.readdirSync(root)).toEqual([]);
  });

  it('propagates an image mismatch and still removes its temporary reference', async () => {
    const { root, info, page } = fixture();
    const error = new Error('Screenshot mismatch');
    compare.mockRejectedValue(error);
    await expect(expectMatchingCanvases(info, 'roll', [page, page], { timeout: 150 })).rejects.toBe(error);
    expect(fs.readdirSync(root)).toEqual([]);
  });

  it('keeps the reference while another comparison finishes after a mismatch', async () => {
    const { root, info, page } = fixture();
    const error = new Error('Screenshot mismatch');
    let finish!: () => void;
    compare
      .mockRejectedValueOnce(error)
      .mockImplementationOnce(() => new Promise<void>(resolve => (finish = resolve)))
      .mockRejectedValue(error);
    const comparing = expectMatchingCanvases(info, 'roll', [page, page], { timeout: 150 }).catch(
      (failure: unknown) => failure,
    );
    await vi.waitFor(() => expect(compare).toHaveBeenCalledTimes(2));
    expect(fs.readdirSync(root)).toHaveLength(1);
    finish();
    expect(await comparing).toBe(error);
    expect(fs.readdirSync(root)).toEqual([]);
  });

  it.each(['all', 'changed'])('prevents update mode %s from accepting a different player image', async mode => {
    const { info, page, screenshot } = fixture(mode);
    await expect(expectMatchingCanvases(info, 'roll', [page, page])).rejects.toThrow('--update-snapshots=none');
    expect(screenshot).not.toHaveBeenCalled();
  });

  it('still rejects different player images with the UI default Missing setting', async () => {
    const { root, info, page } = fixture('missing');
    const error = new Error('Screenshot mismatch');
    compare.mockRejectedValue(error);
    await expect(expectMatchingCanvases(info, 'roll', [page, page], { timeout: 150 })).rejects.toBe(error);
    expect(fs.readdirSync(root)).toEqual([]);
  });

  it('rejects a comparison without another player', async () => {
    const { info, page } = fixture();
    await expect(expectMatchingCanvases(info, 'roll', [page])).rejects.toThrow('two players');
  });
});

describe('development snapshot settings', () => {
  it.each(['none', 'missing'])('accepts %s without a manual UI preference change', mode => {
    const { info } = fixture(mode);
    expect(() => assertSnapshotComparisonMode(info)).not.toThrow();
  });

  it.each(['all', 'changed'])('rejects %s before development tests can update baselines', mode => {
    const { info } = fixture(mode);
    expect(() => assertSnapshotComparisonMode(info)).toThrow('--update-snapshots=none');
  });
});

describe('stored screenshot assertions', () => {
  it('compares an existing baseline with the UI default Missing setting', async () => {
    const { info, page } = fixture('missing');
    fs.writeFileSync(info.snapshotPath('stored.png'), 'reviewed baseline');
    const options = { clip: { x: 360, y: 220, width: 560, height: 400 }, maxDiffPixels: 100 };
    await expectStoredScreenshot(info, page, 'stored.png', options);
    expect(compare).toHaveBeenCalledWith('stored.png', options);
    expect(fs.readFileSync(info.snapshotPath('stored.png'), 'utf8')).toBe('reviewed baseline');
  });

  it('rejects an absent baseline before Missing mode can create it', async () => {
    const { root, info, page } = fixture('missing');
    await expect(expectStoredScreenshot(info, page, 'absent.png')).rejects.toThrow('Missing visual baseline');
    expect(compare).not.toHaveBeenCalled();
    expect(fs.readdirSync(root)).toEqual([]);
  });

  it('propagates an existing baseline mismatch in Missing mode', async () => {
    const { info, page } = fixture('missing');
    fs.writeFileSync(info.snapshotPath('stored.png'), 'reviewed baseline');
    const error = new Error('Screenshot mismatch');
    compare.mockRejectedValue(error);
    await expect(expectStoredScreenshot(info, page, 'stored.png')).rejects.toBe(error);
    expect(fs.readFileSync(info.snapshotPath('stored.png'), 'utf8')).toBe('reviewed baseline');
  });

  it.each(['all', 'changed'])('preserves intentional baseline updates in %s mode', async mode => {
    const { info, page } = fixture(mode);
    await expectStoredScreenshot(info, page, 'new.png');
    expect(compare).toHaveBeenCalledWith('new.png', undefined);
  });
});

describe('visible action assertions', () => {
  it('finishes outstanding captures before propagating a screenshot failure', async () => {
    const { page, screenshot } = fixture();
    const error = new Error('first screenshot failed');
    let finish!: (value: Buffer) => void;
    screenshot.mockRejectedValueOnce(error).mockReturnValueOnce(new Promise(resolve => (finish = resolve)));
    const capturing = captureCanvases([page, page]).catch((failure: unknown) => failure);
    const finished = vi.fn();
    void capturing.then(finished);
    await vi.waitFor(() => expect(screenshot).toHaveBeenCalledTimes(2));
    expect(finished).not.toHaveBeenCalled();
    finish(Buffer.from('second image'));
    expect(await capturing).toBe(error);
  });

  it('captures each player and compares it against its own before image', async () => {
    const { root, info, page, screenshot } = fixture();
    const before = await captureCanvases([page, page]);
    await expectChangedCanvases(info, 'move', [page, page], before);
    expect(compareChanged).toHaveBeenCalledTimes(2);
    expect(screenshot.mock.calls[0][0]).toEqual(
      expect.objectContaining({ clip: { x: 1, y: 1, width: 1278, height: 718 } }),
    );
    expect(fs.readdirSync(root)).toEqual([]);
  });

  it('waits for every matcher before removing before images on failure', async () => {
    const { root, info, page } = fixture();
    const error = new Error('client 1 did not render move');
    let finish!: () => void;
    compareChanged.mockRejectedValueOnce(error).mockReturnValueOnce(new Promise<void>(resolve => (finish = resolve)));
    const checking = expectChangedCanvases(
      info,
      'move',
      [page, page],
      [Buffer.from('first'), Buffer.from('second')],
    ).catch((failure: unknown) => failure);
    await vi.waitFor(() => expect(compareChanged).toHaveBeenCalledTimes(2));
    expect(fs.readdirSync(root)).toHaveLength(2);
    finish();
    expect(await checking).toBe(error);
    expect(fs.readdirSync(root)).toEqual([]);
  });

  it('rejects a missing before image', async () => {
    const { info, page } = fixture();
    await expect(expectChangedCanvases(info, 'move', [page], [])).rejects.toThrow('before image');
    await expect(expectChangedCanvases(info, 'move', [], [])).rejects.toThrow('before image');
  });
});
