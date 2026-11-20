import { CreateBox, NullEngine, Texture } from '@babylonjs/core';
import { SimulationSceneBase } from '@tt/simulation';
import { ActorType, type CardState } from '@tt/states';
import { Card } from './actors';
import { ClientActorBuilder } from './ClientActorBuilder';
import { Simulation, type SimulationCallbacks } from './Simulation';

const state: CardState = {
  guid: 'card',
  name: 'Card',
  type: ActorType.CARD,
  faceURL: 'back.png',
  backURL: 'back.png',
  cols: 1,
  rows: 1,
  sequence: 0,
  transformation: { rotation: [Math.PI, 0, 0] },
};

describe('card reveals during spawning', () => {
  let engine: NullEngine;
  let scene: SimulationSceneBase;
  let sim: Simulation;
  beforeEach(() => {
    engine = new NullEngine();
    scene = new SimulationSceneBase(engine);
    sim = new Simulation(scene, {} as SimulationCallbacks);
    vi.spyOn(sim, 'getCursor').mockReturnValue([0, 0]);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    scene.dispose();
    engine.dispose();
  });

  it.each(['handleSpawnActor', 'handleSpawnPickedActor'] as const)(
    'preserves a reveal and rotation received while %s is loading',
    async handler => {
      let complete!: (actor: Card) => void;
      vi.spyOn(ClientActorBuilder, 'build').mockImplementation(
        () => new Promise<Card>(resolve => (complete = resolve)),
      );
      const spawning = sim[handler](state);
      const grid = { ...state, faceURL: 'revealed.png', cols: 2, rows: 3, sequence: 4 };
      sim.handleRotateActor(state.guid, [0, 0, 0]);
      sim.handleCardRerender(state.guid, grid);
      const texture = new Texture(null, scene);
      const loaded = new Card(state, CreateBox('card', {}, scene), texture, texture);
      const rerender = vi.spyOn(loaded, 'rerenderCard').mockResolvedValue(undefined);
      complete(loaded);
      await spawning;
      expect(rerender).toHaveBeenCalledWith(grid);
      expect(loaded.rotation.asArray()).toEqual([0, 0, 0]);
    },
  );
});
