import { Mesh } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { Loader } from '../../Loader';
import { ActorBase } from '../ActorBase';

export class OctagonTable extends ActorBase {
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

    const table = new OctagonTable('#OctagonTable', '#OctagonTable', wrapper);
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}
