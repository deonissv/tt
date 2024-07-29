import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';

import { STATIC_HOST } from '@shared/constants';
import type { TableState } from '@shared/dto/states';
import { meshSizes } from '@shared/utils';
import { Loader } from '../Loader';
import { ActorBase } from './ActorBase';

const SCALING = 79;

const model = {
  meshURL: `${STATIC_HOST}/GreenFelt_Table.obj`,
  diffuseURL: `${STATIC_HOST}/GreenFeltTable_D.png`,
  specularURL: `${STATIC_HOST}/GreenFeltTable_S.png`,
  normalURL: `${STATIC_HOST}/GreenFeltTable_N.png`,
};

export class CustomRectangleTable extends ActorBase {
  static async fromState(tableState: TableState): Promise<CustomRectangleTable | null> {
    const wrapper = await Loader.loadMesh(`${STATIC_HOST}/GreenFelt_Table.obj`);
    if (!wrapper) {
      return null;
    }

    const material = await Loader.loadModelMaterial(model);
    wrapper.material = material;

    const grid = await Loader.loadMesh(`${STATIC_HOST}/GreenFelt_Table_Grid.obj`);

    if (grid) {
      grid.material = material;
      wrapper.addChild(grid);
      grid.rotation.x = -Math.PI / 2;
    }

    const felt = await Loader.loadMesh(`${STATIC_HOST}/GreenFelt_Table_Felt.obj`);

    if (!felt) {
      return null;
    }

    const { width, depth } = meshSizes(felt);

    const plane = CreatePlane('plane', { width: width, height: depth });
    plane.rotation.x = Math.PI / 2;
    plane.position.y = 0.3;

    const planeMatetial = await Loader.loadModelMaterial({ diffuseURL: tableState.url! });
    plane.material = planeMatetial;
    wrapper.addChild(plane);

    wrapper.scaling = new Vector3(SCALING, SCALING, SCALING);
    const wrapperHeight = meshSizes(wrapper).height;
    wrapper.position.y = -(wrapperHeight * SCALING) / 2;

    const table = new CustomRectangleTable('#CustomRectangleTable', '#CustomRectangleTable', wrapper);
    if (table) {
      table.model.isPickable = false;
    }
    return table;
  }
}
