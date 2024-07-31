import { Color3, type StandardMaterial } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { meshSizes } from '@shared/utils';
import { Loader } from '../../Loader';
import { ActorBase } from '../ActorBase';

const SQUARE_TABLE_MODEL = {
  meshURL: `${STATIC_HOST}/TableSquare.obj`,
  //   diffuseURL: `${STATIC_HOST}/table_square_myMaterial1_Diffuse.png`,
  //   normalURL: `${STATIC_HOST}/table_square_myMaterial1_Normal.png`,
  //   specularURL: `${STATIC_HOST}/table_square_myMaterial1_Spec_Gloss.png`,
  diffuseURL: `${STATIC_HOST}/Table02_diff.png`,
  specularURL: `${STATIC_HOST}/Table02_spec.png`,
  normalURL: `${STATIC_HOST}/Table02_nrm.png`,
};

export class SquareTable extends ActorBase {
  static async fromState(): Promise<SquareTable | null> {
    const [model, _] = await Loader.loadModel(SQUARE_TABLE_MODEL);

    if (!model) {
      return null;
    }

    model.rotation.x = (6 * Math.PI) / 4;
    const wrapperHeight = meshSizes(model).height;
    model.position.y = -wrapperHeight;
    (model.material as StandardMaterial).diffuseColor = new Color3(0.5, 0, 0);

    const table = new SquareTable('#SquareTable', '#SquareTable', model);
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}
