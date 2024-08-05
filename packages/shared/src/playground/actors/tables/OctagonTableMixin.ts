import { Mesh } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { ActorType } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import { degToRad } from '@shared/utils';
import { Loader } from '../../Loader';
import type { SharedBase } from '../SharedBase';

export const OctagonTableMixin = (Base: Constructor<SharedBase>) => {
  return class OctagonTable extends Base {
    static async fromState(): Promise<OctagonTable | null> {
      const [leg, _] = await Loader.loadModel({
        meshURL: `${STATIC_HOST}/Legs.obj`,
        diffuseURL: `${STATIC_HOST}/wood_diff.png`,
        specularURL: `${STATIC_HOST}/wood_spec.png`,
      });

      const [top, __] = await Loader.loadModel({
        meshURL: `${STATIC_HOST}/OctagonTable_wood1992.obj`,
        diffuseURL: `${STATIC_HOST}/wood_diff.png`,
        specularURL: `${STATIC_HOST}/wood_spec.png`,
        // diffuseURL: `${STATIC_HOST}/OctagonTable_diff.png`,
        // normalURL: `${STATIC_HOST}/OctagonTable_nrm.png`,
        // specularURL: `${STATIC_HOST}/OctagonTable_spec.png`,
      });

      if (!top || !leg) return null;
      [leg, top].forEach(mesh => mesh.setEnabled(true));

      leg.position.z = -14;
      const wrapper = new Mesh('octagon_table_wrapper');
      wrapper.addChild(top);
      wrapper.addChild(leg);

      wrapper.rotation.x = (6 * Math.PI) / 4;
      wrapper.rotation.y = degToRad(22.5);
      wrapper.scaling = wrapper.scaling.scale(1.04);
      wrapper.position.y = -0.65;

      const table = new OctagonTable(
        {
          guid: '#OctagonTable',
          name: '#OctagonTable',
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
