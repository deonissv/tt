import {
  ActorType,
  applyActorStateUpdate,
  type ActorState,
  type ActorStateUpdate,
  type BagState,
  type TileStackState,
} from '@tt/states';
import type { ServerBase } from '../actors';
import { ServerActorBuilder } from '../serverActorBuilder';
import { pickItem, shuffle } from './container';

const item = (guid: string): ActorState => ({
  type: ActorType.ACTOR,
  guid,
  name: guid,
  model: { meshURL: `${guid}.obj` },
});

function actorWithState(state: BagState | TileStackState): {
  actor: ServerBase;
  updateState: ReturnType<typeof vi.fn>;
} {
  const updateState = vi.fn();
  const actor = {
    toState: () => structuredClone(state),
    updateState,
  } as unknown as ServerBase;
  return { actor, updateState };
}

function stackActor(size: number): ServerBase {
  let state: TileStackState = {
    type: ActorType.TILE_STACK,
    guid: 'stack',
    name: 'Stack',
    tileType: 0,
    faceURL: 'face.png',
    size,
  };
  return {
    guid: state.guid,
    toState: () => structuredClone(state),
    updateState: (update: ActorStateUpdate) => {
      state = applyActorStateUpdate(state, update) as TileStackState;
    },
    transformation: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
    model: { scaling: { y: size } },
    __collider: { scaling: { y: size } },
    _forceUpdate: vi.fn(),
    scene: { getUniqueGUID: vi.fn().mockReturnValue('tile') },
  } as unknown as ServerBase;
}

describe('functional container behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('derives a shuffled bag update without mutating the source state', () => {
    const state: BagState = {
      type: ActorType.BAG,
      guid: 'bag',
      name: 'Bag',
      containedObjects: [item('first'), item('second')],
    };
    const source = structuredClone(state);
    const { actor, updateState } = actorWithState(state);
    vi.spyOn(Math, 'random').mockReturnValue(0);

    shuffle(actor);

    expect(updateState).toHaveBeenCalledWith({
      guid: state.guid,
      containedObjects: [item('second'), item('first')],
    });
    expect(state).toEqual(source);
  });

  it('does not invent shuffle behavior for a tile stack', () => {
    const { actor, updateState } = actorWithState({
      type: ActorType.TILE_STACK,
      guid: 'stack',
      name: 'Stack',
      tileType: 0,
      faceURL: 'face.png',
      size: 3,
    });

    shuffle(actor);

    expect(updateState).not.toHaveBeenCalled();
  });

  it('restores a tile when creation rejects', async () => {
    const actor = stackActor(3);
    vi.spyOn(ServerActorBuilder, 'build').mockRejectedValueOnce(new Error('asset unavailable'));

    await expect(pickItem(actor, 'client', 1)).rejects.toThrow('asset unavailable');

    expect(actor.toState()).toMatchObject({ size: 3 });
    expect(actor.model.scaling.y).toBe(3);
    expect(actor.__collider.scaling.y).toBe(3);
  });

  it('preserves a concurrent successful draw when another draw fails', async () => {
    const actor = stackActor(3);
    let rejectSpawn!: (reason: Error) => void;
    const pendingSpawn = new Promise<ServerBase | null>((_, reject) => {
      rejectSpawn = reject;
    });
    const spawned = { picked: 'client' } as ServerBase;
    const build = vi
      .spyOn(ServerActorBuilder, 'build')
      .mockReturnValueOnce(pendingSpawn)
      .mockResolvedValueOnce(spawned);

    const failed = expect(pickItem(actor, 'client', 1)).rejects.toThrow('asset unavailable');
    await expect(pickItem(actor, 'client', 1)).resolves.toBe(spawned);
    expect(actor.toState()).toMatchObject({ size: 1 });
    await expect(pickItem(actor, 'client', 1)).resolves.toBeNull();
    expect(build).toHaveBeenCalledTimes(2);

    rejectSpawn(new Error('asset unavailable'));
    await failed;

    expect(actor.toState()).toMatchObject({ size: 2 });
    expect(actor.model.scaling.y).toBe(2);
    expect(actor.__collider.scaling.y).toBe(2);
  });
});
