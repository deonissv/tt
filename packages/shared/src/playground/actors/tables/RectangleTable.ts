import { Mesh } from '@babylonjs/core';
import { feltMaterialProps, woodMaterialProps } from '@shared/assets';
import { STATIC_HOST } from '@shared/constants';
import { Loader } from '../../Loader';
import { ActorBase } from '../ActorBase';

export class RectangleTable extends ActorBase {
  static async fromState(): Promise<RectangleTable | null> {
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

    const table = new RectangleTable('#RectangleTable', '#RectangleTable', wrapper);
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}
