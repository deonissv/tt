import type { BagState, DeckState, TileStackState } from '@tt/states';
import { expect, it } from 'vitest';
import { buildDemoFixture, type FixtureVariant } from './demo';
import { ACTOR_MANIFEST } from './manifest';
import initialPoses from './targeting/poses.json';

it('builds independent fixtures and independent repeated bag items', () => {
  const first = buildDemoFixture('http://web:8080', 'shuffle-bag');
  const bag = first.actorStates!.find(actor => actor.guid === '7a0b0b') as BagState;
  bag.transformation!.position![0] = 999;
  bag.containedObjects[0].transformation!.position![0] = 999;
  expect(bag.containedObjects[1].transformation!.position![0]).not.toBe(999);

  const second = buildDemoFixture('http://web:8080', 'shuffle-bag');
  const freshBag = second.actorStates!.find(actor => actor.guid === bag.guid) as BagState;
  expect(second.actorStates).toHaveLength(14);
  expect(freshBag.transformation!.position![0]).not.toBe(999);
  expect(freshBag.containedObjects[0].transformation!.position![0]).not.toBe(999);
});

it.each<[FixtureVariant, string]>([
  ['default', '3b9ed5'],
  ['depleting-containers', '7a0b0b'],
  ['empty-bag', '7a0b0b'],
  ['empty-deck', 'fb31d5'],
  ['exhausted-tile-stack', '51d35d'],
  ['failed-bag-item', '7a0b0b'],
  ['face-down-deck', 'fb31d5'],
  ['locked-actor', '3b9ed5'],
  ['persistence', 'fb31d5'],
  ['shuffle-bag', '7a0b0b'],
  ['static-scene', '3b9ed5'],
])('keeps the selected actor, its contents, and scene settings for %s', (variant, guid) => {
  const full = buildDemoFixture('http://web:8080', variant);
  const focused = buildDemoFixture('http://web:8080', variant, [guid]);
  const actor = full.actorStates!.find(actor => actor.guid === guid)!;
  expect(focused).toEqual({ ...full, actorStates: [actor] });
});

it('starts interaction targets at their reviewed settled poses', () => {
  const fixture = buildDemoFixture('http://web:8080', 'default', ['8ac7c6', '3b9ed5']);
  expect(fixture.actorStates?.map(actor => actor.guid)).toEqual(['3b9ed5', '8ac7c6']);
  const poses: Record<string, unknown> = initialPoses.profiles.default;
  expect(fixture.actorStates?.map(actor => actor.transformation)).toEqual([poses['3b9ed5'], poses['8ac7c6']]);
});

it('preserves the original scene placement for the reviewed static screenshots', () => {
  const fixture = buildDemoFixture('http://web:8080', 'static-scene', ['8ac7c6', '3b9ed5']);
  expect(fixture.actorStates?.map(actor => actor.transformation?.position)).toEqual([
    [0, 4, -8],
    [0, 4, 8],
  ]);
});

it('preserves the explicit safe spawn height of a one-card deck', () => {
  const fixture = buildDemoFixture('http://web:8080', 'depleting-containers', ['fb31d5']);
  const deck = fixture.actorStates![0] as DeckState;
  expect(deck.cards).toHaveLength(1);
  expect(deck.transformation!.position![1]).toBe(1);
});

it('starts the ordinary card above the felt rather than inside its contact surface', () => {
  const fixture = buildDemoFixture('http://web:8080', 'default', ['8ac7c6']);
  expect(fixture.actorStates![0].transformation!.position![1]).toBeGreaterThan(0.86);
});

it('rejects an unknown actor selection instead of silently creating an incomplete game', () => {
  expect(() => buildDemoFixture('http://web:8080', 'default', ['missing'])).toThrow(
    'Unknown visual fixture actor: missing',
  );
});

it('retains the complete actor manifest and enough distinct items for container checks', () => {
  const state = buildDemoFixture('http://web:8080');
  expect(state.table?.type).toBe('Rectangle');
  expect(state.actorStates).toHaveLength(ACTOR_MANIFEST.length);
  expect(state.actorStates?.map(({ guid, type }) => ({ guid, type }))).toEqual(
    expect.arrayContaining(ACTOR_MANIFEST.map(({ guid, type }) => ({ guid, type }))),
  );
  const deck = state.actorStates!.find(actor => actor.guid === 'fb31d5') as DeckState;
  expect(new Set(deck.cards.map(card => card.guid)).size).toBeGreaterThanOrEqual(8);
  const stack = state.actorStates!.find(actor => actor.guid === '51d35d') as TileStackState;
  expect(stack.size).toBeGreaterThanOrEqual(2);
});
