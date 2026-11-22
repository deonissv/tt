import { z } from 'zod';

/**
 * Mark string schemas that hold remote asset URLs.
 * The asset collector in @tt/tts-parser reads these markers to find asset fields.
 */
const urlMarked = new WeakSet<object>();

export function urlString(): z.ZodString {
  const schema = z.string();
  urlMarked.add(schema);
  return schema;
}

export function isUrlSchema(schema: object): boolean {
  return urlMarked.has(schema);
}
