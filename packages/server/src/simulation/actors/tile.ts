import { TileMixin } from '@shared/playground/actors/TileMixin';
import { ServerActor } from './serverActor';

export class Tile extends TileMixin(ServerActor) {}
