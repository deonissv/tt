import { InMemoryRoomRegistry } from './room-registry';
import type { SimulationRoom } from './simulation-room';

function makeRoom(code: string): SimulationRoom {
  return { room: { code } } as SimulationRoom;
}

describe('InMemoryRoomRegistry', () => {
  let registry: InMemoryRoomRegistry;

  beforeEach(() => {
    registry = new InMemoryRoomRegistry();
  });

  it('returns undefined for a missing code', () => {
    expect(registry.get('nope')).toBeUndefined();
  });

  it('has returns false for a missing code', () => {
    expect(registry.has('nope')).toBe(false);
  });

  it('stores and retrieves a room by its code', () => {
    const room = makeRoom('abc');
    registry.set(room);
    expect(registry.get('abc')).toBe(room);
  });

  it('has returns true after set', () => {
    registry.set(makeRoom('abc'));
    expect(registry.has('abc')).toBe(true);
  });

  it('uses room.room.code as the key', () => {
    const room = makeRoom('xyz');
    registry.set(room);
    expect(registry.get('xyz')).toBe(room);
    expect(registry.get('other')).toBeUndefined();
  });

  it('deletes a room', () => {
    registry.set(makeRoom('abc'));
    registry.delete('abc');
    expect(registry.has('abc')).toBe(false);
    expect(registry.get('abc')).toBeUndefined();
  });

  it('delete is a no-op for a missing code', () => {
    expect(() => registry.delete('nope')).not.toThrow();
  });

  it('overwrites an existing room on set', () => {
    const first = makeRoom('abc');
    const second = makeRoom('abc');
    registry.set(first);
    registry.set(second);
    expect(registry.get('abc')).toBe(second);
  });

  it('manages multiple rooms independently', () => {
    const a = makeRoom('a');
    const b = makeRoom('b');
    registry.set(a);
    registry.set(b);
    expect(registry.get('a')).toBe(a);
    expect(registry.get('b')).toBe(b);
    registry.delete('a');
    expect(registry.has('a')).toBe(false);
    expect(registry.has('b')).toBe(true);
  });
});
