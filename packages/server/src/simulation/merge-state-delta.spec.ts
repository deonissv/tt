import type { SimulationStateSave, SimulationStateUpdate, TableState } from '@tt/states';
import { Simulation } from './simulation';

const table: TableState = { type: 'Rectangle' };

const baseState: SimulationStateSave = {
  table,
  gravity: -9.81,
  leftHandedSystem: false,
  actorStates: [
    {
      type: 0,
      guid: 'cube',
      name: 'cube',
      model: { meshURL: 'cube.obj' },
      transformation: { position: [1, 2, 3], rotation: [0, 0, 0], scale: [1, 1, 1] },
    },
  ],
};

function progress(transform: SimulationStateUpdate['actorStates']): SimulationStateUpdate {
  return { actorStates: transform };
}

describe('mergeStateDelta', () => {
  it('keeps the saved table when a progress delta omits it', () => {
    const merged = Simulation.mergeStateDelta(structuredClone(baseState), progress([]));

    expect(merged.table).toEqual(table);
    expect(merged.gravity).toBe(-9.81);
    expect(merged.leftHandedSystem).toBe(false);
  });

  it('keeps the saved table when only actor transforms advance', () => {
    const delta = progress([{ guid: 'cube', transformation: { position: [4, 5, 6] } }]);

    const merged = Simulation.mergeStateDelta(structuredClone(baseState), delta);

    expect(merged.table).toEqual(table);
    expect(merged.actorStates?.[0].transformation?.position).toEqual([4, 5, 6]);
  });

  it('replaces the table when the delta carries one', () => {
    const nextTable: TableState = { type: 'CustomRectangle', url: 'custom.json' };

    const merged = Simulation.mergeStateDelta(structuredClone(baseState), { table: nextTable });

    expect(merged.table).toEqual(nextTable);
  });

  it('keeps zero gravity and a false handedness flag from the saved scene', () => {
    const state: SimulationStateSave = { gravity: 0, leftHandedSystem: false, actorStates: [] };

    const merged = Simulation.mergeStateDelta(state, progress([]));

    expect(merged.gravity).toBe(0);
    expect(merged.leftHandedSystem).toBe(false);
  });

  it('restores a scene without a saved table untouched', () => {
    const bare: SimulationStateSave = { actorStates: baseState.actorStates };

    const merged = Simulation.mergeStateDelta(bare, progress([]));

    expect(merged.table).toBeUndefined();
    expect(merged.actorStates).toHaveLength(1);
  });
});
