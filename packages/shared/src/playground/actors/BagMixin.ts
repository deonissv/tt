import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { BAG_MODEL } from '@shared/assets';
import type { BagState } from '@shared/dto/states';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import type { Constructor } from '@shared/types';
import { Loader } from '../Loader';
import type { SharedBase } from './SharedBase';

export const BagMixin = <T extends Constructor<SharedBase<BagState>>>(Base: T) => {
  return class Bag extends Base {
    items: UnknownActorState[];

    get size() {
      return this.items.length;
    }

    static async getBagMesh(): Promise<Mesh | null> {
      const mesh = await Loader.loadMesh(BAG_MODEL.meshURL);
      if (!mesh) return null;

      mesh.setEnabled(true);
      mesh.rotation.x = (3 * Math.PI) / 2;

      return Mesh.MergeMeshes([mesh], true, false, undefined, false, true)!;
    }
  };
};
