import { CreateBox, Logger } from '@babylonjs/core';
import { Loader } from '@tt/loader';
import { ActorType, TileType, type TileState, type TileStackState } from '@tt/states';
import { initHavok } from '../../../src/utils';
import { getPhSim } from '../../../test/testUtils';
import { ServerActorBuilder } from '../serverActorBuilder';
import { AssetsManager } from './assets-manager';
import { Tile } from './tile';
import { TileStack } from './tileStack';

function tileStackState(size = 3): TileStackState {
  return {
    type: ActorType.TILE_STACK,
    guid: 'stack',
    name: 'Tile stack',
    tileType: TileType.HEX,
    faceURL: 'face.png',
    size,
    transformation: { position: [2, 3, 4], rotation: [0, 0, 0], scale: [2, 6, 2] },
  };
}

describe('TileStack', () => {
  beforeAll(async () => {
    Logger.LogLevels = 0;
    await initHavok();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scales both the visible model and collider to the stack size', () => {
    getPhSim();
    const model = CreateBox('stack-model', { size: 1 });
    const collider = CreateBox('stack-collider', { size: 1 });

    const stack = new TileStack(tileStackState(4), model, collider);

    expect(stack.size).toBe(4);
    expect(stack.model.scaling.y).toBe(4);
    expect(stack.__collider.scaling.y).toBe(4);
  });

  it('loads the mesh configured for the tile type', async () => {
    getPhSim();
    const state = tileStackState();
    const model = CreateBox('loaded-stack', { size: 1 });
    const loadMesh = vi.spyOn(Loader, 'loadMesh').mockResolvedValue(model);

    const stack = await TileStack.fromState(state);

    expect(loadMesh).toHaveBeenCalledWith(AssetsManager.getTileMesh(state.tileType));
    expect(stack).toBeInstanceOf(TileStack);
    expect(stack?.model.scaling.y).toBe(state.size);
  });

  it('returns null when the tile mesh cannot be loaded', async () => {
    getPhSim();
    vi.spyOn(Loader, 'loadMesh').mockResolvedValue(null);

    await expect(TileStack.fromState(tileStackState())).resolves.toBeNull();
  });

  it('draws one tile and updates the model and collider heights', async () => {
    const sim = getPhSim();
    const state = tileStackState();
    const stack = new TileStack(state, CreateBox('stack-model', { size: 1 }), CreateBox('stack-collider', { size: 1 }));
    let builtState: TileState | undefined;
    vi.spyOn(ServerActorBuilder, 'build').mockImplementation(actorState => {
      builtState = actorState as TileState;
      return Promise.resolve(new Tile(builtState, CreateBox('drawn-tile', { size: 1 })));
    });

    const drawn = await stack.pickItem('client', 0.5);

    expect(builtState).toMatchObject({
      type: ActorType.TILE,
      tileType: TileType.HEX,
      faceURL: 'face.png',
      transformation: { position: [2, 4, 4], scale: [2, 2, 2] },
    });
    expect(builtState?.guid).not.toBe(state.guid);
    expect(stack.size).toBe(2);
    expect(stack.model.scaling.y).toBe(2);
    expect(stack.__collider.scaling.y).toBe(2);
    expect(drawn?.scene).toBe(sim.scene);
    expect(drawn?.picked).toBe('client');
  });

  it('does not draw the last tile in a stack', async () => {
    getPhSim();
    const stack = new TileStack(tileStackState(1), CreateBox('single-tile-stack', { size: 1 }));
    const build = vi.spyOn(ServerActorBuilder, 'build');

    await expect(stack.pickItem('client', 0.5)).resolves.toBeNull();
    expect(build).not.toHaveBeenCalled();
    expect(stack.size).toBe(1);
  });
});
