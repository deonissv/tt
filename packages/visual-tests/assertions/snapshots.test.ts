import { describe, expect, it } from 'vitest';
import { compareSnapshots } from './snapshots';

const actor = (guid: string, position = [0, 0, 0], rotation = [0, 0, 0]) => ({
  guid,
  type: 0,
  transformation: { position, rotation, scale: [1, 1, 1] },
});

describe('visual snapshot comparison', () => {
  it('accepts declared continuous values on the tolerance boundary', () => {
    const expected = { actorStates: [actor('alpha', [0, 0, 0])] };
    const actual = { actorStates: [actor('alpha', [0.001, -0.001, 0])] };

    expect(compareSnapshots(expected, actual)).toEqual([]);
  });

  it('reports continuous values outside their field tolerance', () => {
    const expected = { actorStates: [actor('alpha')] };
    const actual = { actorStates: [actor('alpha', [0.00101, 0, 0])] };

    expect(compareSnapshots(expected, actual)).toEqual(['actorStates[guid=alpha].transformation.position[0]']);
  });

  it('matches top-level actors by GUID while preserving nested container order', () => {
    const expected = {
      actorStates: [{ ...actor('bag'), containedObjects: [{ guid: 'one' }, { guid: 'two' }] }, actor('pawn')],
    };
    const reorderedActors = {
      actorStates: [actor('pawn'), { ...actor('bag'), containedObjects: [{ guid: 'one' }, { guid: 'two' }] }],
    };
    const reorderedContents = {
      actorStates: [actor('pawn'), { ...actor('bag'), containedObjects: [{ guid: 'two' }, { guid: 'one' }] }],
    };

    expect(compareSnapshots(expected, reorderedActors)).toEqual([]);
    expect(compareSnapshots(expected, reorderedContents)).toEqual(
      expect.arrayContaining(['actorStates[guid=bag].containedObjects[0].guid']),
    );
  });

  it('reports missing, extra, and duplicate actor GUIDs', () => {
    const expected = { actorStates: [actor('one'), actor('two')] };
    const actual = { actorStates: [actor('one'), actor('one'), actor('three')] };
    const differences = compareSnapshots(expected, actual);

    expect(differences).toEqual(
      expect.arrayContaining(['actorStates[guid=one] (duplicate)', 'actorStates[guid=two]', 'actorStates[guid=three]']),
    );
  });

  it('rejects changed nested counts and discrete value types', () => {
    const expected = {
      actorStates: [{ ...actor('deck'), cards: [{ guid: 'one' }, { guid: 'two' }], size: 2 }],
    };
    const actual = {
      actorStates: [{ ...actor('deck'), cards: [{ guid: 'one' }], size: '2' }],
    };

    expect(compareSnapshots(expected, actual)).toEqual(
      expect.arrayContaining(['actorStates[guid=deck].cards.length', 'actorStates[guid=deck].size']),
    );
  });

  it('accepts equivalent Euler rotations and rejects rotations outside tolerance', () => {
    const expected = { actorStates: [actor('card', [0, 0, 0], [0, 0, 0])] };
    const equivalent = { actorStates: [actor('card', [0, 0, 0], [Math.PI * 2, 0, 0])] };
    const changed = { actorStates: [actor('card', [0, 0, 0], [0.002, 0, 0])] };

    expect(compareSnapshots(expected, equivalent)).toEqual([]);
    expect(compareSnapshots(expected, changed)).toEqual(['actorStates[guid=card].transformation.rotation']);
  });

  it('rejects non-finite values and shape differences', () => {
    const expected = { actorStates: [actor('die')] };
    const actual = { actorStates: [actor('die', [Number.NaN, 0])] };
    const differences = compareSnapshots(expected, actual);

    expect(differences).toEqual(
      expect.arrayContaining([
        'actorStates[guid=die].transformation.position.length',
        'actorStates[guid=die].transformation.position[0]',
      ]),
    );
  });

  it('distinguishes an undefined property from a missing property in shape diagnostics', () => {
    const expected = { actorStates: [{ ...actor('stack'), size: undefined }] };
    const actual = { actorStates: [actor('stack')] };

    expect(compareSnapshots(expected, actual)).toEqual(['actorStates[guid=stack].size']);
  });
});

describe('actorStates entry validation', () => {
  it.each([null, undefined, {}, { guid: 7 }, { guid: '' }, []].map(entry => ({ entry })))(
    'rejects malformed entry $entry on either side',
    ({ entry }) => {
      const valid = { actorStates: [actor('valid')] };
      const malformed = { actorStates: [actor('valid'), entry] };
      expect(compareSnapshots(valid, malformed)).toEqual(expect.arrayContaining(['actorStates[1]']));
      expect(compareSnapshots(malformed, valid)).toEqual(expect.arrayContaining(['actorStates[1]']));
    },
  );
});
