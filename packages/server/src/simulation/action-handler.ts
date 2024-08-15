import type { Tuple } from '@babylonjs/core';
import { isContainable } from '@shared/playground/actions/Containable';
import { ClientAction } from '@shared/ws';
import type { ClientActionMsg } from '@shared/ws/ws';
import type { ServerBase } from './actors';

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
      case ClientAction.PICK_START:
        this.handlePickStart(msg.payload);
        break;
    }
  }

  handlePickStart(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && isContainable(actor)) {
      actor.pickItem(this.clientId);
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
    if (actor) {
      actor.pick(this.clientId);
    }
  }

  handleReleaseActor(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor) {
      actor.release();
    }
  }

  handleMoveActor(guid: string, position: Tuple<number, 2>) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor) {
      actor.move(...position);
    }
  }
}
