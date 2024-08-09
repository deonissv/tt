import { Mesh } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { ActorType } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import { Loader } from '../../Loader';
import type { SharedBase } from '../SharedBase';

export const PokerTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class PokerTable extends Base {
    static async fromState<T extends PokerTable>(this: Constructor<T>): Promise<T | null> {
      const [frame, _] = await Loader.loadModel({
        meshURL: `${STATIC_HOST}/table_poker.obj`,
        diffuseURL: `${STATIC_HOST}/table_poker_diff.png`,
        specularURL: `${STATIC_HOST}/table_poker_spec.png`,
        normalURL: `${STATIC_HOST}/table_poker_nrm.png`,
      });

      const [legs, __] = await Loader.loadModel({
        meshURL: `${STATIC_HOST}/table_poker_legs.obj`,
        diffuseURL: `${STATIC_HOST}/table_poker_legs_diff.png`,
        normalURL: `${STATIC_HOST}/table_poker_legs_nrm.png`,
      });

      if (!frame || !legs) return null;

      const wrapper = new Mesh('poker_table_wrapper');
      [frame, legs].forEach(mesh => mesh.setEnabled(true));
      [frame, legs].forEach(mesh => wrapper.addChild(mesh));

      legs.position.z = -0.223;

      wrapper.scaling = wrapper.scaling.scale(40.5);
      wrapper.position.y = -9.25;
      wrapper.rotation.x = (3 * Math.PI) / 2;

      const table = new this(
        {
          guid: '#PokerTable',
          name: '#PokerTable',
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
