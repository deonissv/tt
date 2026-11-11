import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { Logger, Mesh } from '@babylonjs/core';
import { OBJFileLoader } from '@babylonjs/loaders/OBJ/objFileLoader';
import { Loader } from '@tt/loader';
import { ActorType } from '@tt/states';
import { TTSParser } from '@tt/tts-parser';
import { initHavok } from '../../utils';
import { Simulation } from '../simulation';
import { Deck } from './deck';
import { RectangleTable } from './tables';

const root = join(__dirname, '../../../../../');
const demo = TTSParser.parse(readFileSync(join(root, 'static/demo.json'), 'utf8'))!;
const deckState = demo.actorStates!.find(actor => actor.type === ActorType.DECK && actor.guid === 'fb31d5');

beforeAll(async () => {
  Logger.LogLevels = 0;
  await initHavok();
});

it.each([15, 30, 60, 120])('keeps a card drawn from the demo deck above the felt at %s FPS', async fps => {
  if (deckState?.type !== ActorType.DECK) throw new Error('Demo deck missing');
  const simulation = new Simulation(demo);
  simulation.initPhysics(demo.gravity);
  vi.spyOn(simulation.engine, 'getDeltaTime').mockReturnValue(1000 / fps);
  vi.spyOn(Loader, 'loadMesh').mockImplementation(async meshURL => {
    const data = readFileSync(join(root, 'assets', basename(meshURL)), 'utf8');
    const { meshes } = await new OBJFileLoader({ skipMaterials: true }).importMeshAsync('', simulation.scene, data, '');
    return Mesh.MergeMeshes(meshes as Mesh[], true, true)!;
  });
  const render = (seconds: number) => {
    for (let frame = 0; frame < seconds * fps; frame++) simulation.scene.render();
  };
  try {
    await RectangleTable.fromState();
    const deck = await Deck.fromState(structuredClone(deckState));
    if (!deck) throw new Error('Failed to create demo deck');
    render(2);
    const card = await deck.pickItem('player', 3);
    if (!card) throw new Error('Failed to draw card');
    card.move(5, -1);
    render(1);
    expect(card.position.y).toBeGreaterThan(3.8);
    card.release();
    render(4);

    card.model.computeWorldMatrix(true);
    const bounds = card.model.getBoundingInfo().boundingBox;
    const topVertices = bounds.vectorsWorld.filter((_, index) => bounds.vectors[index].y === bounds.maximum.y);
    expect(Math.min(...topVertices.map(vertex => vertex.y))).toBeGreaterThan(0.85);
    expect(card.position.y).toBeLessThan(0.9);
    expect(card.sleeping).toBe(true);
  } finally {
    simulation.engine.dispose();
    vi.restoreAllMocks();
  }
});
