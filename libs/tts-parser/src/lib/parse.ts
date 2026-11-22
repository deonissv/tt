import { SaveStateSchema } from '@tt/tts-schema';
import type { SaveState } from '@tt/tts-schema';
import { collectAssetRefs } from './assets';
import { decodeSaveInput } from './input';
import { stringifyJson } from './json';
import type { TtsParseResult, TtsParseWarning, TtsSerializeOptions } from './types';

export interface ParseInputOptions {
  /** Tolerant mode keeps invalid fields and reports warnings. Strict mode rejects schema errors. */
  mode?: 'tolerant' | 'strict';
}

/**
 * Parse TTS save JSON and check it against the Zod schema.
 * Accept unknown fields without warnings, as TTS does. Tolerant mode keeps the original
 * document for export, including unknown, missing or invalid fields.
 * Strict mode rejects schema errors. Both modes reject invalid save roots, cycles
 * and JSON containers nested beyond TTS's 1024-level loading limit.
 */
export function parseTtsSave(input: unknown, options: ParseInputOptions = {}): TtsParseResult {
  const decoded = decodeSaveInput(input);
  if (!decoded.ok) return { ...decoded, warnings: [] };
  const warnings = getFormatWarnings(decoded.save);
  if (options.mode === 'strict' && warnings.length > 0) {
    return { ok: false, error: 'Save does not match the TTS schema', warnings };
  }
  return { ok: true, save: decoded.save as SaveState, warnings, assets: collectAssetRefs(decoded.save) };
}

export function getFormatWarnings(save: unknown): TtsParseWarning[] {
  // Zod's generated object parsers exhaust the JS stack on valid 1024-depth saves.
  // Its interpreted parser validates the same schema without those large JIT frames.
  const validated = SaveStateSchema.safeParse(save, { reportInput: true, jitless: true });
  return validated.success
    ? []
    : validated.error.issues.map(issue => ({
        path: issue.path
          .map((key, index) => (typeof key === 'number' ? `[${key}]` : `${index ? '.' : ''}${String(key)}`))
          .join(''),
        code:
          issue.input === undefined
            ? 'missing-required'
            : issue.code === 'invalid_value' && typeof issue.input === 'number'
              ? 'unknown-enum-value'
              : 'type-mismatch',
        severity: 'warning',
        message: issue.message,
      }));
}

/** Serialize non-finite floats and bigint IDs in the game's JSON format. */
export function serializeTtsSave(save: SaveState, options: TtsSerializeOptions = {}): string {
  return stringifyJson(save, options.pretty);
}
