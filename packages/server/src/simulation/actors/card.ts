import type { CardState } from '@shared/dto/states';
import { CardMixin } from '@shared/playground/actors/CardMixin';
import { ServerActor } from './serverActor';

export class Card extends CardMixin(ServerActor<CardState>) {}
