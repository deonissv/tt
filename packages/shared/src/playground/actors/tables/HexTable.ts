import { Mesh } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { Loader } from '../../Loader';
import { ActorBase } from '../ActorBase';

export class HexTable extends ActorBase {
  static async fromState(): Promise<HexTable | null> {
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

    const table = new HexTable('#HexTable', '#HexTable', wrapper);
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}
