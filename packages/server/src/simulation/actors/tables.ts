import { CircleTableMixin } from '@shared/playground/actors/tables/CircleTableMixin';
import { ServerActor } from './serverActor';

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

export class HexTable extends HexTableMixin(ServerActor) {}
export class CircleTable extends CircleTableMixin(ServerActor) {}
export class GlassTable extends GlassTableMixin(ServerActor) {}
export class SquareTable extends SquareTableMixin(ServerActor) {}
export class CustomRectangleTable extends CustomRectangleTableMixin(ServerActor) {}
export class OctagonTable extends OctagonTableMixin(ServerActor) {}
export class CustomSquareTable extends CustomSquareTableMixin(ServerActor) {}
export class RectangleTable extends RectangleTableMixin(ServerActor) {}
export class PokerTable extends PokerTableMixin(ServerActor) {}
