import { CreateBox } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import { MimeType } from '@tt/mime-resolver';
import { ActorType, type CardState } from '@tt/states';
import { getPhSim } from '../../../test/testUtils';
import { initHavok } from '../../utils';
import { Card } from './card';

const state: CardState = {
  guid: 'card',
  name: 'Card',
  type: ActorType.CARD,
  faceURL: 'face.png',
  backURL: 'back.png',
  cols: 10,
  rows: 7,
  sequence: 42,
};
// A square PNG. Header dimensions suffice for public geometry.
const png =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=';

describe('server card geometry', () => {
  it('spawns after the metadata deadline even when the image request never settles', async () => {
    const sim = getPhSim();
    vi.useFakeTimers();
    try {
      vi.spyOn(Loader, 'loadMesh').mockResolvedValue(CreateBox('card', {}, sim.scene));
      vi.spyOn(Loader, 'fetchFile').mockImplementation(
        () =>
          new Promise(() => {
            /* Request stays pending. */
          }),
      );
      const pending = Card.fromState(state);
      await vi.advanceTimersByTimeAsync(5_000);
      const actor = await pending;
      expect(actor).not.toBeNull();
      expect(actor!.toState().faceAspectRatio).toBeUndefined();
    } finally {
      vi.useRealTimers();
      sim.scene.dispose();
      sim.engine.dispose();
    }
  });

  it('keeps a loading card in the scene that owns its mesh when another room starts', async () => {
    const first = getPhSim();
    let second: ReturnType<typeof getPhSim> | undefined;
    try {
      const mesh = CreateBox('card', {}, first.scene);
      vi.spyOn(Loader, 'loadMesh').mockResolvedValue(mesh);
      let finish!: (value: { url: string; mime: MimeType }) => void;
      vi.spyOn(Loader, 'fetchFile').mockImplementation(() => new Promise(resolve => (finish = resolve)));
      const loading = Card.fromState(state);
      await vi.waitFor(() => expect(Loader.fetchFile).toHaveBeenCalled());
      second = getPhSim();
      finish({ url: png, mime: MimeType.PNG });
      const actor = await loading;
      expect(actor!.getScene()).toBe(first.scene);
      expect(first.scene.actors).toContain(actor);
      expect(second.scene.actors).not.toContain(actor);
    } finally {
      first.scene.dispose();
      first.engine.dispose();
      second?.scene.dispose();
      second?.engine.dispose();
    }
  });

  it.each(['missing', 'rejected', 'invalid'] as const)('spawns even when face metadata is %s', async failure => {
    const sim = getPhSim();
    try {
      vi.spyOn(Loader, 'loadMesh').mockResolvedValue(CreateBox('card', {}, sim.scene));
      const fetch = vi.spyOn(Loader, 'fetchFile');
      if (failure === 'missing') fetch.mockResolvedValue(null);
      else if (failure === 'rejected') fetch.mockRejectedValue(new Error('unavailable'));
      else fetch.mockResolvedValue({ url: 'data:text/plain;base64,bm90IGFuIGltYWdl', mime: MimeType.PNG });
      const actor = await Card.fromState(state);
      expect(actor).not.toBeNull();
      expect(actor!.toState().faceAspectRatio).toBeUndefined();
    } finally {
      sim.scene.dispose();
      sim.engine.dispose();
    }
  });

  beforeAll(async () => {
    await initHavok();
  });
  afterEach(() => vi.restoreAllMocks());
  it('publishes the original face-cell aspect independently of face atlas coordinates', async () => {
    const sim = getPhSim();
    try {
      vi.spyOn(Loader, 'loadMesh').mockResolvedValue(CreateBox('card', {}, sim.scene));
      vi.spyOn(Loader, 'fetchFile').mockResolvedValue({ url: png, mime: MimeType.PNG });
      const actor = await Card.fromState(state);
      expect(actor!.toState()).toMatchObject({ faceURL: 'face.png', cols: 10, rows: 7 });
      expect(actor!.toState().faceAspectRatio).toBeCloseTo(0.7);
      expect(state).not.toHaveProperty('faceAspectRatio');
    } finally {
      sim.scene.dispose();
      sim.engine.dispose();
    }
  });
});
