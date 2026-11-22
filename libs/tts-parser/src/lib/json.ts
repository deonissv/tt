/**
 * JSON text handling for the TTS save format.
 *
 * Newtonsoft.Json writes non-finite floats as "Infinity", "-Infinity" and "NaN" strings.
 * Accept a leading UTF-8 BOM. Store unsafe integers as bigint and write them back as
 * JSON numbers so numeric Steam IDs keep all their digits.
 * Requires native JSON.parse source context and JSON.rawJSON support in Node 22+.
 */

const BOM = '﻿';

/** Strip a leading UTF-8 BOM if present. */
export function stripBom(text: string): string {
  return text.startsWith(BOM) ? text.slice(1) : text;
}

export type JsonTextParseResult = { ok: true; value: unknown } | { ok: false; error: string };

/** Parse save text, accepting a leading BOM but rejecting invalid JSON syntax. */
export function parseJsonText(text: string): JsonTextParseResult {
  try {
    return {
      ok: true,
      value: JSON.parse(stripBom(text), reviveNumber),
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Keep ordinary numbers numeric, but retain unsafe integer tokens exactly. */
function reviveNumber(_key: string, value: unknown, context?: { source?: string }): unknown {
  if (typeof value !== 'number') return value;
  if (context?.source === undefined) {
    throw new Error('JSON.parse source context support is required to preserve numeric precision');
  }
  const token = context.source;
  return /^-?\d+$/.test(token) && !Number.isSafeInteger(value) ? BigInt(token) : value;
}

/** Replacer that emits non-finite floats the way Newtonsoft.Json does. */
export function nonFiniteFloatReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    // The project's ES2022 typings do not include this newer native JSON API.
    const json = JSON as JSON & { rawJSON(text: string): unknown };
    return json.rawJSON(value.toString());
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 'NaN';
    if (value === Number.POSITIVE_INFINITY) return 'Infinity';
    if (value === Number.NEGATIVE_INFINITY) return '-Infinity';
  }
  return value;
}

/** Serialize a parsed save as JSON that TTS can load. */
export function stringifyJson(value: unknown, pretty?: boolean): string {
  return JSON.stringify(value, nonFiniteFloatReplacer, pretty ? 2 : undefined);
}
