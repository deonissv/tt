import { Color3, type StandardMaterial } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { ActorType } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import { meshSizes } from '@shared/utils';
import { Loader } from '../../Loader';
import type { SharedBase } from '../SharedBase';

const SQUARE_TABLE_MODEL = {
  meshURL: `${STATIC_HOST}/TableSquare.obj`,
  //   diffuseURL: `${STATIC_HOST}/table_square_myMaterial1_Diffuse.png`,
  //   normalURL: `${STATIC_HOST}/table_square_myMaterial1_Normal.png`,
  //   specularURL: `${STATIC_HOST}/table_square_myMaterial1_Spec_Gloss.png`,
  diffuseURL: `${STATIC_HOST}/Table02_diff.png`,
  specularURL: `${STATIC_HOST}/Table02_spec.png`,
  normalURL: `${STATIC_HOST}/Table02_nrm.png`,
};

// export const SquareTableMixin = (Base: Constructor<SharedActor>) => {
export const SquareTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class SquareTable extends Base {
    static async fromState<T extends SquareTable>(this: Constructor<T>): Promise<T | null> {
      const [model, _] = await Loader.loadModel(SQUARE_TABLE_MODEL);

      if (!model) {
        return null;
      }

      model.rotation.x = (6 * Math.PI) / 4;
      const wrapperHeight = meshSizes(model).height;
      model.position.y = -wrapperHeight;
      (model.material as StandardMaterial).diffuseColor = new Color3(0.5, 0, 0);

      const table = new this(
        {
          guid: '#SquareTable',
          name: '#SquareTable',
          type: ActorType.TABLE,
        },
        model,
      );
      if (table) {
        table.model.isPickable = false;
      }
      return table;
    }
  };
};
