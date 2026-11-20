import type { CursorsPld, MsgMap, RerenderBagPld, RerenderDeckPld, ServerActionMsg } from '@tt/actions';
import { ServerAction } from '@tt/actions';
import { DEFAULT_POSITION, DEFAULT_ROTATION, DEFAULT_SCALE } from '@tt/actors';
import {
  ActorType,
  type ActorBaseState,
  type CardState,
  type BagState,
  type DeckState,
  type SimulationStateSave,
  type TileStackState,
  type Transformation,
  type UnknownActorState,
} from '@tt/states';
import { vecFloatCompare } from '@tt/utils';
import { cardIsFaceDown } from './card-visibility';
import type { Simulation } from '../simulation/simulation';

export class ActionBuilder {
  prevCursors: string | null = null;
  prevSimState: SimulationStateSave | null = null;
  private prevObservedSimState: string | null = null;
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
    const observedState = JSON.stringify(simState);
    if (observedState === this.prevObservedSimState) return [];
    this.prevObservedSimState = observedState;

    if (!this.prevSimState) {
      this.prevSimState = structuredClone(simState);
      return [];
    }
    const actions = this._getSimActions(this.prevSimState, simState);
    if (actions.length > 0) {
      // prevSimState must stay the last state delivered to clients: sub-threshold
      // motion accumulates against it and is broadcast once it crosses the
      // protocol precision instead of being swallowed tick by tick.
      this.prevSimState = this.advanceDeliveredState(this.prevSimState, actions);
    }

    return actions;
  }

  private advanceDeliveredState(prevState: SimulationStateSave, actions: ServerActionMsg[]): SimulationStateSave {
    const next = structuredClone(prevState);
    next.actorStates ??= [];

    for (const action of actions) {
      switch (action.type) {
        case ServerAction.MOVE_ACTOR: {
          const actor = this.deliveredActor(next, action.payload.guid);
          actor.transformation = { ...actor.transformation, position: structuredClone(action.payload.position) };
          break;
        }
        case ServerAction.ROTATE_ACTOR: {
          const actor = this.deliveredActor(next, action.payload.guid);
          actor.transformation = { ...actor.transformation, rotation: structuredClone(action.payload.position) };
          break;
        }
        case ServerAction.SPAWN_ACTOR:
          next.actorStates.push(structuredClone(action.payload));
          break;
        case ServerAction.SPAWN_PICKED_ACTOR:
          next.actorStates.push(structuredClone(action.payload.state));
          break;
        case ServerAction.REMOVE_ACTOR:
          next.actorStates = next.actorStates.filter(actor => actor.guid !== action.payload);
          break;
        case ServerAction.RERENDER_DECK: {
          const deck = this.deliveredActor(next, action.payload.guid) as DeckState;
          deck.cards = structuredClone(action.payload.cards);
          break;
        }
        case ServerAction.RERENDER_TILE_STACK: {
          const stack = this.deliveredActor(next, action.payload.guid) as TileStackState;
          stack.size = action.payload.size;
          break;
        }
        case ServerAction.RERENDER_BAG: {
          const bag = this.deliveredActor(next, action.payload.guid) as BagState;
          bag.containedObjects = structuredClone(action.payload.containedObjects);
          break;
        }
      }
    }

    return next;
  }

  private deliveredActor(state: SimulationStateSave, guid: string): UnknownActorState {
    const actors = (state.actorStates ??= []);
    let actor = actors.find(actorState => actorState.guid === guid);
    if (!actor) {
      actor = { guid } as UnknownActorState;
      actors.push(actor);
    }
    return actor;
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
        actions.push({ type: ServerAction.REMOVE_ACTOR, payload: guid });
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

        const bagRerender = this.getBagRerender(prevActorState as BagState, actorState as BagState);
        if (bagRerender) {
          actions.push({
            type: ServerAction.RERENDER_BAG,
            payload: bagRerender,
          });
        }

        if (
          prevActorState.type === ActorType.TILE_STACK &&
          actorState.type === ActorType.TILE_STACK &&
          prevActorState.size !== actorState.size
        ) {
          actions.push({
            type: ServerAction.RERENDER_TILE_STACK,
            payload: { guid, size: actorState.size },
          });
        }

        const cardReveal = this.getCardReveal(prevActorState, actorState);
        if (cardReveal) actions.push(cardReveal);
      }
    });

    return actions;
  }

  /**
   * A card turning face-up reveals its face to every client, so clients that
   * received a redacted spawn need the real textures now.
   */
  private getCardReveal(
    prevState: ActorBaseState,
    currentState: ActorBaseState,
  ): MsgMap[ServerAction.RERENDER_CARD] | null {
    if (prevState.type !== ActorType.CARD || currentState.type !== ActorType.CARD) return null;
    if (!cardIsFaceDown(prevState) || cardIsFaceDown(currentState)) return null;

    const card = currentState as CardState;
    return {
      type: ServerAction.RERENDER_CARD,
      payload: {
        guid: card.guid,
        grid: {
          faceURL: card.faceURL,
          backURL: card.backURL,
          cols: card.cols,
          rows: card.rows,
          sequence: card.sequence,
        },
      },
    };
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
    if (JSON.stringify(prevState.cards) === JSON.stringify(currentState.cards)) return null;

    const rerenderPld = this.getRerenderDeckPld(currentState, prevState);
    // return SimulationRoom.patchStateURLs(rerenderPld as unknown as RecursiveObject) as unknown as RerenderDeckPld; @TODO
    return rerenderPld;
  }

  getBagRerender(prevState: BagState, currentState: BagState): RerenderBagPld | null {
    if (prevState.type != ActorType.BAG) return null;
    if (JSON.stringify(prevState.containedObjects) === JSON.stringify(currentState.containedObjects)) return null;

    // The delivered order rides along so client snapshots agree with the server.
    return { guid: currentState.guid, containedObjects: structuredClone(currentState.containedObjects) };
  }

  private getRerenderDeckPld(deckState: DeckState, previousState: DeckState): RerenderDeckPld {
    // A transition to zero cards still needs a rerender to hide the old mesh.
    // Retain its previous grid metadata when there are no current card faces.
    const faceCard = deckState.cards.at(-1) ?? previousState.cards.at(-1)!;
    const backCard = deckState.cards.at(0) ?? previousState.cards.at(0)!;

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
      // The full order rides along so client snapshots agree with the server.
      cards: structuredClone(deckState.cards),
    };
  }
}
