import type { SaveState } from '@tt/tts-schema';

/** Parse issue severity. Tolerant mode returns the document even for errors. */
export type TtsWarningSeverity = 'info' | 'warning' | 'error';

/** Code identifying a parse issue. */
export type TtsWarningCode =
  /** A known field has the wrong JSON type. Keep its value unchanged. */
  | 'type-mismatch'
  /** A required schema field is missing. Older TTS saves may omit it. */
  | 'missing-required'
  /** A numeric enum field has an unknown value. Keep it unchanged. */
  | 'unknown-enum-value';

export interface TtsParseWarning {
  path: string; // e.g. "ObjectStates[3].ContainedObjects[0].CustomDeck.1.FaceURL"
  code: TtsWarningCode;
  severity: TtsWarningSeverity;
  message: string;
}

/** A remote resource referenced by a save, for the loader or proxy. */
export interface TtsAssetRef {
  url: string;
  /** Schema field the URL was found in, e.g. "CustomMesh.MeshURL". */
  source: string;
  /** GUID of the object that owns the asset. Undefined for assets belonging to the save. */
  objectGuid?: string;
}

export type TtsParseResult =
  | {
      ok: true;
      /**
       * The parsed document, typed as the TTS schema. Unknown keys keep their values.
       * Unsafe JSON integer tokens are bigint at runtime. Use serializeTtsSave to emit them.
       */
      save: SaveState;
      warnings: TtsParseWarning[];
      assets: TtsAssetRef[];
    }
  /** Invalid JSON/save root, cyclic or over-depth input, or schema errors in strict mode. */
  | {
      ok: false;
      error: string;
      warnings: TtsParseWarning[];
    };

export interface TtsSerializeOptions {
  /** Indent JSON with 2 spaces. TTS writes compact JSON. */
  pretty?: boolean;
}
