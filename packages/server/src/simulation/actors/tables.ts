import { CircleTableMixin } from '@shared/playground/actors/tables/CircleTableMixin';

import { CreatePlane, Mesh } from '@babylonjs/core';

import {
  CustomRectangleTableMixin,
  CustomSquareTableMixin,
  GlassTableMixin,
  HexTableMixin,
  OctagonTableMixin,
  PokerTableMixin,
  RectangleTableMixin,
  SquareTableMixin,
} from '@shared/playground';
import type { Constructor } from '@shared/types';
import { Loader } from '@tt/loader';
import { ActorType } from '@tt/states';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

type TableCtor = Constructor<ServerBase>;

export class HexTable extends HexTableMixin<TableCtor>(ServerBase) {
  static async fromState(): Promise<HexTable | null> {
    const top = await Loader.loadMesh(AssetsManager.HEX_TABLE_MODEL.top.meshURL);

    const table = new this(
      {
        guid: '#HexTable',
        name: '#HexTable',
        type: ActorType.ACTOR,
        transformation: AssetsManager.HEX_TABLE_MODEL.transformation,
      },
      top,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}

export class CircleTable extends CircleTableMixin<TableCtor>(ServerBase) {
  static async fromState(): Promise<CircleTable | null> {
    const glass = await Loader.loadMesh(AssetsManager.CIRCLE_TABLE_MODEL.glass.meshURL);
    const top = await Loader.loadMesh(AssetsManager.CIRCLE_TABLE_MODEL.top.meshURL);

    if (!glass || !top) return null;
    [glass, top].forEach(mesh => mesh.setEnabled(true));

    const wrapper = Mesh.MergeMeshes([glass, top], true, false, undefined, false, true)!;
    const table = new this(
      {
        guid: '#CircleTable',
        name: '#CircleTable',
        type: ActorType.ACTOR,
        transformation: AssetsManager.CIRCLE_TABLE_MODEL.transformation,
      },
      wrapper,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}

export class GlassTable extends GlassTableMixin<TableCtor>(ServerBase) {
  static async fromState(): Promise<GlassTable | null> {
    const [glassTop] = await Loader.loadModel(AssetsManager.GLASS_TABLE_MODEL.glassTop);

    if (!glassTop) {
      return null;
    }

    glassTop.setEnabled(true);
    glassTop.position.z = -0.134;

    const wrapper = Mesh.MergeMeshes([glassTop], true, false, undefined, false, true)!;

    const table = new this(
      {
        guid: '#GlassTable',
        name: '#GlassTable',
        type: ActorType.ACTOR,
        transformation: AssetsManager.GLASS_TABLE_MODEL.transformation,
      },
      wrapper,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}
export class SquareTable extends SquareTableMixin<TableCtor>(ServerBase) {
  static async fromState(): Promise<SquareTable | null> {
    const model = await Loader.loadMesh(AssetsManager.SQUARE_TABLE_MODEL.frame.meshURL);
    if (!model) return null;

    model.setEnabled(true);

    const table = new this(
      {
        guid: '#SquareTable',
        name: '#SquareTable',
        type: ActorType.ACTOR,
        transformation: AssetsManager.SQUARE_TABLE_MODEL.transformation,
      },
      model,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}

export class CustomRectangleTable extends CustomRectangleTableMixin<TableCtor>(ServerBase) {
  static async fromState(): Promise<CustomRectangleTable | null> {
    const tableFrame = await Loader.loadMesh(AssetsManager.CUSTOM_RECTANGLE_TABLE.frame.meshURL);
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
        transformation: AssetsManager.CUSTOM_RECTANGLE_TABLE.transformation,
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
    const tableFrame = await Loader.loadMesh(AssetsManager.OCTAGON_TABLE.leg.meshURL);
    if (!tableFrame) return null;
    const table = new this(
      {
        guid: '#OctagonTable',
        name: '#OctagonTable',
        type: ActorType.ACTOR,
        transformation: AssetsManager.OCTAGON_TABLE.transformation,
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
    const tableBox = await Loader.loadMesh(AssetsManager.CUSTOM_SQUARE_TABLE.frame.meshURL);
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
        transformation: AssetsManager.CUSTOM_SQUARE_TABLE.transformation,
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
    const tableFrame = await Loader.loadMesh(AssetsManager.RECTANGLE_TABLE.frame.meshURL);
    const felt = CreatePlane('felt', { width: 56.24, height: 36.33 });
    felt.rotation.x = Math.PI / 2;
    felt.position.y = 0.85;

    if (!tableFrame) return null;
    const wrapper = Mesh.MergeMeshes([tableFrame, felt], true, false, undefined, false, true)!;

    const table = new this(
      {
        guid: '#RectangleTable',
        name: '#RectangleTable',
        type: ActorType.ACTOR,
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
    const frame = await Loader.loadMesh(AssetsManager.POKER_TABLE.frame.meshURL);
    if (!frame) return null;

    const table = new this(
      {
        guid: '#PokerTable',
        name: '#PokerTable',
        type: ActorType.ACTOR,
        transformation: AssetsManager.POKER_TABLE.transformation,
      },
      frame,
    );

    table.model.isPickable = false;
    table.body.setMotionType(0);
    return table;
  }
}
