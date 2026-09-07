import {
  ActorType,
  TileType,
  type ActorState,
  type BagState,
  type DeckState,
  type Die4State,
  type TileStackState,
} from '@tt/states';
import { BASE_CAPABILITIES, Capability, can, containerSize, dieValue, isContainerEmpty } from '../src';

const actor = (locked = false): ActorState => ({
  type: ActorType.ACTOR,
  guid: 'actor',
  name: 'actor',
  model: { meshURL: 'actor.obj' },
  locked,
});

const bag = (size: number): BagState => ({
  type: ActorType.BAG,
  guid: 'bag',
  name: 'bag',
  containedObjects: Array.from({ length: size }, (_, index) => ({ ...actor(), guid: `${index}` })),
});

const deck = (size: number): DeckState => ({
  type: ActorType.DECK,
  guid: 'deck',
  name: 'deck',
  cards: Array.from({ length: size }, (_, index) => ({
    type: ActorType.CARD,
    guid: `card-${index}`,
    name: `card-${index}`,
    faceURL: 'face.png',
    backURL: 'back.png',
    rows: 1,
    cols: 1,
    sequence: index,
  })),
});

const stack = (size: number): TileStackState => ({
  type: ActorType.TILE_STACK,
  guid: 'stack',
  name: 'stack',
  tileType: TileType.BOX,
  faceURL: 'face.png',
  size,
});

describe('@tt/rules', () => {
  it('contains an intentional capability row for every actor type', () => {
    expect(Object.keys(BASE_CAPABILITIES)).toHaveLength(14);
    expect(can(actor(), Capability.Flippable)).toBe(true);
    expect(can(actor(), Capability.Rotatable)).toBe(true);
    expect(can(actor(), Capability.Rollable)).toBe(false);
  });

  it('applies locked and container-size exceptions without runtime objects', () => {
    expect(can(actor(), Capability.Pickable, { code: 'player' })).toBe(true);
    expect(can(actor(true), Capability.Pickable, { code: 'player' })).toBe(false);
    expect(can(actor(true), Capability.Flippable, { code: 'player' })).toBe(false);

    expect(containerSize(bag(2))).toBe(2);
    expect(isContainerEmpty(bag(0))).toBe(true);
    expect(can(bag(0), Capability.Container)).toBe(false);
    expect(can(bag(1), Capability.Container)).toBe(true);
    expect(can(bag(1), Capability.Shuffleable)).toBe(false);
    expect(can(bag(2), Capability.Shuffleable)).toBe(true);

    expect(containerSize(deck(2))).toBe(2);
    expect(can(deck(0), Capability.Container)).toBe(false);
    expect(can(deck(1), Capability.Container)).toBe(true);
    expect(can(deck(2), Capability.Shuffleable)).toBe(true);

    expect(containerSize(stack(1))).toBe(1);
    expect(isContainerEmpty(stack(1))).toBe(true);
    expect(can(stack(1), Capability.Container)).toBe(false);
    expect(can(stack(2), Capability.Container)).toBe(true);
    expect(can(stack(3), Capability.Shuffleable)).toBe(false);
    expect(containerSize(actor())).toBeNull();
  });

  it('selects die values with a pure numeric comparison', () => {
    const state: Die4State = {
      type: ActorType.DIE4,
      guid: 'die',
      name: 'die',
      rotationValues: [
        { value: 1, rotation: [0, 0, 0] },
        { value: 2, rotation: [1, 0, 0] },
        { value: 3, rotation: [2, 0, 0] },
        { value: 4, rotation: [3, 0, 0] },
      ],
    };

    expect(dieValue(state, [1.1, 0, 0])).toBe(2);
  });
});
