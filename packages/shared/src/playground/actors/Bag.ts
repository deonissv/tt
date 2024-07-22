import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { STATIC_HOST } from '@shared/constants';
import type { ActorStateBase, BagState, Model } from '@shared/dto/states';
import type { Containable } from '../actions/Containable';
import { Loader } from '../Loader';
import { SimulationBase } from '../Simulation';
import { ActorBase } from './ActorBase';

const BAG_MASS = 1;

const BAG_MODEL: Model = {
  meshURL: `${STATIC_HOST}/Group1.obj`,
  normalURL: `${STATIC_HOST}/bag_N.png`,
  specularURL: `${STATIC_HOST}/bag_S.png`,
  diffuseURL: `${STATIC_HOST}/2-bag_D_gray.png`,
};

export class Bag extends ActorBase implements Containable {
  declare __state: BagState;
  items: ActorStateBase[];

  constructor(state: BagState, model: Mesh, colliderMesh?: Mesh) {
    super(state.guid, state.name, model, colliderMesh, state.transformation, BAG_MASS, undefined, state);

    this.items = state.containedObjects;
  }

  get size() {
    return this.items.length;
  }

  async pick() {
    if (this.size < 1) {
      return null;
    }

    const item = this.items.pop()!;
    await SimulationBase.actorFromState(item);
    return item;
  }

  static override async fromState(state: BagState) {
    const modelState: Model = state.model ?? BAG_MODEL;
    const [model, collider] = await Loader.loadModel(modelState);

    if (!model) {
      return null;
    }

    return new Bag(state, model, collider ?? undefined);
  }

  async pickItem() {
    if (this.size < 1) {
      return;
    }

    const item = this.items.pop()!;

    item.transformation = this.transformation;
    item.transformation.position![0] -= 4;

    const newActor = await SimulationBase.actorFromState(item);
    return newActor;
  }
}
