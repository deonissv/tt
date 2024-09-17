import type { Tuple } from '@babylonjs/core';
import { isContainable } from '@shared/playground/actions/Containable';
import { ClientAction } from '@shared/ws';
import type { ClientActionMsg } from '@shared/ws/ws';
import { Die10, Die12, Die20, Die4, Die6, Die6Round, Die8, type ServerBase } from './actors';

export class ActionHandler {
  actors: ServerBase[] = [];
  clientId: string;

  handleActions(actions: ClientActionMsg[], actors: ServerBase[], clientId: string): void {
    this.actors = actors;
    this.clientId = clientId;
    actions.map(msg => this.handleAction(msg));
  }

  handleAction(msg: ClientActionMsg): void {
    switch (msg.type) {
      case ClientAction.PICK_ACTOR:
        this.handlePickActor(msg.payload);
        break;
      case ClientAction.RELEASE_ACTOR:
        this.handleReleaseActor(msg.payload);
        break;
      case ClientAction.MOVE_ACTOR:
        this.handleMoveActor(msg.payload.guid, msg.payload.position);
        break;
      case ClientAction.PICK_ITEM:
        this.handlePickItem(msg.payload);
        break;
      case ClientAction.ROLL:
        this.handleRoll(msg.payload);
        break;
      case ClientAction.SHUFFLE:
        this.handleShuffle(msg.payload);
    }
  }

  handlePickItem(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && isContainable(actor)) {
      actor.pickItem(this.clientId);
    }
  }

  handlePickActor(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && typeof actor.pick == 'function') {
      actor.pick(this.clientId);
    }
  }

  handleReleaseActor(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && typeof actor.release == 'function') {
      actor.release();
    }
  }

  handleMoveActor(guid: string, position: Tuple<number, 2>) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && typeof actor.move == 'function') {
      actor.move(...position);
    }
  }
  handleRoll(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (
      (actor instanceof Die4 ||
        actor instanceof Die6 ||
        actor instanceof Die8 ||
        actor instanceof Die10 ||
        actor instanceof Die12 ||
        actor instanceof Die20 ||
        actor instanceof Die6Round) &&
      typeof actor.roll == 'function'
    )
      actor.roll();
  }

  handleShuffle(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && isContainable(actor) && typeof actor.shuffle == 'function') {
      actor.shuffle();
    }
  }
}
