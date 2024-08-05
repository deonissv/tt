import type { ActorState } from '@shared/dto/states';
import { Logger, SharedBase } from '@shared/playground';
import { ActorMixin } from '@shared/playground/actors/ActorMixin';
import { ServerActor } from './serverActor';

export class Actor extends ActorMixin(ServerActor<ActorState>) {
  static async fromState(actorState: ActorState): Promise<Actor | null> {
    const modelMesh = await SharedBase.modelFromState(actorState);
    if (!modelMesh) {
      Logger.log('Failed to load model mesh');
      return null;
    }
    const colliderMesh = (await SharedBase.colliderFromState(actorState)) ?? undefined;
    return new Actor(actorState, modelMesh, colliderMesh);
  }
}
