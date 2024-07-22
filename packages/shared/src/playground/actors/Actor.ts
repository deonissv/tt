import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { ActorState } from '@shared/dto/states';
import { ActorBase } from './ActorBase';

export class Actor extends ActorBase {
  public __state: ActorState;

  constructor(actorState: ActorState, modelMesh: Mesh, colliderMesh?: Mesh) {
    super(
      actorState.guid,
      actorState.name,
      modelMesh,
      colliderMesh,
      actorState.transformation,
      actorState.mass,
      actorState.colorDiffuse,
    );
    this.__state = actorState;
  }

  static async fromState(actorState: ActorState): Promise<Actor | null> {
    const modelMesh = await Actor.modelFromState(actorState);
    if (!modelMesh) {
      // eslint-disable-next-line no-console
      console.log('Failed to load model mesh');
      return null;
    }

    const colliderMesh = (await Actor.colliderFromState(actorState)) ?? undefined;
    return new Actor(actorState, modelMesh, colliderMesh);
  }
}
