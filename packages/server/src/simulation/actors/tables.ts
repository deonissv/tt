import { CircleTableMixin } from '@shared/playground/actors/tables/CircleTableMixin';

import { CreatePlane, Mesh, type Tuple } from '@babylonjs/core';
import { CUSTOM_RECTANGLE_TABLE, OCTAGON_TABLE, POKER_TABLE, RECTANGLE_TABLE } from '@shared/assets';
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
import { degToRad } from '@shared/utils';
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
        transformation: {
          position: [0, -23.2, 0],
          rotation: [0, 0, 0],
          scale: CUSTOM_RECTANGLE_TABLE.scaling,
        },
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
        transformation: {
          position: [0, -0.65, 0],
          rotation: [(6 * Math.PI) / 4, degToRad(22.5), 0],
          scale: Array(3).fill(1.04) as Tuple<number, 3>,
        },
      },
      tableFrame,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}
export class CustomSquareTable extends CustomSquareTableMixin<TableCtor>(ServerBase) {}

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
        transformation: {
          position: [0, -1.4, 0],
          rotation: [(3 * Math.PI) / 2, 0, 0],
          scale: RECTANGLE_TABLE.scaling,
        },
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
        transformation: {
          scale: POKER_TABLE.scaling,
          position: [0, -9.25, 0],
          rotation: [(3 * Math.PI) / 2, 0, 0],
        },
      },
      frame,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}
