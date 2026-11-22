import { CATAN, CHESS5, DEMO, MUNCHKIN } from '@tt/demo-saves';
import { parseTtsSave, serializeTtsSave } from '../src';

/** Embedded demo saves are real TTS exports; parse text input the way the client does. */
const DEMO_TEXTS: [string, string][] = [
  ['chess5', JSON.stringify(CHESS5.OBJ)],
  ['demo', JSON.stringify(DEMO.OBJ)],
  ['munchkin', JSON.stringify(MUNCHKIN.OBJ)],
  ['catan', JSON.stringify(CATAN.OBJ)],
];

describe('parseTtsSave — real TTS saves', () => {
  it.each(DEMO_TEXTS)('%s parses', (_name, text) => {
    const result = parseTtsSave(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.save.ObjectStates.length).toBeGreaterThan(0);
  });

  it.each(DEMO_TEXTS)('%s round-trips losslessly', (_name, text) => {
    const first = parseTtsSave(text);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const text2 = serializeTtsSave(first.save);
    const second = parseTtsSave(text2);
    expect(second.ok).toBe(true);
    if (!second.ok) return;

    expect(second.save).toEqual(first.save);
    // Parsing and serializing again must produce the same bytes.
    expect(serializeTtsSave(second.save)).toBe(text2);
  });

  it('chess5 collects the pawn mesh assets', () => {
    const result = parseTtsSave(JSON.stringify(CHESS5.OBJ));
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const meshUrls = result.assets.filter(a => a.source === 'CustomMeshState.MeshURL');
    expect(meshUrls.length).toBeGreaterThan(0);
    expect(meshUrls.some(a => a.url.includes('pastebin.com'))).toBe(true);
    expect(meshUrls.every(a => a.objectGuid !== undefined)).toBe(true);
  });
});
