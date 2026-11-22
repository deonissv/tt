import { isUnknownObject } from '@tt/utils';
import { parseJsonText } from './json';

/** The TTS save loader uses Json.Settings.MaxDepth = 1024. */
export const TTS_MAX_JSON_DEPTH = 1024;

type SaveRoot = Record<string, unknown> & { ObjectStates: unknown[] };
type DecodeResult = { ok: true; save: SaveRoot } | { ok: false; error: string };

/** Both entry points receive the original document, including extension fields. */
export function decodeSaveInput(input: unknown): DecodeResult {
  const decoded = typeof input === 'string' ? parseJsonText(input) : { ok: true as const, value: input };
  if (!decoded.ok) return { ok: false, error: `Not valid JSON: ${decoded.error}` };
  const save = decoded.value;
  if (!isSaveRoot(save)) return { ok: false, error: 'Expected a save object with an ObjectStates array' };

  // Track ancestors so cycles fail but shared references in object input are allowed.
  const ancestors = new WeakSet<object>();
  const stack: { value: object; depth: number; leaving: boolean }[] = [{ value: save, depth: 1, leaving: false }];
  while (stack.length) {
    const item = stack.pop()!;
    if (item.leaving) {
      ancestors.delete(item.value);
      continue;
    }
    if (item.depth > TTS_MAX_JSON_DEPTH) {
      return { ok: false, error: `JSON container depth exceeds TTS's ${TTS_MAX_JSON_DEPTH}-level save limit` };
    }
    if (ancestors.has(item.value)) return { ok: false, error: 'Cyclic input is not a JSON save' };
    ancestors.add(item.value);
    stack.push({ ...item, leaving: true });
    const children: unknown[] = Object.values(item.value);
    for (const child of children) {
      if (typeof child === 'object' && child !== null)
        stack.push({ value: child, depth: item.depth + 1, leaving: false });
    }
  }
  return { ok: true, save };
}

function isSaveRoot(value: unknown): value is SaveRoot {
  return isUnknownObject(value) && Array.isArray(value.ObjectStates);
}
