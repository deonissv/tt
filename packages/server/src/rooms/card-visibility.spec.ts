import { ActorType, type CardState, type UnknownActorState } from '@tt/states';
import { describe, expect, it } from 'vitest';
import { cardIsFaceDown, redactCardFace } from './card-visibility';

const card = (rotation?: [number, number, number]): CardState => ({
  type: ActorType.CARD,
  guid: 'card',
  name: 'Card',
  faceURL: 'face.png',
  backURL: 'back.png',
  cols: 1,
  rows: 1,
  sequence: 0,
  transformation: rotation ? { rotation } : undefined,
});

describe('cardIsFaceDown', () => {
  it('reads face down from a half-turn pitch or roll', () => {
    expect(cardIsFaceDown(card([0, 0, 0]))).toBe(false);
    expect(cardIsFaceDown(card([0, Math.PI, 0]))).toBe(false);
    expect(cardIsFaceDown(card([Math.PI, 0, 0]))).toBe(true);
    expect(cardIsFaceDown(card([0, 0, Math.PI]))).toBe(true);
  });

  it('accounts for reflected Y scale even when rotation is absent', () => {
    expect(cardIsFaceDown({ ...card(), transformation: { scale: [1, -1, 1] } })).toBe(true);
    expect(
      cardIsFaceDown({ ...card([Math.PI, 0, 0]), transformation: { rotation: [Math.PI, 0, 0], scale: [1, -1, 1] } }),
    ).toBe(false);
  });

  it('treats non-cards and unrotated states as face up', () => {
    expect(cardIsFaceDown(card())).toBe(false);
    const deck = { type: ActorType.DECK, guid: 'd', name: 'd', cards: [] } as UnknownActorState;
    expect(cardIsFaceDown(deck)).toBe(false);
  });
});

describe('redactCardFace', () => {
  it('hides atlas coordinates as well as the face image', () => {
    const hidden = redactCardFace(
      { ...card([Math.PI, 0, 0]), cols: 10, rows: 7, sequence: 42, faceAspectRatio: 0.7 },
      'guest',
      null,
    );
    expect(hidden).toMatchObject({ faceURL: 'back.png', cols: 1, rows: 1, sequence: 0, faceAspectRatio: 0.7 });
  });
  it('substitutes the back texture for a face-down card a client does not hold', () => {
    const redacted = redactCardFace(card([Math.PI, 0, 0]), 'guest', 'owner') as CardState;

    expect(redacted.faceURL).toBe('back.png');
    expect(redacted.backURL).toBe('back.png');
  });

  it('leaves the holder and face-up cards untouched', () => {
    const held = redactCardFace(card([Math.PI, 0, 0]), 'owner', 'owner') as CardState;
    const faceUp = redactCardFace(card([0, 0, 0]), 'guest', null) as CardState;

    expect(held.faceURL).toBe('face.png');
    expect(faceUp.faceURL).toBe('face.png');
  });

  it('does not mutate the input state', () => {
    const state = card([Math.PI, 0, 0]);

    redactCardFace(state, 'guest', 'owner');

    expect(state.faceURL).toBe('face.png');
  });

  it('passes non-card states through by reference', () => {
    const deck = { type: ActorType.DECK, guid: 'd', name: 'd', cards: [] } as UnknownActorState;

    expect(redactCardFace(deck, 'guest', null)).toBe(deck);
  });
});
