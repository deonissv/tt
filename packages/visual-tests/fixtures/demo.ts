import {
  ActorType,
  type ActorState,
  type BagState,
  type DeckState,
  type SimulationStateSave,
  type TileStackState,
  type UnknownActorState,
} from '@tt/states';
import scene from './scene.json';
import { ACTOR_MANIFEST } from './manifest';
import initialPoses from './targeting/poses.json';

const ACTOR_GUIDS = new Set(ACTOR_MANIFEST.map(actor => actor.guid));

type FixtureVariant =
  | 'default'
  | 'depleting-containers'
  | 'empty-bag'
  | 'empty-deck'
  | 'exhausted-tile-stack'
  | 'failed-bag-item'
  | 'face-down-deck'
  | 'locked-actor'
  | 'persistence'
  | 'shuffle-bag'
  | 'static-scene';

function assetOrigins(value: unknown, origin: string): unknown {
  if (typeof value === 'string') return value.replace('http://visual-assets.invalid', origin);
  if (Array.isArray(value)) return value.map(item => assetOrigins(item, origin));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, assetOrigins(child, origin)]));
  }
  return value;
}

const getActor = <T extends UnknownActorState>(state: SimulationStateSave, guid: string): T => {
  const actor = state.actorStates?.find(candidate => candidate.guid === guid);
  if (!actor) throw new Error(`Fixture actor ${guid} is missing from the reviewed scene`);
  return actor as T;
};

const applyVariant = (state: SimulationStateSave, variant: FixtureVariant): void => {
  if (variant === 'face-down-deck') {
    getActor<DeckState>(state, 'fb31d5').transformation!.rotation = [Math.PI, 0, 0];
  }
  if (variant === 'depleting-containers') {
    const bag = getActor<BagState>(state, '7a0b0b');
    const deck = getActor<DeckState>(state, 'fb31d5');
    bag.containedObjects = bag.containedObjects.slice(-1);
    deck.cards = deck.cards.slice(-1);
    // Rectangle felt is at Y=0.85; avoid dropping a thin deck from the default Y=4.
    deck.transformation!.position![1] = 1;
    getActor<TileStackState>(state, '51d35d').size = 2;
  }
  if (variant === 'static-scene') {
    for (const actor of state.actorStates ?? []) actor.locked = true;
  }
  if (variant === 'persistence') {
    for (const actor of state.actorStates ?? []) actor.locked = !['fb31d5', 'cabfb6'].includes(actor.guid);
  }
  if (variant === 'locked-actor') {
    getActor(state, '3b9ed5').locked = true;
  }
  if (variant === 'shuffle-bag') {
    const bag = getActor<BagState>(state, '7a0b0b');
    const item = bag.containedObjects[0];
    bag.containedObjects = Array.from({ length: 8 }, (_, index) => ({
      ...structuredClone(item),
      guid: `ba${index.toString(16).padStart(4, '0')}`,
    }));
  }
  if (variant === 'empty-bag') {
    getActor<BagState>(state, '7a0b0b').containedObjects = [];
  }
  if (variant === 'empty-deck') {
    getActor<DeckState>(state, 'fb31d5').cards = [];
  }
  if (variant === 'exhausted-tile-stack') {
    getActor<TileStackState>(state, '51d35d').size = 1;
  }
  if (variant === 'failed-bag-item') {
    const bag = getActor<BagState>(state, '7a0b0b');
    const localModelUrl = getActor<ActorState>(state, '3b9ed5').model.meshURL.replace('Cube.obj', 'missing.obj');
    bag.containedObjects[bag.containedObjects.length - 1] = {
      type: ActorType.ACTOR,
      guid: 'bad001',
      name: 'Missing visual fixture actor',
      model: { meshURL: localModelUrl },
      transformation: {
        position: [0, 1, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    };
  }
};

export const buildDemoFixture = (
  staticHost: string,
  variant: FixtureVariant = 'default',
  actorGuids?: readonly string[],
): SimulationStateSave => {
  const state = assetOrigins(scene, staticHost) as SimulationStateSave;
  if (variant !== 'static-scene') {
    const poses: Record<
      string,
      Record<string, { position: number[]; rotation: number[]; scale: number[] }>
    > = initialPoses.profiles;
    for (const actor of state.actorStates ?? []) {
      const pose = poses[variant]?.[actor.guid] ?? poses.default[actor.guid];
      if (pose)
        actor.transformation = {
          position: [pose.position[0], pose.position[1], pose.position[2]],
          rotation: [pose.rotation[0], pose.rotation[1], pose.rotation[2]],
          scale: [pose.scale[0], pose.scale[1], pose.scale[2]],
        };
    }
  }
  applyVariant(state, variant);
  if (actorGuids) {
    for (const guid of actorGuids) {
      if (!ACTOR_GUIDS.has(guid)) throw new Error(`Unknown visual fixture actor: ${guid}`);
    }
    state.actorStates = state.actorStates!.filter(actor => actorGuids.includes(actor.guid));
  }
  return state;
};

export type { FixtureVariant };
