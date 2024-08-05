import { CircleTableMixin } from '@shared/playground/actors/tables/CircleTableMixin';
import { ClientBase } from './ClientBase';

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

export class HexTable extends HexTableMixin(ClientBase) {}
export class CircleTable extends CircleTableMixin(ClientBase) {}
export class GlassTable extends GlassTableMixin(ClientBase) {}
export class SquareTable extends SquareTableMixin(ClientBase) {}
export class CustomRectangleTable extends CustomRectangleTableMixin(ClientBase) {}
export class OctagonTable extends OctagonTableMixin(ClientBase) {}
export class CustomSquareTable extends CustomSquareTableMixin(ClientBase) {}
export class RectangleTable extends RectangleTableMixin(ClientBase) {}
export class PokerTable extends PokerTableMixin(ClientBase) {}
