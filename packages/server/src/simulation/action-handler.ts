import type { Tuple } from '@babylonjs/core';
import type { ClientActionMsg } from '@tt/actions';
import { ClientAction } from '@tt/actions';
import { can, Capability } from '@tt/rules';
import type { UnknownActorState } from '@tt/states';
import type { Client } from '../rooms/client';
import type { ServerBase } from './actors';
import { flip, move, pick, pickItem, release, roll, rotate, shuffle } from './behaviors';

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

  private findCapableActor(guid: string, capability: Capability): ServerBase | undefined {
    const actor = this.actors.find(actor => actor.guid === guid);
    if (!actor) return undefined;

    const state = actor.toState() as UnknownActorState;
    return can(state, capability, { code: this.client.code }) ? actor : undefined;
  }

  handlePickItem(guid: string) {
    const actor = this.findCapableActor(guid, Capability.Container);
    if (actor) void pickItem(actor, this.client.code, this.client.pickHeight);
  }

  handlePickActor(guid: string) {
    const actor = this.findCapableActor(guid, Capability.Pickable);
    if (actor) pick(actor, this.client.code, this.client.pickHeight);
  }

  handleReleaseActor(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor) release(actor);
  }

  handleMoveActor(guid: string, position: Tuple<number, 2>) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor) move(actor, ...position);
  }
  handleRoll(guid: string) {
    const actor = this.findCapableActor(guid, Capability.Rollable);
    if (actor) roll(actor);
  }

  handleShuffle(guid: string) {
    const actor = this.findCapableActor(guid, Capability.Shuffleable);
    if (actor) shuffle(actor);
  }

  handleFlip(guid: string) {
    const actor = this.findCapableActor(guid, Capability.Flippable);
    if (actor) flip(actor);
  }

  handleRotateCW(guid: string) {
    const actor = this.findCapableActor(guid, Capability.Rotatable);
    if (actor) rotate(actor, this.client.rotationStep);
  }

  handleRotateCCW(guid: string) {
    const actor = this.findCapableActor(guid, Capability.Rotatable);
    if (actor) rotate(actor, -this.client.rotationStep);
  }

  handleSetPickHeight(height: number) {
    this.client.pickHeight = height;
  }

  handleSetRotationStep(step: number) {
    this.client.rotationStep = step;
  }
}
