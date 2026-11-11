import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CreatePlane, Logger, Vector3 } from '@babylonjs/core';
import { OBJFileLoader } from '@babylonjs/loaders/OBJ/objFileLoader';
import { ActorType } from '@tt/states';
import { getPhSim } from '../../../test/testUtils';
import { initHavok } from '../../utils';
import { Card } from './card';
import { ServerBase } from './serverBase';

describe('card table physics', () => {
  let simulation: ReturnType<typeof getPhSim>;

  beforeAll(async () => {
    Logger.LogLevels = 0;
    await initHavok();
  });

  beforeEach(() => {
    simulation = getPhSim();
    vi.spyOn(simulation.engine, 'getDeltaTime').mockReturnValue(1000 / 60);
    const top = CreatePlane('tabletop', { size: 50 });
    top.rotation.x = Math.PI / 2;
    top.position.y = 5;
    top.bakeCurrentTransformIntoVertices();
    const table = new ServerBase({ type: ActorType.ACTOR, guid: '#table', name: 'table', locked: true }, top);
    table.lock();
  });

  afterEach(() => {
    simulation.engine.dispose();
    vi.restoreAllMocks();
  });

  function render(frames: number) {
    for (let frame = 0; frame < frames; frame++) simulation.scene.render();
  }

  async function card(guid: string, x: number) {
    const data = readFileSync(join(__dirname, '../../../../../assets/Card.obj'), 'utf8');
    const { meshes } = await new OBJFileLoader({ skipMaterials: true }).importMeshAsync('', simulation.scene, data, '');
    return new Card(
      {
        type: ActorType.CARD,
        guid,
        name: guid,
        faceURL: '',
        backURL: '',
        rows: 1,
        cols: 1,
        sequence: 0,
        sleeping: true,
        transformation: { position: [x, 4.9986, 0], rotation: [-0.0035, 0.001, 0.00009] },
      },
      meshes[0],
    );
  }

  it('does not let gravity pull a picked card into the table before its first lift', async () => {
    const actor = await card('card', 0);
    render(120);
    const startY = actor.position.y;
    actor.pick('player', 1);
    render(1);
    expect(actor.position.y).toBeCloseTo(startY, 5);
  });

  it('preserves a queued flip when dropping a held card before the next physics step', async () => {
    const actor = await card('card', 0);
    render(120);
    actor.pick('player', 3);
    render(60);
    const facing = () => Vector3.Up().applyRotationQuaternion(actor.absoluteRotationQuaternion);
    const initialFacing = facing();

    actor.flip();
    render(1);
    expect(Vector3.Dot(facing(), initialFacing)).toBeGreaterThan(0.99);
    actor.release();
    render(240);

    expect(Vector3.Dot(facing(), initialFacing)).toBeLessThan(-0.99);
    expect(actor.sleeping).toBe(true);
    expect(actor.position.y).toBeCloseTo(5, 2);
  });

  it.each([
    { fps: 30, heldFrames: 1 },
    { fps: 60, heldFrames: 1 },
    { fps: 30, heldFrames: 60 },
    { fps: 60, heldFrames: 60 },
  ])(
    'keeps two cards on the tabletop after drops at $fps FPS held for $heldFrames frames',
    async ({ fps, heldFrames }) => {
      vi.spyOn(simulation.engine, 'getDeltaTime').mockReturnValue(1000 / fps);
      const cards = [await card('first', -3), await card('second', 3)];
      render(120);
      for (let cycle = 0; cycle < 5; cycle++) {
        for (const actor of cards) {
          expect(actor.position.y).toBeGreaterThan(4.98);
          actor.pick('player', 3);
          actor.move(0.2, 0.1);
        }
        render(heldFrames);
        for (const actor of cards) {
          expect(actor.position.y).toBeGreaterThan(4.98);
          if (heldFrames > 1) expect(actor.position.y).toBeGreaterThan(7.9);
          actor.release();
        }
        render(240);
        for (const actor of cards) {
          expect(actor.sleeping).toBe(true);
          expect(actor.position.y).toBeGreaterThan(4.98);
          expect(actor.position.y).toBeLessThan(5.02);
        }
      }
    },
  );
});
