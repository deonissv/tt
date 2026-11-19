import type { Tuple } from '@babylonjs/core';
import type { ClientActionMsg } from '@tt/actions';
import { ClientAction } from '@tt/actions';
import { Logger } from '@tt/logger';
import { Capability } from '@tt/rules';
import { can } from './actor-rules';
import type { Client } from '../rooms/client';
import type { ServerBase } from './actors';

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
        void this.handlePickItem(msg.payload);
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

  async handlePickItem(guid: string): Promise<void> {
    const actor = this.actors.find(actor => actor.guid === guid);
    if (!actor || !can(actor, Capability.Container, { code: this.client.code })) return;
    try {
      await actor.pickItem(this.client.code, this.client.pickHeight);
    } catch (error) {
      Logger.error(`Failed to draw from container ${guid}`, error);
    }
  }

  handlePickActor(guid: string) {
    const actor = this.actors.find(actor => actor.guid === guid);
    if (actor && can(actor, Capability.Pickable, { code: this.client.code }))
      actor.pick(this.client.code, this.client.pickHeight);
  }

  handleReleaseActor(guid: string) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor?.picked === this.client.code) actor.release();
  }

  releaseHeld(client: Client, actors: ServerBase[]): void {
    for (const actor of actors) {
      if (actor.picked === client.code) actor.release();
    }
  }

  handleMoveActor(guid: string, position: Tuple<number, 2>) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor?.picked === this.client.code) actor.move(...position);
  }
  handleRoll(guid: string) {
    const actor = this.actors.find(actor => actor.guid === guid);
    if (actor && can(actor, Capability.Rollable, { code: this.client.code })) actor.roll();
  }

  handleShuffle(guid: string) {
    const actor = this.actors.find(actor => actor.guid === guid);
    if (actor && can(actor, Capability.Shuffleable, { code: this.client.code })) actor.shuffle();
  }

  handleFlip(guid: string) {
    const actor = this.actors.find(actor => actor.guid === guid);
    if (actor && can(actor, Capability.Flippable, { code: this.client.code })) actor.flip();
  }

  handleRotateCW(guid: string) {
    const actor = this.actors.find(actor => actor.guid === guid);
    if (actor && can(actor, Capability.Rotatable, { code: this.client.code })) actor.rotateCW(this.client.rotationStep);
  }

  handleRotateCCW(guid: string) {
    const actor = this.actors.find(actor => actor.guid === guid);
    if (actor && can(actor, Capability.Rotatable, { code: this.client.code }))
      actor.rotateCCW(this.client.rotationStep);
  }

  handleSetPickHeight(height: number) {
    this.client.pickHeight = height;
  }

  handleSetRotationStep(step: number) {
    this.client.rotationStep = step;
  }
}
