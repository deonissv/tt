import { Mesh } from '@babylonjs/core';
import { feltMaterialProps, woodMaterialProps } from '@shared/assets';
import { STATIC_HOST } from '@shared/constants';
import { ActorType } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import { Loader } from '../../Loader';
import type { SharedBase } from '../SharedBase';

export const RectangleTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class RectangleTable extends Base {
    static async fromState<T extends RectangleTable>(this: Constructor<T>): Promise<T | null> {
      const [tableFrame, _] = await Loader.loadModel({
        meshURL: `${STATIC_HOST}/rpg_table_wood2057.obj`,
        ...woodMaterialProps,
      });

      const handles = await Loader.loadMesh(`${STATIC_HOST}/rpg_table_handles.obj`);
      const [felt, __] = await Loader.loadModel({
        meshURL: `${STATIC_HOST}/rpg_table_felt.obj`,
        ...feltMaterialProps,
      });

      if (!tableFrame || !handles || !felt) return null;

      const wrapper = new Mesh('rectangle_table_wrapper');
      [tableFrame, handles, felt].forEach(mesh => mesh.setEnabled(true));
      [tableFrame, handles, felt].forEach(mesh => wrapper.addChild(mesh));

      wrapper.rotation.x = (3 * Math.PI) / 2;
      wrapper.position.y = -1.4;
      wrapper.scaling = wrapper.scaling.scale(1.01);

      const table = new this(
        {
          guid: '#RectangleTable',
          name: '#RectangleTable',
          type: ActorType.ACTOR,
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
