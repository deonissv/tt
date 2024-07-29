import { Mesh } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { Loader } from '../Loader';
import { getGlassMaterial } from '../materials/glassMaterial';
import { ActorBase } from './ActorBase';

export class CircleTable extends ActorBase {
  static async fromState(): Promise<CircleTable | null> {
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

    const table = new CircleTable('#CircleTable', '#CircleTable', wrapper);
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}
