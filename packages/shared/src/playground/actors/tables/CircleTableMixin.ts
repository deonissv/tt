import { Mesh } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { ActorType } from '@shared/dto/states';
import { Loader } from '@shared/playground/Loader';
import { getGlassMaterial } from '@shared/playground/materials/glassMaterial';
import type { Constructor } from '@shared/types';
import type { SharedBase } from '../SharedBase';

export const CircleTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class CircleTable extends Base {
    static async fromState<T extends CircleTable>(this: Constructor<T>): Promise<T | null> {
      const glass = await Loader.loadMesh(`${STATIC_HOST}/glass.obj`);
      const legs = await Loader.loadMesh(`${STATIC_HOST}/legs2088.obj`);
      const top = await Loader.loadMesh(`${STATIC_HOST}/table_top2064.obj`);

      if (!glass || !legs || !top) return null;
      [glass, legs, top].forEach(mesh => mesh.setEnabled(true));

      glass.material = getGlassMaterial();
      const woodMaterial = await Loader.loadModelMaterial({
        diffuseURL: `${STATIC_HOST}/wood_diff.png`,
        specularURL: `${STATIC_HOST}/wood_spec.png`,
      });

      if (woodMaterial) {
        legs.material = woodMaterial;
        top.material = woodMaterial;
      }

      const wrapper = new Mesh('circle_table_wrapper');
      wrapper.addChild(glass);
      wrapper.addChild(legs);
      wrapper.addChild(top);
      wrapper.position.y = -18;

      const table = new this(
        {
          guid: '#CircleTable',
          name: '#CircleTable',
          type: ActorType.TABLE,
        },
        wrapper,
      );
      if (table) {
        table.model.isPickable = false;
      }

      return table;
    }
  };
};
