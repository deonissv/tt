import type { SimulationStateSave } from '@tt/states';
import { ActorType } from '@tt/states';
import { upgradeLegacySimulationState } from './legacy-simulation-state';

const tile = (guid: string): { type: ActorType; guid: string; name: string } => ({
  type: ActorType.TILE,
  guid,
  name: 'Custom_Tile',
});

const bag = (
  guid: string,
  name: string,
  contained: string[] = [],
): { type: ActorType; guid: string; name: string; containedObjects: unknown[]; infinite?: boolean } => ({
  type: ActorType.BAG,
  guid,
  name,
  containedObjects: contained.map(tile),
});

const save = (actorStates: unknown[]): SimulationStateSave => ({ actorStates }) as SimulationStateSave;

describe('upgradeLegacySimulationState', () => {
  it('re-derives the infinite flag for a legacy bag parsed before the flag existed', () => {
    const state = save([bag('314455', 'Infinite_Bag', ['2c72d9'])]);

    const upgraded = upgradeLegacySimulationState(state);

    expect(upgraded).toBe(state);
    expect((state.actorStates?.[0] as { infinite?: boolean }).infinite).toBe(true);
    // The stored template contents stay untouched.
    expect((state.actorStates?.[0] as { containedObjects: unknown[] }).containedObjects).toHaveLength(1);
  });

  it.each(['Custom_Model_Infinite_Bag', 'custom_model_infinite_bag', 'infinite_bag'])(
    'recovers the flag from the other endless-container name %s',
    name => {
      const state = save([bag('bag1', name, [])]);
      upgradeLegacySimulationState(state);
      expect((state.actorStates?.[0] as { infinite?: boolean }).infinite).toBe(true);
    },
  );

  it('upgrades nested bag templates that may become live actors later', () => {
    const nested = bag('nested', 'Infinite_Bag', ['deep']);
    const outer = bag('outer', 'Bag', []);
    (outer as { containedObjects: unknown[] }).containedObjects.push(nested);
    const state = save([outer]);

    upgradeLegacySimulationState(state);

    const upgradedNested = (state.actorStates?.[0] as { containedObjects: { infinite?: boolean }[] })
      .containedObjects[0];
    expect(upgradedNested.infinite).toBe(true);
  });

  it('leaves states the current parser already upgraded untouched', () => {
    const fresh = bag('314455', 'Infinite_Bag', ['2c72d9']);
    fresh.infinite = true;
    const state = save([fresh]);

    upgradeLegacySimulationState(state);

    expect(state.actorStates?.[0]).toBe(fresh);
  });

  it('does not invent endless behavior for regular containers', () => {
    const regular = bag('7a0b0b', 'Bag', ['406fad']);
    const customNamed = bag('0d3e33', 'Custom_Model_Bag', []);
    const incidental = bag('bag2', 'Custom_Infinite_Bag', []);
    const card = { type: ActorType.CARD, guid: '8ac7c6', name: 'Card' };
    const state = save([regular, customNamed, incidental, card]);

    upgradeLegacySimulationState(state);

    expect(state.actorStates?.map(actor => (actor as { infinite?: boolean }).infinite)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('passes through saves without actors', () => {
    expect(upgradeLegacySimulationState(undefined)).toBeUndefined();
    const empty = save([]);
    expect(upgradeLegacySimulationState(empty)).toBe(empty);
  });
});
