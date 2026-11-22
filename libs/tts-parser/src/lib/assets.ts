import { ASSET_DTOS, type Shape } from './asset-spec';
import { TTS_MAX_JSON_DEPTH } from './input';
import type { TtsAssetRef } from './types';

/**
 * Collect remote asset URLs, including meshes, textures, colliders, deck faces and backs,
 * images, assetbundles, PDFs, audio, LUTs, tables and skies.
 * Use the validation schemas to find asset fields.
 */
export function collectAssetRefs(save: unknown, maxDepth = TTS_MAX_JSON_DEPTH): TtsAssetRef[] {
  const assets: TtsAssetRef[] = [];
  walkDtoForAssets(save, 'SaveState', undefined, assets, 0, maxDepth);
  return assets;
}

function walkDtoForAssets(
  value: unknown,
  name: string,
  objectGuid: string | undefined,
  out: TtsAssetRef[],
  depth: number,
  maxDepth: number,
): void {
  if (depth > maxDepth || !isPlainObject(value)) return;
  const spec = ASSET_DTOS[name as keyof typeof ASSET_DTOS];
  if (!spec) return;

  const guid = name === 'ObjectState' && typeof value.GUID === 'string' ? value.GUID : objectGuid;

  for (const [key, field] of Object.entries(spec)) {
    const child = value[key];
    if (child === undefined || child === null) continue;
    if (field.url) {
      if (typeof child === 'string' && isRemoteUrl(child)) {
        out.push({ url: child, source: `${name}.${key}`, objectGuid: guid });
      }
      continue;
    }
    walkShapeForAssets(child, field.shape, guid, out, depth + 1, maxDepth);
  }
}

function walkShapeForAssets(
  value: unknown,
  shape: Shape,
  objectGuid: string | undefined,
  out: TtsAssetRef[],
  depth: number,
  maxDepth: number,
): void {
  if (depth > maxDepth) return;
  switch (shape.t) {
    case 'dto':
      walkDtoForAssets(value, shape.name, objectGuid, out, depth, maxDepth);
      return;
    case 'array':
      if (Array.isArray(value)) {
        for (const item of value) walkShapeForAssets(item, shape.of, objectGuid, out, depth + 1, maxDepth);
      }
      return;
    case 'record':
      if (isPlainObject(value)) {
        for (const item of Object.values(value)) {
          walkShapeForAssets(item, shape.of, objectGuid, out, depth + 1, maxDepth);
        }
      }
      return;
    default:
      return;
  }
}

function isRemoteUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('steam://');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
