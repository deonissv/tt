import type { Transformation } from '@shared/dto/simulation';

export const ACTOR_UPDATE = 'ACTOR_UPDATE';

export class ActorUpdate extends CustomEvent<{ actorGUID: string; transformation: Transformation }> {
  constructor(actorGUID: string, transformation: Transformation) {
    super(ACTOR_UPDATE, { detail: { actorGUID, transformation } });
  }
}
