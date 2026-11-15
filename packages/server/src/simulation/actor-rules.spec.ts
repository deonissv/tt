import { CreateBox, Logger } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import { Capability } from '@tt/rules';
import { ActorType, type ActorState, type BagState, type CardState, type UnknownActorState } from '@tt/states';
import { getPhSim } from '../../test/testUtils';
import { initHavok } from '../utils';
import type { Bag, Deck, ServerDie, TileStack } from './actors';
import { can } from './actor-rules';
import { ServerActorBuilder } from './serverActorBuilder';

const item: ActorState = { type: ActorType.ACTOR, guid: 'item', name: 'Item', model: { meshURL: 'item.obj' } };
const card: CardState = {
  type: ActorType.CARD,
  guid: 'card',
  name: 'Card',
  faceURL: '',
  backURL: '',
  rows: 1,
  cols: 1,
  sequence: 0,
};
const bag: BagState = {
  type: ActorType.BAG,
  guid: 'bag',
  name: 'Bag',
  containedObjects: [item, { ...item, guid: 'second' }],
};

const cases: { label: string; state: UnknownActorState; container: boolean; shuffle: boolean; roll: boolean }[] = [
  { label: 'actor', state: item, container: false, shuffle: false, roll: false },
  { label: 'card', state: card, container: false, shuffle: false, roll: false },
  { label: 'bag', state: bag, container: true, shuffle: true, roll: false },
  {
    label: 'deck',
    state: { type: ActorType.DECK, guid: 'deck', name: 'Deck', cards: [card, { ...card, guid: 'second' }] },
    container: true,
    shuffle: true,
    roll: false,
  },
  {
    label: 'tile stack',
    state: { type: ActorType.TILE_STACK, guid: 'stack', name: 'Stack', tileType: 0, faceURL: '', size: 2 },
    container: true,
    shuffle: false,
    roll: false,
  },
  {
    label: 'die',
    state: {
      type: ActorType.DIE4,
      guid: 'die',
      name: 'Die',
      rotationValues: [
        { value: 1, rotation: [0, 0, 0] },
        { value: 2, rotation: [1, 0, 0] },
        { value: 3, rotation: [0, 1, 0] },
        { value: 4, rotation: [0, 0, 1] },
      ],
    },
    container: false,
    shuffle: false,
    roll: true,
  },
];

describe('server actor capability guard', () => {
  let simulation: ReturnType<typeof getPhSim>;

  beforeAll(async () => {
    Logger.LogLevels = 0;
    await initHavok();
  });

  beforeEach(() => {
    simulation = getPhSim();
    vi.spyOn(Loader, 'loadMesh').mockImplementation(() => Promise.resolve(CreateBox('model')));
  });

  afterEach(() => {
    simulation.engine.dispose();
    vi.restoreAllMocks();
  });

  it.each(cases)('narrows the factory-built $label using its capabilities', async testCase => {
    const actor = await ServerActorBuilder.build(structuredClone(testCase.state));
    if (!actor) throw new Error('Factory did not build the actor');

    expect(can(actor, Capability.Container)).toBe(testCase.container);
    expect(can(actor, Capability.Shuffleable)).toBe(testCase.shuffle);
    expect(can(actor, Capability.Rollable)).toBe(testCase.roll);

    // The server typecheck verifies these predicates expose the concrete methods.
    if (can(actor, Capability.Container)) {
      expectTypeOf(actor).toMatchTypeOf<Bag | Deck | TileStack>();
      expect(actor).toHaveProperty('pickItem');
    }
    if (can(actor, Capability.Shuffleable)) {
      expectTypeOf(actor).toMatchTypeOf<Bag | Deck>();
      expect(actor).toHaveProperty('shuffle');
    }
    if (can(actor, Capability.Rollable)) {
      expectTypeOf(actor).toMatchTypeOf<ServerDie>();
      expect(actor).toHaveProperty('roll');
    }
  });

  it('allows drawing from a locked bag but rejects grabbing and shuffling it', async () => {
    const actor = await ServerActorBuilder.build({ ...bag, locked: true });
    if (!actor) throw new Error('Factory did not build the bag');

    expect(can(actor, Capability.Container)).toBe(true);
    expect(can(actor, Capability.Pickable)).toBe(false);
    expect(can(actor, Capability.Shuffleable)).toBe(false);
  });

  it('rejects extraction and shuffling from an empty bag', async () => {
    const actor = await ServerActorBuilder.build({ ...bag, containedObjects: [] });
    if (!actor) throw new Error('Factory did not build the bag');

    expect(can(actor, Capability.Container)).toBe(false);
    expect(can(actor, Capability.Shuffleable)).toBe(false);
  });
});
