import { CircleTableMixin } from '@shared/playground/actors/tables/CircleTableMixin';
import { ServerActor } from './serverActor';

import type { Tuple } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import { ActorType, type ActorBaseState } from '@shared/dto/states';
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

type TableCtor = Constructor<ServerActor>;

export class HexTable extends HexTableMixin<TableCtor>(ServerActor) {}
export class CircleTable extends CircleTableMixin<TableCtor>(ServerActor) {}
export class GlassTable extends GlassTableMixin<TableCtor>(ServerActor) {}
export class SquareTable extends SquareTableMixin<TableCtor>(ServerActor) {}
export class CustomRectangleTable extends CustomRectangleTableMixin<TableCtor>(ServerActor) {}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class OctagonTable extends OctagonTableMixin<TableCtor>(ServerActor) {
  static override async fromState(): Promise<OctagonTable | null> {
    const tableFrame = await Loader.loadMesh(`${STATIC_HOST}/OctagonTable_wood1992.obj`);
    if (!tableFrame) return null;
    // tableFrame.rotation.x = (6 * Math.PI) / 4;
    // tableFrame.rotation.y = degToRad(22.5);
    // tableFrame.scaling = tableFrame.scaling.scale(1.04);
    // tableFrame.position.y = -0.65;
    const state: ActorBaseState = {
      guid: '#OctagonTable',
      name: '#OctagonTable',
      type: ActorType.TABLE,
      transformation: {
        position: [0, -0.65, 0],
        rotation: [(6 * Math.PI) / 4, degToRad(22.5), 0],
        scale: Array(3).fill(1.04) as Tuple<number, 3>,
      },
    };
    const table = new OctagonTable(state, tableFrame);
    if (table) {
      table.model.isPickable = false;
    }
    table.body.setMotionType(0);
    return table;
  }
}
export class CustomSquareTable extends CustomSquareTableMixin<TableCtor>(ServerActor) {}
export class RectangleTable extends RectangleTableMixin<TableCtor>(ServerActor) {}
export class PokerTable extends PokerTableMixin<TableCtor>(ServerActor) {}
