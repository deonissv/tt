import { Mesh } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { ActorType } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import { Loader } from '../../Loader';
import type { SharedBase } from '../SharedBase';

export const HexTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class HexTable extends Base {
    static async fromState<T extends HexTable>(this: Constructor<T>): Promise<T | null> {
      const [leg, _] = await Loader.loadModel({
        meshURL: `${STATIC_HOST}/Legs.obj`,
        diffuseURL: `${STATIC_HOST}/wood_diff.png`,
        specularURL: `${STATIC_HOST}/wood_spec.png`,
      });

      const [top, __] = await Loader.loadModel({
        meshURL: `${STATIC_HOST}/HexagonTable_wood.obj`,
        diffuseURL: `${STATIC_HOST}/wood_diff.png`,
        specularURL: `${STATIC_HOST}/wood_spec.png`,
        // diffuseURL: `${STATIC_HOST}/HexagonTable_diff.png`,
        // normalURL: `${STATIC_HOST}/HexagonTable_nrm.png`,
        // specularURL: `${STATIC_HOST}/HexagonTable_spec.png`,
      });

      if (!top || !leg) return null;
      [leg, top].forEach(mesh => mesh.setEnabled(true));

      leg.position.z = -14;
      const wrapper = new Mesh('hex_table_wrapper');
      wrapper.addChild(top);
      wrapper.addChild(leg);
      wrapper.rotation.x = (6 * Math.PI) / 4;
      wrapper.rotation.y = Math.PI / 6;
      wrapper.scaling = wrapper.scaling.scale(0.94);
      wrapper.position.y = -0.5;

      const table = new this(
        {
          guid: '#HexTable',
          name: '#HexTable',
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
