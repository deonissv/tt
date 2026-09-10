import { CreateBox, Logger } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import { ActorType, type DieState } from '@tt/states';
import { initHavok } from '../../../src/utils';
import { getPhSim } from '../../../test/testUtils';
import { AssetsManager } from './assets-manager';
import { Die4, Die6Round, ServerDie } from './die';

function dieState(type: DieState['type'], faces: number): DieState {
  return {
    type,
    guid: `die-${faces}`,
    name: `d${faces}`,
    rotationValues: Array.from({ length: faces }, (_, value) => ({
      value: value + 1,
      rotation: [0, 0, 0],
    })),
  } as DieState;
}

describe('ServerDie', () => {
  beforeAll(async () => {
    Logger.LogLevels = 0;
    await initHavok();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each([
    [ActorType.DIE4, 4],
    [ActorType.DIE6, 6],
    [ActorType.DIE6ROUND, 6],
    [ActorType.DIE8, 8],
    [ActorType.DIE10, 10],
    [ActorType.DIE12, 12],
    [ActorType.DIE20, 20],
  ] as const)('derives %s face count from the die type', (type, faces) => {
    getPhSim();
    const die = new ServerDie(dieState(type, faces), CreateBox(`d${faces}`, { size: 1 }));

    expect(die.numFaces).toBe(faces);
  });

  it('loads the configured collider as the model for a standard die', async () => {
    getPhSim();
    const state = dieState(ActorType.DIE4, 4);
    const collider = CreateBox('die-collider', { size: 1 });
    const loadMesh = vi.spyOn(Loader, 'loadMesh').mockResolvedValue(collider);

    const die = await Die4.fromState(state);

    expect(loadMesh).toHaveBeenCalledWith(AssetsManager.getDieModel(state).colliderURL);
    expect(die).toBeInstanceOf(Die4);
    expect(die?.model).toBe(collider);
    expect(die?.__collider).toBe(collider);
  });

  it('returns null when a standard die model cannot be loaded', async () => {
    getPhSim();
    vi.spyOn(Loader, 'loadMesh').mockResolvedValue(null);

    await expect(Die4.fromState(dieState(ActorType.DIE4, 4))).resolves.toBeNull();
  });

  it('uses the rounded die collider as its model', async () => {
    getPhSim();
    const state = dieState(ActorType.DIE6ROUND, 6);
    const model = CreateBox('rounded-die', { size: 1 });
    const loadMesh = vi.spyOn(Loader, 'loadMesh').mockResolvedValue(model);

    const die = await Die6Round.fromState(state);

    expect(loadMesh).toHaveBeenCalledWith(AssetsManager.ROUNDED_DIE.colliderURL);
    expect(die).toBeInstanceOf(Die6Round);
    expect(die?.model).toBe(model);
  });

  it('releases a rolled die before applying linear and angular impulses', async () => {
    vi.useFakeTimers();
    getPhSim();
    const die = new ServerDie(dieState(ActorType.DIE6, 6), CreateBox('rollable-die', { size: 1 }));
    const applyImpulse = vi.spyOn(die.body, 'applyImpulse');
    const applyAngularImpulse = vi.spyOn(die.body, 'applyAngularImpulse');

    die.roll();
    expect(die.picked).toBe('');

    await vi.advanceTimersByTimeAsync(100);

    expect(die.picked).toBeNull();
    expect(applyImpulse).toHaveBeenCalledOnce();
    expect(applyAngularImpulse).toHaveBeenCalledOnce();
  });
});
