interface ImagePixels {
  width: number;
  height: number;
  data: ArrayLike<number>;
}

type ScreenPoint = readonly [number, number];

interface Component {
  pixels: number[];
  center: ScreenPoint;
}

function foregroundMask(image: ImagePixels, background: ImagePixels): Uint8Array {
  if (Math.abs(image.width / image.height - background.width / background.height) > 0.01) {
    throw new Error('Visual targeting requires the same canvas aspect ratio as the empty-table reference');
  }
  const mask = new Uint8Array(image.width * image.height);
  // Ignore the toolbar and performance indicator above the table.
  const top = Math.ceil(image.height * (64 / 720));
  for (let y = top; y < image.height - 1; y++) {
    for (let x = 1; x < image.width - 1; x++) {
      const pixel = y * image.width + x;
      const reference =
        Math.floor((y * background.height) / image.height) * background.width +
        Math.floor((x * background.width) / image.width);
      for (let channel = 0; channel < 3; channel++) {
        if (Math.abs(image.data[pixel * 4 + channel] - background.data[reference * 4 + channel]) > 12) {
          mask[pixel] = 1;
          break;
        }
      }
    }
  }
  return mask;
}

function components(mask: Uint8Array, width: number): Component[] {
  const found: Component[] = [];
  for (let start = 0; start < mask.length; start++) {
    if (mask[start] !== 1) continue;
    const pixels = [start];
    mask[start] = 2;
    let xTotal = 0;
    let yTotal = 0;
    for (const pixel of pixels) {
      const x = pixel % width;
      xTotal += x;
      yTotal += Math.floor(pixel / width);
      for (const neighbor of [pixel - width, pixel + width, pixel - 1, pixel + 1]) {
        if (neighbor < 0 || neighbor >= mask.length || mask[neighbor] !== 1) continue;
        if (Math.abs((neighbor % width) - x) > 1) continue;
        mask[neighbor] = 2;
        pixels.push(neighbor);
      }
    }
    if (pixels.length >= 16) {
      found.push({ pixels, center: [xTotal / pixels.length, yTotal / pixels.length] });
    }
  }
  return found;
}

function interiorPoint(mask: Uint8Array, width: number, component: Component): ScreenPoint {
  const distance = new Uint16Array(mask.length);
  for (let pixel = 0; pixel < mask.length; pixel++) {
    if (!mask[pixel]) continue;
    distance[pixel] = 1 + Math.min(pixel % width ? distance[pixel - 1] : 0, distance[pixel - width] ?? 0);
  }
  for (let pixel = mask.length - 1; pixel >= 0; pixel--) {
    if (!mask[pixel]) continue;
    distance[pixel] = Math.min(
      distance[pixel],
      1 + Math.min((pixel + 1) % width ? distance[pixel + 1] : 0, distance[pixel + width] ?? 0),
    );
  }
  const [centerX, centerY] = component.center;
  let best = component.pixels[0];
  const centerDistance = (pixel: number) => Math.hypot((pixel % width) - centerX, Math.floor(pixel / width) - centerY);
  for (const pixel of component.pixels) {
    if (
      distance[pixel] > distance[best] ||
      (distance[pixel] === distance[best] && centerDistance(pixel) < centerDistance(best))
    )
      best = pixel;
  }
  return [(best % width) + 0.5, Math.floor(best / width) + 0.5];
}

export function findVisualTarget(image: ImagePixels, background: ImagePixels, anchor?: ScreenPoint): ScreenPoint {
  const mask = foregroundMask(image, background);
  const candidates = components(mask, image.width);
  if (candidates.length === 0) throw new Error('No visible actor differs from the empty-table reference');
  candidates.sort((left, right) =>
    anchor
      ? Math.hypot(left.center[0] - anchor[0], left.center[1] - anchor[1]) -
        Math.hypot(right.center[0] - anchor[0], right.center[1] - anchor[1])
      : right.pixels.length - left.pixels.length,
  );
  const selected = candidates[0];
  if (anchor && Math.hypot(selected.center[0] - anchor[0], selected.center[1] - anchor[1]) > image.width / 8) {
    throw new Error('No visible actor near its recorded screen target');
  }
  return interiorPoint(mask, image.width, selected);
}
