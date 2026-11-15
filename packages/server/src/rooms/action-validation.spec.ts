import { ClientAction } from '@tt/actions';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { parseClientActions } from './action-validation';

describe('parseClientActions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes a well-formed batch through unchanged', () => {
    const actions = [
      { type: ClientAction.PICK_ACTOR, payload: 'box' },
      { type: ClientAction.MOVE_ACTOR, payload: { guid: 'box', position: [1.5, -2] } },
      { type: ClientAction.CURSOR, payload: [10, 20] },
      { type: ClientAction.SET_PICK_HEIGHT, payload: 2 },
      { type: ClientAction.SET_ROTATION_STEP, payload: Math.PI / 2 },
      { type: ClientAction.CLOSE, payload: null },
      { type: ClientAction.NICKNAME, payload: 'alice' },
    ];

    expect(parseClientActions(actions)).toEqual(actions);
  });

  it('drops malformed frames', () => {
    expect(parseClientActions('not-an-array')).toEqual([]);
    expect(parseClientActions(null)).toEqual([]);
    expect(parseClientActions(['junk', 42, null])).toEqual([]);
  });

  it('rejects non-finite and non-numeric move deltas', () => {
    const run = (position: unknown) =>
      parseClientActions([{ type: ClientAction.MOVE_ACTOR, payload: { guid: 'b', position } }]);

    expect(run([NaN, 1])).toEqual([]);
    expect(run(['1', 1])).toEqual([]);
    expect(run([Infinity, 1])).toEqual([]);
  });

  it('clamps oversized move deltas', () => {
    const [msg] = parseClientActions([
      { type: ClientAction.MOVE_ACTOR, payload: { guid: 'b', position: [1000, -1000] } },
    ]);

    expect(msg).toEqual({ type: ClientAction.MOVE_ACTOR, payload: { guid: 'b', position: [25, -25] } });
  });

  it('clamps pick height and rotation step ranges', () => {
    const [low, high, step] = parseClientActions([
      { type: ClientAction.SET_PICK_HEIGHT, payload: -5 },
      { type: ClientAction.SET_PICK_HEIGHT, payload: 99 },
      { type: ClientAction.SET_ROTATION_STEP, payload: 100 },
    ]);

    expect(low).toEqual({ type: ClientAction.SET_PICK_HEIGHT, payload: 0 });
    expect(high).toEqual({ type: ClientAction.SET_PICK_HEIGHT, payload: 10 });
    expect(step).toEqual({ type: ClientAction.SET_ROTATION_STEP, payload: Math.PI * 2 });
  });

  it('rejects invalid guid payloads', () => {
    const run = (payload: unknown) => parseClientActions([{ type: ClientAction.FLIP, payload }]);

    expect(run('')).toEqual([]);
    expect(run(42)).toEqual([]);
    expect(run('g'.repeat(65))).toEqual([]);
    expect(run('card')).toEqual([{ type: ClientAction.FLIP, payload: 'card' }]);
  });

  it('drops unknown action types', () => {
    expect(parseClientActions([{ type: 'HACK', payload: { guid: 'b' } }])).toEqual([]);
  });

  it('truncates oversized batches', () => {
    const batch = Array.from({ length: 150 }, () => ({ type: ClientAction.PICK_ACTOR, payload: 'box' }));

    expect(parseClientActions(batch)).toHaveLength(100);
  });
});
