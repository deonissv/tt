import { describe, expect, it } from 'vitest';
import { findVisualTarget } from './find-target';

const blank = (width = 80, height = 60) => ({
  width,
  height,
  data: new Uint8Array(width * height * 4),
});

function paint(image: ReturnType<typeof blank>, x: number, y: number, width: number, height: number, value = 200) {
  for (let row = y; row < y + height; row++) {
    for (let column = x; column < x + width; column++) {
      const pixel = (row * image.width + column) * 4;
      image.data.set([value, value, value, 255], pixel);
    }
  }
}

describe('screenshot targeting', () => {
  it('finds an interior point in the visible object', () => {
    const image = blank();
    paint(image, 20, 20, 20, 20);
    const [x, y] = findVisualTarget(image, blank());
    expect(x).toBeGreaterThan(28);
    expect(x).toBeLessThan(32);
    expect(y).toBeGreaterThan(28);
    expect(y).toBeLessThan(32);
  });

  it('uses the recorded screen anchor to distinguish objects', () => {
    const image = blank();
    paint(image, 10, 15, 30, 30);
    paint(image, 60, 25, 10, 10);
    const [x, y] = findVisualTarget(image, blank(), [65, 30]);
    expect(x).toBeGreaterThan(60);
    expect(x).toBeLessThan(70);
    expect(y).toBeGreaterThan(25);
    expect(y).toBeLessThan(35);
    expect(findVisualTarget(image, blank())[0]).toBeLessThan(40);
  });

  it('clicks inside a concave shape rather than its empty bounding-box center', () => {
    const image = blank();
    paint(image, 20, 20, 5, 20);
    paint(image, 20, 35, 20, 5);
    const [x, y] = findVisualTarget(image, blank());
    expect(image.data[(Math.floor(y) * image.width + Math.floor(x)) * 4]).toBe(200);
  });

  it('rejects missing actors and isolated pixel noise', () => {
    const image = blank();
    paint(image, 20, 20, 3, 3);
    expect(() => findVisualTarget(image, blank())).toThrow('No visible actor');
    expect(() => findVisualTarget(blank(), blank(), [30, 30])).toThrow('No visible actor');
  });

  it('does not select a different object far from the intended target', () => {
    const image = blank();
    paint(image, 60, 25, 10, 10);
    expect(() => findVisualTarget(image, blank(), [15, 30])).toThrow('No visible actor near');
  });

  it('ignores small renderer differences and the toolbar', () => {
    const image = blank();
    paint(image, 0, 0, 80, 4);
    paint(image, 20, 20, 20, 20, 11);
    expect(() => findVisualTarget(image, blank())).toThrow('No visible actor');
  });

  it('supports a canvas scaled with the same aspect ratio', () => {
    const image = blank(160, 120);
    paint(image, 50, 50, 20, 20);
    const [x, y] = findVisualTarget(image, blank());
    expect(x).toBeGreaterThan(50);
    expect(x).toBeLessThan(70);
    expect(y).toBeGreaterThan(50);
    expect(y).toBeLessThan(70);
  });
});
