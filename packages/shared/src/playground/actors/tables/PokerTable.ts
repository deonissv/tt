import { Mesh, Vector3 } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { Loader } from '../../Loader';
import { ActorBase } from '../ActorBase';

export class PokerTable extends ActorBase {
  static async fromState(): Promise<typeof this.prototype | null> {
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

    wrapper.scaling = Vector3.FromArray(Array(3).fill(40.5));
    wrapper.position.y = -9.25;
    wrapper.rotation.x = (3 * Math.PI) / 2;

    const table = new PokerTable('#PokerTable', '#PokerTable', wrapper);
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}
