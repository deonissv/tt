export { TTSParser } from './tts-parser';
export { parseTtsSave, serializeTtsSave, type ParseInputOptions } from './parse';
export { discriminateObjectKind, type TtsObjectKind, type TtsObjectKindResult } from './kinds';
export { collectAssetRefs } from './assets';
export type {
  TtsAssetRef,
  TtsParseResult,
  TtsParseWarning,
  TtsSerializeOptions,
  TtsWarningCode,
  TtsWarningSeverity,
} from './types';
