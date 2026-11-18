import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { OBJFileLoader } from '@babylonjs/loaders/OBJ/objFileLoader';
import { Loader } from '@tt/loader';
import { SimulationFactory } from '../simulation.factory';
import { CreateBox, EngineStore, Logger, Mesh, Quaternion, Vector3 } from '@babylonjs/core';
import { ActorType } from '@tt/states';
import { initHavok } from '../../../src/utils';
import { getPhSim } from '../../../test/testUtils';
import type { Simulation } from '../simulation';
import { ServerBase } from './serverBase';

let simulation: Simulation;

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
  vi.restoreAllMocks();
});

function restingActor(): ServerBase {
  const actor = new ServerBase(
    {
      type: ActorType.ACTOR,
      guid: 'box',
      name: 'box',
      sleeping: true,
      transformation: {
        scale: [1, 1, 1],
        position: [0, 0.55, 0],
        rotation: [0, 0, 0],
      },
    },
    CreateBox('box', { size: 1 }),
  );
  for (let frame = 0; frame < 120; frame++) simulation.scene.render();
  return actor;
}

function angleBetween(before: Quaternion, after: Quaternion): number {
  return 2 * Math.acos(Math.min(1, Math.abs(Quaternion.Dot(before, after))));
}

describe('hovered actor transforms', () => {
  it.each([30, 60, 120])('applies an unheld flip at %s FPS', fps => {
    vi.spyOn(simulation.engine, 'getDeltaTime').mockReturnValue(1000 / fps);
    const actor = restingActor();
    const before = actor.absoluteRotationQuaternion.clone();
    const positionBefore = actor.position.clone();

    expect(actor.sleeping).toBe(true);
    actor.flip();

    expect(actor.picked).toBeNull();
    for (let frame = 0; frame < 360; frame++) simulation.scene.render();

    expect(angleBetween(before, actor.absoluteRotationQuaternion)).toBeCloseTo(Math.PI, 2);
    expect(Vector3.Distance(actor.position, positionBefore)).toBeLessThan(0.05);
    expect(actor.__targetRotation).toBeNull();
    expect(actor.__hoverAnchor).toBeNull();
    expect(actor.body.shape!.isTrigger).toBe(false);
  });

  it('applies a rotation step to an actor that is not held', () => {
    const actor = restingActor();
    const before = actor.absoluteRotationQuaternion.clone();
    const positionBefore = actor.position.clone();

    actor.rotateCW(Math.PI / 4);
    for (let frame = 0; frame < 120; frame++) simulation.scene.render();

    expect(angleBetween(before, actor.absoluteRotationQuaternion)).toBeCloseTo(Math.PI / 4, 2);
    expect(Vector3.Distance(actor.position, positionBefore)).toBeLessThan(0.05);
    expect(actor.__targetRotation).toBeNull();
  });

  it('cancels two flips queued before the lift finishes', () => {
    const actor = restingActor();
    const before = actor.absoluteRotationQuaternion.clone();

    actor.flip();
    simulation.scene.render();
    actor.flip();
    for (let frame = 0; frame < 240; frame++) simulation.scene.render();

    expect(angleBetween(before, actor.absoluteRotationQuaternion)).toBeLessThan(0.005);
    expect(actor.__targetRotation).toBeNull();
  });

  it.each([1, -1])('accumulates queued rotation steps in direction %s', direction => {
    const actor = restingActor();
    const before = actor.absoluteRotationQuaternion.clone();
    const step = (direction * Math.PI) / 4;

    actor.rotateCW(step);
    simulation.scene.render();
    actor.rotateCW(step);
    for (let frame = 0; frame < 240; frame++) simulation.scene.render();

    const expected = before.multiply(Quaternion.RotationAxis(Vector3.Up(), 2 * step));
    expect(angleBetween(expected, actor.absoluteRotationQuaternion)).toBeLessThan(0.005);
    expect(actor.__targetRotation).toBeNull();
  });

  it('flips a loaded cube on the production rectangle table', async () => {
    simulation.engine.dispose();
    vi.spyOn(Loader, 'loadMesh').mockImplementation(async url => {
      const data = readFileSync(join(__dirname, '../../../../../assets', basename(url)), 'utf8');
      const { meshes } = await new OBJFileLoader({ skipMaterials: true }).importMeshAsync(
        '',
        EngineStore.LastCreatedScene!,
        data,
        '',
      );
      return Mesh.MergeMeshes(
        meshes.filter((mesh): mesh is Mesh => mesh instanceof Mesh && mesh.getTotalVertices() > 0),
        true,
        true,
      )!;
    });
    simulation = await new SimulationFactory().create({
      leftHandedSystem: true,
      gravity: 4.9,
      table: { type: 'Rectangle' },
      actorStates: [
        {
          type: ActorType.ACTOR,
          guid: '3b9ed5',
          name: 'cube',
          model: { meshURL: 'Cube.obj', colliderURL: 'Cube.obj' },
          transformation: { position: [0, 4, -8], rotation: [0, 0, 0], scale: [1, 1, 1] },
        },
      ],
    });
    vi.spyOn(simulation.engine, 'getDeltaTime').mockReturnValue(1000 / 60);
    for (let frame = 0; frame < 240; frame++) simulation.scene.render();
    const actor = simulation.actors[0];
    expect(actor.position.y).toBeCloseTo(1.06, 1);
    const before = actor.absoluteRotationQuaternion.clone();
    actor.flip();
    for (let frame = 0; frame < 360; frame++) simulation.scene.render();

    expect(angleBetween(before, actor.absoluteRotationQuaternion)).toBeCloseTo(Math.PI, 2);
    expect(actor.position.y).toBeCloseTo(1.06, 1);
    expect(actor.__hoverAnchor).toBeNull();
    expect(actor.__targetRotation).toBeNull();
  });

  it('reports the applied hovered rotation through its serialized state', () => {
    const actor = restingActor();
    actor.flip();
    for (let frame = 0; frame < 120; frame++) simulation.scene.render();

    const rotation = actor.toState().transformation!.rotation!;
    const serialized = Quaternion.FromEulerAngles(...rotation);
    expect(angleBetween(Quaternion.Identity(), serialized)).toBeCloseTo(Math.PI, 1);
  });
});
