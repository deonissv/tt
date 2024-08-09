import type { TileState } from '@shared/dto/states';
import { TileMixin } from '@shared/playground/actors/TileMixin';
import type { Constructor } from '@shared/types';
import { ServerActor } from './serverActor';

export class Tile extends TileMixin<Constructor<ServerActor<TileState>>>(ServerActor) {}
