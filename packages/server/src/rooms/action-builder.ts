import { DEFAULT_POSITION, DEFAULT_ROTATION, DEFAULT_SCALE } from '@shared/defaults';
import { CursorsPld, MsgMap, RerenderDeckPld, ServerAction, ServerActionMsg } from '@tt/actions';
import {
  ActorType,
  type ActorBaseState,
  type DeckState,
  type SimulationStateSave,
  type Transformation,
} from '@tt/states';
import { vecFloatCompare } from '@tt/utils';
import type { Simulation } from '../simulation/simulation';

export class ActionBuilder {
  prevCursors: string | null = null;
  prevSimState: SimulationStateSave | null = null;
  sim: Simulation;

  getActions(cursors: CursorsPld, simState: SimulationStateSave): ServerActionMsg[] | null {
    const actions: ServerActionMsg[] = [];

    const cursorsAction = this.getCursorsAction(cursors);
    if (cursorsAction) actions.push(cursorsAction);

    const simActions = this.getSimActions(simState);
    if (simActions) actions.push(...simActions);

    if (actions.length === 0) return null;
    return actions;
  }

  getCursorsAction(cursors: CursorsPld): MsgMap[ServerAction.CURSORS] | null {
    if (Object.keys(cursors).length === 0) return null;

    const cursorsUpdate = JSON.stringify(cursors);
    if (cursorsUpdate === this.prevCursors) return null;

    this.prevCursors = cursorsUpdate;
    return {
      type: ServerAction.CURSORS,
      payload: cursors,
    };
  }

  getSimActions(simState: SimulationStateSave): ServerActionMsg[] {
    if (JSON.stringify(simState) === JSON.stringify(this.prevSimState)) return [];

    if (!this.prevSimState) {
      this.prevSimState = simState;
      return [];
    }
    const actions = this._getSimActions(this.prevSimState, simState);
    this.prevSimState = structuredClone(simState);

    return actions;
  }

  _getSimActions(prevState: SimulationStateSave, state: SimulationStateSave): ServerActionMsg[] {
    const actions: ServerActionMsg[] = [];

    const prevActorStates = prevState.actorStates ?? [];
    const actorStates = state.actorStates ?? [];

    const actors = this.sim.actors;

    const guids = new Set([
      ...prevActorStates.map(actorState => actorState.guid),
      ...actorStates.map(actorState => actorState.guid),
    ]);

    guids.forEach(guid => {
      const actorState = state.actorStates?.find(actorState => actorState.guid === guid);
      const prevActorState = prevState.actorStates?.find(actorState => actorState.guid === guid);
      if (!actorState && !prevActorState) return;

      if (!actorState && prevActorState) {
        // handle remove actor
        return;
      }
      if (!prevActorState && actorState) {
        const clientId = actors.find(a => a.guid === guid)!.picked;
        if (clientId) {
          actions.push({
            type: ServerAction.SPAWN_PICKED_ACTOR,
            payload: {
              clientId: clientId,
              state: actorState,
              // state: SimulationRoom.patchStateURLs( @TODO
              //   actorState as unknown as RecursiveObject,
              // ) as unknown as UnknownActorState,
            },
          });
        } else {
          actions.push({
            type: ServerAction.SPAWN_ACTOR,
            payload: actorState,
            // state: SimulationRoom.patchStateURLs( @TODO
            //   actorState as unknown as RecursiveObject,
            // ) as unknown as UnknownActorState,
          });
        }

        return;
      }

      if (prevActorState && actorState) {
        const positionUpdate = this.getActorPositionUpdate(prevActorState, actorState);
        if (positionUpdate) {
          actions.push({
            type: ServerAction.MOVE_ACTOR,
            payload: { guid: guid, position: positionUpdate },
          });
        }

        const rotationUpdate = this.getActorRotationUpdate(prevActorState, actorState);
        if (rotationUpdate) {
          actions.push({
            type: ServerAction.ROTATE_ACTOR,
            payload: { guid: guid, position: rotationUpdate },
          });
        }

        const deckRerender = this.getDeckRerender(prevActorState as DeckState, actorState as DeckState);
        if (deckRerender) {
          actions.push({
            type: ServerAction.RERENDER_DECK,
            payload: deckRerender,
          });
        }
      }
    });

    return actions;
  }

  getActorPositionUpdate(prevState: ActorBaseState, currentState: ActorBaseState): Transformation['position'] | null {
    const updatePosition = vecFloatCompare<3>(
      prevState.transformation?.position ?? DEFAULT_POSITION,
      currentState.transformation?.position ?? DEFAULT_POSITION,
    );
    if (!updatePosition) return null;
    return currentState.transformation?.position;
  }

  getActorRotationUpdate(prevState: ActorBaseState, currentState: ActorBaseState): Transformation['rotation'] | null {
    const updateRotation = vecFloatCompare<3>(
      prevState.transformation?.rotation ?? DEFAULT_ROTATION,
      currentState.transformation?.rotation ?? DEFAULT_ROTATION,
    );
    if (!updateRotation) return null;
    return currentState.transformation?.rotation;
  }

  getActorScaleUpdate(prevState: ActorBaseState, currentState: ActorBaseState): Transformation['scale'] | null {
    const updateScale = vecFloatCompare<3>(
      prevState.transformation?.scale ?? DEFAULT_SCALE,
      currentState.transformation?.scale ?? DEFAULT_SCALE,
    );
    if (!updateScale) return null;
    return currentState.transformation?.scale;
  }

  getDeckRerender(prevState: DeckState, currentState: DeckState): RerenderDeckPld | null {
    if (prevState.type != ActorType.DECK) return null;
    if (
      JSON.stringify(prevState.cards.at(-1)) === JSON.stringify(currentState.cards.at(-1)) &&
      JSON.stringify(prevState.cards.at(0)) === JSON.stringify(currentState.cards.at(0))
    )
      return null;

    const rerenderPld = this.getRerenderDeckPld(currentState);
    // return SimulationRoom.patchStateURLs(rerenderPld as unknown as RecursiveObject) as unknown as RerenderDeckPld; @TODO
    return rerenderPld;
  }

  private getRerenderDeckPld(deckState: DeckState): RerenderDeckPld {
    const faceCard = deckState.cards.at(-1)!;
    const backCard = deckState.cards.at(0)!;

    return {
      guid: deckState.guid,
      grid: {
        faceURL: faceCard.faceURL,
        backURL: backCard.backURL,
        cols: faceCard.cols,
        rows: faceCard.rows,
        sequence: faceCard.sequence,
      },
      size: deckState.cards.length,
    };
  }
}
