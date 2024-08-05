import { CreatePlane, Mesh, Vector3 } from '@babylonjs/core';
import { feltMaterialProps } from '@shared/assets';
import { STATIC_HOST } from '@shared/constants';
import { ActorType, type TableState } from '@shared/dto/states';
import { Loader } from '@shared/playground/Loader';
import type { Constructor } from '@shared/types';
import type { SharedBase } from '../SharedBase';

const SCALING = 79;

const model = {
  meshURL: `${STATIC_HOST}/GreenFelt_Table.obj`,
  diffuseURL: `${STATIC_HOST}/GreenFeltTable_D.png`,
  specularURL: `${STATIC_HOST}/GreenFeltTable_S.png`,
  normalURL: `${STATIC_HOST}/GreenFeltTable_N.png`,
};

export const CustomRectangleTableMixin = <T extends Constructor<SharedBase>>(Base: T) => {
  return class CustomRectangleTable extends Base {
    static async fromState(tableState: TableState): Promise<CustomRectangleTable | null> {
      const [tableFrame, _] = await Loader.loadModel(model);
      const grid = await Loader.loadMesh(`${STATIC_HOST}/GreenFelt_Table_Grid.obj`);
      if (!tableFrame || !grid) return null;
      const wrapper = new Mesh('rectangle_table_wrapper');
      [tableFrame, grid].forEach(mesh => mesh.setEnabled(true));
      [tableFrame, grid].forEach(mesh => wrapper.addChild(mesh));
      if (grid) {
        grid.material = tableFrame.material;
        grid.rotation.x = -Math.PI / 2;
        grid.position.y = 0.215;
      }
      const plane = CreatePlane('plane', { width: 1.108891, height: 0.66187126 });
      plane.rotation.x = Math.PI / 2;
      plane.position.y = 0.3;
      const planeMatetialProps = tableState.url ? { diffuseURL: tableState.url } : feltMaterialProps;
      const planeMatetial = await Loader.loadModelMaterial(planeMatetialProps);
      plane.material = planeMatetial;
      wrapper.addChild(plane);
      wrapper.scaling = new Vector3(SCALING, SCALING, SCALING);
      wrapper.position.y = -23.2;
      const table = new CustomRectangleTable(
        {
          guid: '#CustomRectangleTable',
          name: '#CustomRectangleTable',
          type: ActorType.TABLE,
        },
        wrapper,
      );
      if (table) {
        table.model.isPickable = false;
      }
      return table;
    }
  };
};
