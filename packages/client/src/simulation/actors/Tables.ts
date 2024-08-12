import { CircleTableMixin } from '@shared/playground/actors/tables/CircleTableMixin';

import { CreatePlane, Mesh, Vector3 } from '@babylonjs/core';
import { CUSTOM_RECTANGLE_TABLE, feltMaterialProps, RECTANGLE_TABLE } from '@shared/assets';
import type { TableState } from '@shared/dto/states';
import { ActorType } from '@shared/dto/states';
import {
  CustomRectangleTableMixin,
  CustomSquareTableMixin,
  GlassTableMixin,
  HexTableMixin,
  Loader,
  OctagonTableMixin,
  PokerTableMixin,
  RectangleTableMixin,
  SquareTableMixin,
} from '@shared/playground';
import { ClientBase } from './ClientBase';

export class HexTable extends HexTableMixin(ClientBase) {}
export class CircleTable extends CircleTableMixin(ClientBase) {}
export class GlassTable extends GlassTableMixin(ClientBase) {}
export class SquareTable extends SquareTableMixin(ClientBase) {}
export class CustomRectangleTable extends CustomRectangleTableMixin(ClientBase) {
  static async fromState(tableState: TableState): Promise<CustomRectangleTable | null> {
    const [tableFrame, _] = await Loader.loadModel(CUSTOM_RECTANGLE_TABLE.frame);
    const grid = await Loader.loadMesh(CUSTOM_RECTANGLE_TABLE.grid.meshURL);
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
    wrapper.scaling = Vector3.FromArray(CUSTOM_RECTANGLE_TABLE.scaling);
    wrapper.position.y = -23.2;
    const table = new this(
      {
        guid: '#CustomRectangleTable',
        name: '#CustomRectangleTable',
        type: ActorType.ACTOR,
      },
      wrapper,
    );
    if (table) {
      table.model.isPickable = false;
    }
    return table;
  }
}
export class OctagonTable extends OctagonTableMixin(ClientBase) {}
export class CustomSquareTable extends CustomSquareTableMixin(ClientBase) {}
export class RectangleTable extends RectangleTableMixin(ClientBase) {
  static async fromState(): Promise<RectangleTable | null> {
    const [tableFrame, _] = await Loader.loadModel(RECTANGLE_TABLE.frame);

    const handles = await Loader.loadMesh(RECTANGLE_TABLE.handles.meshURL);
    const [felt, __] = await Loader.loadModel(RECTANGLE_TABLE.felt);

    if (!tableFrame || !handles || !felt) return null;

    const wrapper = new Mesh('rectangle_table_wrapper');
    [tableFrame, handles, felt].forEach(mesh => mesh.setEnabled(true));
    [tableFrame, handles, felt].forEach(mesh => wrapper.addChild(mesh));

    wrapper.rotation.x = (3 * Math.PI) / 2;
    wrapper.position.y = -1.4;
    wrapper.scaling = wrapper.scaling.scale(1.01);

    const table = new this(
      {
        guid: '#RectangleTable',
        name: '#RectangleTable',
        type: ActorType.ACTOR,
      },
      wrapper,
    );
    if (table) {
      table.model.isPickable = false;
    }

    return table;
  }
}
export class PokerTable extends PokerTableMixin(ClientBase) {}
