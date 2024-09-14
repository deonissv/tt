import { PAWN_TOKEN_MODEL } from '@shared/assets';
import type { ActorBaseState, PawnTokenState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { ClientBase } from './ClientBase';

export class PawnToken extends ClientBase<ActorBaseState> {
  static async fromState(state: PawnTokenState): Promise<PawnToken | null> {
    const model = await Loader.loadMesh(PAWN_TOKEN_MODEL.meshURL);

    if (!model) {
      return null;
    }

    return new this(state, model);
  }
}
