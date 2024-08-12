import { CircleTableMixin } from '@shared/playground/actors/tables/CircleTableMixin';

import { CreatePlane, Mesh } from '@babylonjs/core';
import {
  CUSTOM_RECTANGLE_TABLE,
  CUSTOM_SQUARE_TABLE,
  OCTAGON_TABLE,
  POKER_TABLE,
  RECTANGLE_TABLE,
} from '@shared/assets';
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
import type { Constructor } from '@shared/types';
import { ServerBase } from './serverBase';

type TableCtor = Constructor<ServerBase>;

export class HexTable extends HexTableMixin<TableCtor>(ServerBase) {}
export class CircleTable extends CircleTableMixin<TableCtor>(ServerBase) {}
export class GlassTable extends GlassTableMixin<TableCtor>(ServerBase) {}
export class SquareTable extends SquareTableMixin<TableCtor>(ServerBase) {}

export class CustomRectangleTable extends CustomRectangleTableMixin<TableCtor>(ServerBase) {
  static async fromState(_tableState: TableState): Promise<CustomRectangleTable | null> {
    const tableFrame = await Loader.loadMesh(CUSTOM_RECTANGLE_TABLE.frame.meshURL);
    if (!tableFrame) return null;

    const plane = CreatePlane('plane', { width: 1.108891, height: 0.66187126 });
    plane.rotation.x = Math.PI / 2;
    plane.position.y = 0.3;

    tableFrame.setEnabled(true);
    const collider = Mesh.MergeMeshes([tableFrame, plane], true, false, undefined, false, true)!;

    const table = new this(
      {
        guid: '#CustomRectangleTable',
        name: '#CustomRectangleTable',
        type: ActorType.ACTOR,
        transformation: CUSTOM_RECTANGLE_TABLE.transformation,
      },
      collider,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}

export class OctagonTable extends OctagonTableMixin<TableCtor>(ServerBase) {
  static async fromState(): Promise<OctagonTable | null> {
    const tableFrame = await Loader.loadMesh(OCTAGON_TABLE.leg.meshURL);
    if (!tableFrame) return null;
    const table = new this(
      {
        guid: '#OctagonTable',
        name: '#OctagonTable',
        type: ActorType.ACTOR,
        transformation: OCTAGON_TABLE.transformation,
      },
      tableFrame,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}
export class CustomSquareTable extends CustomSquareTableMixin<TableCtor>(ServerBase) {
  static async fromState(): Promise<CustomSquareTable | null> {
    const tableBox = await Loader.loadMesh(CUSTOM_SQUARE_TABLE.frame.meshURL);
    if (!tableBox) return null;

    const plane = CreatePlane('CustomSquareTablePlane', { size: 0.8554 });
    plane.rotation.x = Math.PI / 2;
    plane.position.y = 0.85;

    tableBox.setEnabled(true);

    const wrapper = Mesh.MergeMeshes([tableBox, plane], true, false, undefined, false, true)!;
    const table = new this(
      {
        guid: '#CustomSquareTable',
        name: '#CustomSquareTable',
        type: ActorType.ACTOR,
        transformation: CUSTOM_SQUARE_TABLE.transformation,
      },
      wrapper,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}

export class RectangleTable extends RectangleTableMixin<TableCtor>(ServerBase) {
  static async fromState(): Promise<RectangleTable | null> {
    const tableFrame = await Loader.loadMesh(RECTANGLE_TABLE.frame.meshURL);
    const felt = await Loader.loadMesh(RECTANGLE_TABLE.felt.meshURL);

    if (!tableFrame || !felt) return null;
    const wrapper = Mesh.MergeMeshes([tableFrame, felt], true, false, undefined, false, true)!;

    const table = new this(
      {
        guid: '#RectangleTable',
        name: '#RectangleTable',
        type: ActorType.ACTOR,
        transformation: RECTANGLE_TABLE.transformation,
      },
      wrapper,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}

export class PokerTable extends PokerTableMixin<TableCtor>(ServerBase) {
  static async fromState<T extends PokerTable>(this: Constructor<T>): Promise<T | null> {
    const frame = await Loader.loadMesh(POKER_TABLE.frame.meshURL);
    if (!frame) return null;

    const table = new this(
      {
        guid: '#PokerTable',
        name: '#PokerTable',
        type: ActorType.ACTOR,
        transformation: POKER_TABLE.transformation,
      },
      frame,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}
