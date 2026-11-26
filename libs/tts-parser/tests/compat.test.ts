import { parseTtsSave, serializeTtsSave } from '../src';

import { baseSave } from './fixtures';

describe('parseTtsSave — compatibility edges', () => {
  const transformComponents = ['posX', 'posY', 'posZ', 'rotX', 'rotY', 'rotZ', 'scaleX', 'scaleY', 'scaleZ'] as const;
  const nonFiniteFloats = [
    [Infinity, 'Infinity'],
    [-Infinity, '-Infinity'],
    [NaN, 'NaN'],
  ] as const;

  it.each(
    transformComponents.flatMap(component => nonFiniteFloats.map(([value, wire]) => ({ component, value, wire }))),
  )('strictly round-trips Transform.$component containing $wire', ({ component, value, wire }) => {
    const baseline = parseTtsSave(baseSave(), { mode: 'strict' });
    expect(baseline.ok).toBe(true);
    if (!baseline.ok) return;
    baseline.save.ObjectStates[0].Transform[component] = value;

    const text = serializeTtsSave(baseline.save);
    expect(text).toContain(`"${component}":"${wire}"`);

    const parsed = parseTtsSave(text, { mode: 'strict' });
    expect(parsed.warnings).toEqual([]);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.save.ObjectStates[0].Transform[component]).toBe(wire);
    expect(serializeTtsSave(parsed.save)).toBe(text);
  });

  it.each([
    ['constructor', true],
    ['toString', true],
    ['__proto__', true],
    ['Infinity', false],
    ['-Infinity', false],
    ['NaN', false],
  ])('validates joint float string %s without changing it', (value, invalid) => {
    const save = baseSave();
    save.ObjectStates[0].JointFixed = {
      ConnectedBodyGUID: 'other1',
      EnableCollision: false,
      Axis: { x: 1, y: 0, z: 0 },
      Anchor: { x: 0, y: 0, z: 0 },
      ConnectedAnchor: { x: 0, y: 0, z: 0 },
      BreakForce: value,
      BreakTorgue: value,
    };
    const text = JSON.stringify(save);
    const result = parseTtsSave(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.warnings.filter(w => w.code === 'type-mismatch').map(w => w.path)).toEqual(
      invalid ? ['ObjectStates[0].JointFixed.BreakForce', 'ObjectStates[0].JointFixed.BreakTorgue'] : [],
    );
    expect(serializeTtsSave(result.save)).toBe(text);
  });

  it('accepts a UTF-8 BOM and leading whitespace', () => {
    const text = '﻿' + JSON.stringify(baseSave());
    const result = parseTtsSave(text);
    expect(result.ok).toBe(true);
  });

  it('round-trips non-finite floats through the "Infinity"/"NaN" strings', () => {
    const save = baseSave();
    save.ObjectStates = [
      {
        GUID: 'joint1',
        Name: 'Custom_Model',
        Transform: { posX: 0, posY: 0, posZ: 0, rotX: 0, rotY: 0, rotZ: 0, scaleX: 1, scaleY: 1, scaleZ: 1 },
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
        JointFixed: {
          ConnectedBodyGUID: 'aabbcc',
          EnableCollision: false,
          Axis: { x: 1, y: 0, z: 0 },
          Anchor: { x: 0, y: 0, z: 0 },
          ConnectedAnchor: { x: 0, y: 0.5, z: 0 },
          BreakForce: 1000000,
          BreakTorgue: 'Infinity',
        },
      },
    ];

    const text = serializeTtsSave(save as never);
    expect(text).toContain('"BreakTorgue":"Infinity"');

    const parsed = parseTtsSave(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const joint = parsed.save.ObjectStates[0].JointFixed;
    expect(joint?.BreakTorgue).toBe('Infinity');

    // Round-trip keeps the string form stable.
    expect(serializeTtsSave(parsed.save)).toBe(text);
  });

  it('accepts unknown keys silently and preserves them for export', () => {
    const save = baseSave();
    save.ObjectStates[0].ModExtension = { custom: [1, 2, 3] };
    save.SomeFutureKey = 'anything';

    const result = parseTtsSave(JSON.stringify(save));
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.warnings).toEqual([]);

    // Preserved on round-trip.
    const text2 = serializeTtsSave(result.save);
    expect(text2).toContain('"ModExtension":{"custom":[1,2,3]}');
    expect(text2).toContain('"SomeFutureKey":"anything"');
  });

  it.each(['constructor', 'toString', '__proto__'])('preserves unknown %s keys at save and object level', key => {
    const save = baseSave();
    for (const target of [save, save.ObjectStates[0]]) {
      Object.defineProperty(target, key, { value: { preserved: true }, enumerable: true });
    }
    const text = JSON.stringify(save);
    const result = parseTtsSave(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.warnings).toEqual([]);
    expect(serializeTtsSave(result.save)).toBe(text);
    expect(Object.getPrototypeOf(result.save)).toBe(Object.prototype);
    expect(Object.getPrototypeOf(result.save.ObjectStates[0])).toBe(Object.prototype);
  });

  it('preserves explicit null and absence as distinct states', () => {
    const withNull = baseSave();
    const text = JSON.stringify(withNull);

    const result = parseTtsSave(text);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.save.ObjectStates[0].RPGmode).toBeNull();

    // Keep explicit nulls and leave missing keys absent.
    const text2 = serializeTtsSave(result.save);
    expect(text2).toContain('"RPGmode":null');
    expect(text2).not.toContain('"AltZoomable"');
  });

  it('accepts sparse saved-object subsets', () => {
    const result = parseTtsSave(
      JSON.stringify({
        SaveName: 'bag',
        ObjectStates: [
          {
            GUID: 'bag1',
            Name: 'Bag',
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
            ContainedObjects: [],
          },
        ],
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Absent optional blocks are reported as missing-required errors but do not fail the parse.
    expect(result.warnings.filter(w => w.code === 'missing-required').length).toBe(0);
  });

  it('fails cleanly on non-save inputs', () => {
    expect(parseTtsSave('not json').ok).toBe(false);
    expect(parseTtsSave('[1, 2, 3]').ok).toBe(false); // SaveFileInfos.json shape
    expect(parseTtsSave('{"SaveName": "x"}').ok).toBe(false); // no ObjectStates
    expect(parseTtsSave('{"ObjectStates": "nope"}').ok).toBe(false);
  });

  it('reports missing required object fields but keeps parsing', () => {
    const save = baseSave();
    const object = save.ObjectStates[0];
    delete object.Transform;

    const result = parseTtsSave(JSON.stringify(save));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const missing = result.warnings.filter(w => w.code === 'missing-required');
    expect(missing.map(w => w.path)).toContain('ObjectStates[0].Transform');
  });

  it('flags wrong-typed known fields without dropping them', () => {
    const save = baseSave();
    const object = save.ObjectStates[0];
    object.Locked = 'yes';

    const result = parseTtsSave(JSON.stringify(save));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const mismatches = result.warnings.filter(w => w.code === 'type-mismatch');
    expect(mismatches.some(w => w.path === 'ObjectStates[0].Locked')).toBe(true);
    expect(result.save.ObjectStates[0].Locked).toBe('yes' as never);
  });

  it('does not mutate the caller-provided object', () => {
    const save = baseSave();
    const before = JSON.stringify(save);
    parseTtsSave(save);
    expect(JSON.stringify(save)).toBe(before);
  });

  it('uses Zod enum constraints while preserving invalid values in tolerant mode', () => {
    const save = baseSave();
    save.ObjectStates[0].PhysicsMaterial = {
      StaticFriction: 0.5,
      DynamicFriction: 0.5,
      Bounciness: 0,
      FrictionCombine: 99,
      BounceCombine: 0,
    };
    const result = parseTtsSave(save);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.save).toBe(save);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        code: 'unknown-enum-value',
        path: 'ObjectStates[0].PhysicsMaterial.FrictionCombine',
      }),
    );
    expect(parseTtsSave(save, { mode: 'strict' }).ok).toBe(false);
  });

  it('strict mode rejects schema errors with field-path diagnostics', () => {
    const save = baseSave();
    save.ObjectStates[0].Locked = 'yes';
    const result = parseTtsSave(save, { mode: 'strict' });
    expect(result.ok).toBe(false);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({ path: 'ObjectStates[0].Locked', code: 'type-mismatch' }),
    );
  });

  it('strict mode accepts valid saves without stripping extension fields', () => {
    const save = baseSave();
    save.FutureField = { preserved: true };
    const result = parseTtsSave(save, { mode: 'strict' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.save).toBe(save);
    expect(result.warnings).toEqual([]);
  });

  it('rejects cyclic input before recursive Zod validation', () => {
    const save = baseSave();
    save.ObjectStates[0].ContainedObjects = [save.ObjectStates[0]];
    const result = parseTtsSave(save);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('Cyclic input');
  });

  it('allows shared references that are not cycles', () => {
    const save = baseSave();
    save.ObjectStates.push(save.ObjectStates[0]);
    expect(parseTtsSave(save, { mode: 'strict' }).ok).toBe(true);
  });

  it('returns all Zod field diagnostics without a custom warning cap', () => {
    const save = baseSave();
    save.ObjectStates[0].Locked = 'yes';
    save.ObjectStates[0].Grid = 'yes';
    save.ObjectStates[0].Snap = 'yes';
    const result = parseTtsSave(save);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.warnings.map(w => w.path)).toEqual([
      'ObjectStates[0].Locked',
      'ObjectStates[0].Grid',
      'ObjectStates[0].Snap',
    ]);
  });
});
