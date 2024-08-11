import { CircleTableMixin } from '@shared/playground/actors/tables/CircleTableMixin';
import { Actor } from './Actor';

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

export class HexTable extends HexTableMixin(Actor) {}
export class CircleTable extends CircleTableMixin(Actor) {}
export class GlassTable extends GlassTableMixin(Actor) {}
export class SquareTable extends SquareTableMixin(Actor) {}
export class CustomRectangleTable extends CustomRectangleTableMixin(Actor) {}
export class OctagonTable extends OctagonTableMixin(Actor) {}
export class CustomSquareTable extends CustomSquareTableMixin(Actor) {}
export class RectangleTable extends RectangleTableMixin(Actor) {}
export class PokerTable extends PokerTableMixin(Actor) {}
