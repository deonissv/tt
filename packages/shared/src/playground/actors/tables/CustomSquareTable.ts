import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';

import { Mesh } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { STATIC_HOST } from '@shared/constants';
import type { TableState } from '@shared/dto/states';
import { Loader } from '../../Loader';
import { ActorBase } from '../ActorBase';

const SCALE = 60.5;

const modelURLs = {
  meshURL: `${STATIC_HOST}/table_square.obj`,
  diffuseURL: `${STATIC_HOST}/table_square_myMaterial1_Diffuse.png`,
  normalURL: `${STATIC_HOST}/table_square_myMaterial1_Normal.png`,
  specularURL: `${STATIC_HOST}/table_square_myMaterial1_Spec_Gloss.png`,
};

export class CustomSquareTable extends ActorBase {
  static async fromState(tableState: TableState): Promise<CustomSquareTable | null> {
    const [tableBox, _tableCollider] = await Loader.loadModel(modelURLs);
    if (!tableBox) return null;
    tableBox.setEnabled(true);

    const plane = CreatePlane('CustomSquareTablePlane', { size: 0.8554 });
    plane.rotation.x = Math.PI / 2;
    plane.position.y = 0.85;

    const planeMatetial = await Loader.loadModelMaterial({ diffuseURL: tableState.url! });
    plane.material = planeMatetial;

    const wrapper = new Mesh('CustomSquareTable');
    wrapper.addChild(tableBox);
    wrapper.addChild(plane);
    wrapper.scaling = new Vector3(SCALE, SCALE, SCALE);
    wrapper.position.y = -51.3;

    const table = new CustomSquareTable('#CustomSquareTable', '#CustomSquareTable', wrapper);
    if (tableBox) {
      table.model.isPickable = false;
    }

    return table;
  }
}
