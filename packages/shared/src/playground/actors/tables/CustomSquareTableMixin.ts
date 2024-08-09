import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';

import { Mesh } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { STATIC_HOST } from '@shared/constants';
import { ActorType, type TableState } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import { Loader } from '../../Loader';
import type { SharedBase } from '../SharedBase';

const SCALE = 60.5;

const modelURLs = {
  meshURL: `${STATIC_HOST}/table_square.obj`,
  diffuseURL: `${STATIC_HOST}/table_square_myMaterial1_Diffuse.png`,
  normalURL: `${STATIC_HOST}/table_square_myMaterial1_Normal.png`,
  specularURL: `${STATIC_HOST}/table_square_myMaterial1_Spec_Gloss.png`,
};

export const CustomSquareTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class CustomSquareTable extends Base {
    static async fromState<T extends CustomSquareTable>(
      this: Constructor<T>,
      tableState: TableState,
    ): Promise<T | null> {
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

      const table = new this(
        {
          guid: '#CustomSquareTable',
          name: '#CustomSquareTable',
          type: ActorType.TABLE,
        },
        wrapper,
      );
      if (tableBox) {
        table.model.isPickable = false;
      }

      return table;
    }
  };
};
