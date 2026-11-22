import { DTO_SCHEMAS, toTtsJsonSchema } from '@tt/tts-schema';
import { parseTtsSave } from '../src';

/**
 * `toTtsJsonSchema` converts the Zod schemas in @tt/tts-schema to JSON Schema.
 * Schema `id` metadata names shared DTOs in $defs. Recursive fields use $ref cycles.
 */
describe('z.toJSONSchema — the zod schemas emit the published format contract', () => {
  // The root document is a $ref to the id-named SaveState definition plus shared $defs.
  const saveDoc = toTtsJsonSchema(DTO_SCHEMAS.SaveState) as {
    $ref?: string;
    $defs?: Record<string, { properties?: Record<string, unknown>; required?: string[]; type?: string }>;
  };
  const saveState = saveDoc.$defs?.SaveState ?? {};

  it('emits the save as a root $ref into a named SaveState definition', () => {
    expect(saveDoc.$ref).toBe('#/$defs/SaveState');
    expect(saveState.type).toBe('object');
    expect(saveState.required).toEqual(['SaveName', 'ObjectStates']);
  });

  it('emits a named $defs entry for every registered DTO', () => {
    const defs = saveDoc.$defs ?? {};
    for (const name of Object.keys(DTO_SCHEMAS)) {
      expect(defs, `missing $defs entry for ${name}`).toHaveProperty(name);
    }
  });

  it('keeps recursion as $ref cycles (ObjectState → ContainedObjects → ObjectState)', () => {
    const objectState = saveDoc.$defs?.ObjectState ?? {};
    expect(JSON.stringify(objectState.properties?.ContainedObjects)).toContain('#/$defs/ObjectState');
  });

  it('preserves the non-finite float quirk (BreakTorgue: number | "Infinity" | …)', () => {
    const joint = JSON.stringify(toTtsJsonSchema(DTO_SCHEMAS.JointState));
    expect(joint).toContain('"Infinity"');
    expect(joint).toContain('"-Infinity"');
    expect(joint).toContain('"NaN"');
  });

  it('every registered DTO emits standalone', () => {
    for (const [name, schema] of Object.entries(DTO_SCHEMAS)) {
      const emitted = toTtsJsonSchema(schema);
      expect(emitted, name).toBeDefined();
    }
  });

  it('represents bigint Steam IDs as JSON integers rather than unconstrained values', () => {
    for (const name of ['VectorLineState', 'TextState', 'DecalState'] as const) {
      const schema = toTtsJsonSchema(DTO_SCHEMAS[name]);
      const definitions = schema.$defs as Record<string, { properties?: Record<string, unknown> }>;
      expect(definitions[name].properties?.OwnerSteamID).toEqual({ type: ['number', 'integer'] });
    }
  });

  it('keeps extension fields outside the published contract without rejecting them', () => {
    const result = parseTtsSave(JSON.stringify({ SaveName: 's', ObjectStates: [], SomeUnknown: 1 })) as {
      ok: true;
      warnings: { code: string; path: string }[];
    };
    expect(result.ok).toBe(true);
    expect(Object.keys(saveState.properties ?? {})).toContain('SaveName');
    expect(Object.keys(saveState.properties ?? {})).not.toContain('SomeUnknown');
    expect(result.warnings).toEqual([]);
  });
});
