import type { Tuple } from '@babylonjs/core';
import { ClientAction, ClientActionMsg } from '@tt/actions';
import { isContainable } from '@tt/actors';
import type { Client } from '../rooms/client';
import { Die10, Die12, Die20, Die4, Die6, Die6Round, Die8, type ServerBase } from './actors';

export class ActionHandler {
  actors: ServerBase[] = [];
  client: Client;

  handleActions(actions: ClientActionMsg[], actors: ServerBase[], client: Client): void {
    this.actors = actors;
    this.client = client;
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
        break;
      case ClientAction.FLIP:
        this.handleFlip(msg.payload);
        break;
      case ClientAction.CW:
        this.handleRotateCW(msg.payload);
        break;
      case ClientAction.CCW:
        this.handleRotateCCW(msg.payload);
        break;
      case ClientAction.SET_PICK_HEIGHT:
        this.handleSetPickHeight(msg.payload);
        break;
      case ClientAction.SET_ROTATION_STEP:
        this.handleSetRotationStep(msg.payload);
        break;
    }
  }

  handlePickItem(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && isContainable(actor)) {
      actor.pickItem(this.client.code, this.client.pickHeight);
    }
  }

  handlePickActor(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && typeof actor.pick == 'function') {
      actor.pick(this.client.code, this.client.pickHeight);
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
      typeof actor.roll === 'function'
    )
      actor.roll();
  }

  handleShuffle(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && isContainable(actor) && typeof actor.shuffle == 'function') {
      actor.shuffle();
    }
  }

  handleFlip(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && typeof actor.flip == 'function') {
      actor.flip();
    }
  }

  handleRotateCW(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && typeof actor.rotateCW == 'function') {
      actor.rotateCW(this.client.rotationStep);
    }
  }

  handleRotateCCW(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor && typeof actor.rotateCCW == 'function') {
      actor.rotateCCW(this.client.rotationStep);
    }
  }

  handleSetPickHeight(height: number) {
    this.client.pickHeight = height;
  }

  handleSetRotationStep(step: number) {
    this.client.rotationStep = step;
  }
}
