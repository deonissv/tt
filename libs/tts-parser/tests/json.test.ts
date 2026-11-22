import { parseTtsSave, serializeTtsSave } from '../src';
import { parseJsonText, stringifyJson } from '../src/lib/json';

describe('native JSON integer preservation', () => {
  it.each(['76561198012345679', '-76561198012345679', '9007199254740992', '18446744073709551615', '1'.repeat(400)])(
    'preserves the integer token %s through save round-trips',
    token => {
      const text = `{"ObjectStates":[],"VectorLines":[{"OwnerSteamID":${token}}]}`;
      const result = parseTtsSave(text);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.warnings.filter(w => w.code === 'type-mismatch')).toEqual([]);
      expect(result.save.VectorLines?.[0].OwnerSteamID).toBe(BigInt(token));
      expect(serializeTtsSave(result.save)).toBe(text);
      const second = parseTtsSave(serializeTtsSave(result.save, { pretty: true }));
      expect(second.ok).toBe(true);
      if (second.ok) expect(serializeTtsSave(second.save)).toBe(text);
    },
  );

  it('preserves integers in unknown fields and arrays without changing strings or safe numbers', () => {
    const text =
      '{"safe":9007199254740991,"negative":-9007199254740991,"fraction":1.25,"exponent":1e2,"unknown":[76561198012345679,"76561198012345679","\\"76561198012345679"]}';
    const result = parseJsonText(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      safe: Number.MAX_SAFE_INTEGER,
      negative: Number.MIN_SAFE_INTEGER,
      fraction: 1.25,
      exponent: 100,
      unknown: [76561198012345679n, '76561198012345679', '"76561198012345679'],
    });
    expect(stringifyJson(result.value)).toBe(text.replace('1e2', '100'));
  });

  it.each(['{"x":01}', '{"x":1n}', '{"x":123,}', '{"x":NaN}', '{"x":Infinity}'])(
    'still rejects invalid JSON %s',
    text => expect(parseJsonText(text).ok).toBe(false),
  );

  it('keeps JSON.parse duplicate-key behavior while preserving the final integer', () => {
    const result = parseJsonText('{"value":1,"value":76561198012345679}');
    expect(result).toEqual({ ok: true, value: { value: 76561198012345679n } });
  });

  it('reports missing source-context support instead of silently rounding integers', () => {
    const parse = vi
      .spyOn(JSON, 'parse')
      .mockImplementationOnce((_text, reviver): unknown =>
        reviver!.call({}, 'OwnerSteamID', Number('76561198012345679')),
      );
    try {
      expect(parseJsonText('{"OwnerSteamID":76561198012345679}')).toEqual({
        ok: false,
        error: 'JSON.parse source context support is required to preserve numeric precision',
      });
    } finally {
      parse.mockRestore();
    }
  });

  it('keeps Newtonsoft non-finite serialization with bigint values', () => {
    expect(stringifyJson([76561198012345679n, Infinity, -Infinity, NaN])).toBe(
      '[76561198012345679,"Infinity","-Infinity","NaN"]',
    );
  });

  it('validates bigint Steam IDs with Zod in strict mode and preserves their numeric wire format', () => {
    const text =
      '{"SaveName":"ids","ObjectStates":[],"VectorLines":[{"OwnerSteamID":76561198012345679,"points3":[],"color":{"r":1,"g":1,"b":1},"thickness":1}]}';
    const result = parseTtsSave(text, { mode: 'strict' });
    expect(result.ok).toBe(true);
    expect(result.warnings).toEqual([]);
    if (result.ok) expect(serializeTtsSave(result.save)).toBe(text);
  });
});
