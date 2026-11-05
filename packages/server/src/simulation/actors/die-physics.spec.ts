import { CreateBox, Logger, Quaternion, Vector3 } from '@babylonjs/core';
import { ActorType } from '@tt/states';
import { getPhSim } from '../../../test/testUtils';
import { initHavok } from '../../utils';
import { ServerDie } from './die';

describe('six-sided die physics', () => {
  let simulation: ReturnType<typeof getPhSim>;

  beforeAll(async () => {
    Logger.LogLevels = 0;
    await initHavok();
  });

  beforeEach(() => {
    simulation = getPhSim();
    vi.spyOn(simulation.engine, 'getDeltaTime').mockReturnValue(1000 / 60);
  });

  afterEach(() => {
    simulation.engine.dispose();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function render(frames: number) {
    for (let frame = 0; frame < frames; frame++) simulation.scene.render();
  }

  function die(type: ActorType.DIE6 | ActorType.DIE6ROUND): ServerDie {
    const actor = new ServerDie(
      {
        type,
        guid: 'die',
        name: 'die',
        rotationValues: [
          { value: 1, rotation: [0, 0, 0] },
          { value: 2, rotation: [Math.PI / 2, 0, 0] },
          { value: 3, rotation: [0, 0, Math.PI / 2] },
          { value: 4, rotation: [0, 0, -Math.PI / 2] },
          { value: 5, rotation: [-Math.PI / 2, 0, 0] },
          { value: 6, rotation: [Math.PI, 0, 0] },
        ],
        transformation: { position: [0, 0.55, 0], rotation: [0, 0, 0] },
      },
      CreateBox('die', { size: 1 }),
    );
    render(240);
    return actor;
  }

  it.each([ActorType.DIE6, ActorType.DIE6ROUND] as const)('keeps a picked %s above the table until released', type => {
    const actor = die(type);
    actor.pick('player', 1);
    render(120);
    const held = actor.position.clone();
    expect(held.y).toBeGreaterThan(1);
    render(60);
    expect(Vector3.Distance(actor.position, held)).toBeLessThan(0.005);

    actor.release();
    render(120);
    expect(actor.position.y).toBeLessThan(held.y);
    expect(actor.position.y).toBeGreaterThan(0);
  });

  it.each([ActorType.DIE6, ActorType.DIE6ROUND] as const)('lifts and rotates a rolled %s', async type => {
    vi.useFakeTimers();
    const actor = die(type);
    const startY = actor.position.y;
    const startRotation = actor.absoluteRotationQuaternion.clone();
    let highestY = startY;
    let largestRotation = 0;

    actor.roll();
    for (let frame = 0; frame < 120; frame++) {
      await vi.advanceTimersByTimeAsync(1000 / 60);
      render(1);
      highestY = Math.max(highestY, actor.position.y);
      largestRotation = Math.max(
        largestRotation,
        2 * Math.acos(Math.min(1, Math.abs(Quaternion.Dot(startRotation, actor.absoluteRotationQuaternion)))),
      );
    }

    expect(actor.picked).toBeNull();
    expect(highestY - startY).toBeGreaterThan(0.1);
    expect(largestRotation).toBeGreaterThan(0.01);
  });
});
