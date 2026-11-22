import { SaveStateSchema } from '@tt/tts-schema';
import { parseTtsSave, TTSParser } from '@tt/tts-parser';
import * as assets from '../src/lib/assets';

function minimalSave(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    SaveName: 'wired',
    ObjectStates: [
      {
        GUID: 'aabbcc',
        Name: 'Card',
        Transform: { posX: 0, posY: 1, posZ: 0, rotX: 0, rotY: 0, rotZ: 0, scaleX: 1, scaleY: 1, scaleZ: 1 },
        Nickname: '',
        Description: '',
        GMNotes: '',
        AltLookAngle: { x: 0, y: 0, z: 0 },
        LayoutGroupSortIndex: 0,
        Value: 0,
        Locked: false,
        Grid: true,
        Snap: true,
        IgnoreFoW: false,
        MeasureMovement: false,
        DragSelectable: true,
        Autoraise: true,
        Sticky: true,
        Tooltip: true,
        GridProjection: false,
        XmlUI: '',
        CardID: 100,
        CustomDeck: {
          1: {
            FaceURL: 'http://example.com/f.png',
            BackURL: 'http://example.com/b.png',
            NumWidth: 1,
            NumHeight: 1,
            Type: 1,
            BackIsHidden: false,
            UniqueBack: false,
          },
        },
        ...overrides,
      },
    ],
  });
}

describe('TTSParser — compatible format layer wiring', () => {
  beforeEach(() => {
    TTSParser.reset();
  });

  it('parses a save carrying a UTF-8 BOM (previously rejected)', () => {
    const save = TTSParser.parse('﻿' + minimalSave());
    expect(save).not.toBeNull();
    expect(save?.actorStates?.length).toBe(1);
  });

  it('accepts unknown keys silently as TTS does', () => {
    const save = TTSParser.parse(minimalSave({ ModFutureKey: { a: 1 } }));
    expect(save).not.toBeNull();
    expect(TTSParser.errors).not.toContain('TTS_PARSE');
    expect(TTSParser.formatWarnings).toEqual([]);
  });

  it('only runs full validation on request and reserves asset collection for document inspection', () => {
    const text = minimalSave({ Nickname: false });
    const validate = vi.spyOn(SaveStateSchema, 'safeParse');
    const collect = vi.spyOn(assets, 'collectAssetRefs');
    try {
      const state = TTSParser.parse(text);
      expect(state?.actorStates).toHaveLength(1);
      expect(validate).not.toHaveBeenCalled();
      expect(TTSParser.formatWarnings).toEqual([]);

      expect(TTSParser.parse(text, { formatWarnings: true })).toEqual(state);
      expect(validate).toHaveBeenCalledTimes(1);
      const warnings = TTSParser.formatWarnings;
      expect(warnings).toContainEqual(expect.objectContaining({ path: 'ObjectStates[0].Nickname' }));
      expect(collect).not.toHaveBeenCalled();

      expect(parseTtsSave(text).warnings).toEqual(warnings);
      expect(collect).toHaveBeenCalledOnce();
      expect(TTSParser.parse(text)).toEqual(state);
      expect(TTSParser.formatWarnings).toEqual([]);
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('still rejects non-save input', () => {
    expect(TTSParser.parse('{"SaveName": "x"}')).toBeNull();
    expect(TTSParser.errors).toContain('TTS_PARSE');
    expect(TTSParser.parse('gibberish {')).toBeNull();
  });
});
