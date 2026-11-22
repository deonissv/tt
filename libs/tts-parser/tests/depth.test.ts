import { parseTtsSave, serializeTtsSave, TTSParser } from '../src';
import { TTS_MAX_JSON_DEPTH } from '../src/lib/input';
import { baseSave } from './fixtures';

function nestedBags(containerDepth: number, field = 'ContainedObjects') {
  const save = baseSave();
  const leaf = save.ObjectStates[0];
  let object = leaf;
  // Root object + ObjectStates array + object + its Transform object = 4 containers.
  // Each bag adds a ContainedObjects array and an object, i.e. two containers.
  for (let depth = 4; depth < containerDepth; depth += 2) {
    object = { ...leaf, Name: 'Bag', [field]: field === 'States' ? { '1': object } : [object] };
  }
  save.ObjectStates = [object];
  return { save, leaf };
}

describe('TTS JSON container depth', () => {
  it.each(['ContainedObjects', 'States', 'ChildObjects'])(
    'validates recursive %s at depth 1024 from text and object input',
    field => {
      const { save } = nestedBags(TTS_MAX_JSON_DEPTH, field);
      for (const input of [save, JSON.stringify(save)]) {
        const result = parseTtsSave(input, { mode: 'strict' });
        expect(result.ok).toBe(true);
        expect(result.warnings).toEqual([]);
      }
    },
  );

  it('reports a schema error in the deepest accepted object', () => {
    const { save, leaf } = nestedBags(TTS_MAX_JSON_DEPTH);
    leaf.Locked = 'invalid';
    const result = parseTtsSave(JSON.stringify(save));
    expect(result.ok).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].path).toMatch(/^ObjectStates\[0\].*\.Locked$/);
    expect(parseTtsSave(save, { mode: 'strict' }).ok).toBe(false);
  });

  it('rejects saves above the TTS depth limit in both modes', () => {
    const { save } = nestedBags(TTS_MAX_JSON_DEPTH + 2);
    for (const mode of ['tolerant', 'strict'] as const) {
      const result = parseTtsSave(save, { mode });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain('1024');
    }
  });

  it('includes unknown extension containers in the JSON depth limit', () => {
    let extra: unknown = 0;
    for (let depth = 1; depth < TTS_MAX_JSON_DEPTH; depth++) extra = [extra];
    const save = { SaveName: 'depth', ObjectStates: [], Extra: extra };
    expect(parseTtsSave(JSON.stringify(save), { mode: 'strict' }).ok).toBe(true);
    save.Extra = [extra];
    expect(parseTtsSave(save).ok).toBe(false);
    expect(parseTtsSave(JSON.stringify(save)).ok).toBe(false);
    expect(TTSParser.parse(JSON.stringify(save))).toBeNull();
    expect(TTSParser.errors).toEqual(expect.arrayContaining([expect.stringContaining('1024')]));
    // TTS's writer has no matching depth cap; only loading is limited.
    expect(serializeTtsSave(save)).toBe(JSON.stringify(save));
  });

  it('does not count bracket characters inside strings as containers', () => {
    const text = JSON.stringify({ SaveName: '[{\\"'.repeat(TTS_MAX_JSON_DEPTH), ObjectStates: [] });
    expect(parseTtsSave(text, { mode: 'strict' }).ok).toBe(true);
  });

  it('retains native JSON syntax errors with their source location', () => {
    const result = parseTtsSave('{"SaveName":"bad\nstring","ObjectStates":[]}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/control character.*position.*line.*column/i);
  });
});
