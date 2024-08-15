/* eslint-disable @typescript-eslint/unbound-method */
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';

import { SimulationScene } from './SimulationScene';

import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';

import { Matrix, Vector3 } from '@babylonjs/core';
import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import type { Tuple } from '@babylonjs/core/types';
import { FLIP_BIND_KEYS } from '@shared/constants';
import { type SimulationStateSave } from '@shared/dto/states';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import { EngineFactory, Logger, SimulationBase } from '@shared/playground';
import { isContainable } from '@shared/playground/actions/Containable';
import type { SimulationSceneBase } from '@shared/playground/Simulation/SimulationSceneBase';
import type { Deck } from './actors';
import { ClientBase } from './actors';
import { ClientActorBuilder } from './ClientActorBuilder';

export interface SimulationCallbacks {
  onPickItem: (deck: Deck) => void;
  onMoveActor: (actor: ClientBase, position: Tuple<number, 2>) => void;
  onPickActor: (actor: ClientBase) => void;
  onReleaseActor: (actor: ClientBase) => void;
}

export class Simulation extends SimulationBase {
  static actorBuilder = ClientActorBuilder;

  private _hll: HighlightLayer;
  private _hoveredMesh: Mesh | null = null;
  private _pickedActor: ClientBase | null = null;
  private _cursorPos: [number, number] = [0, 0];
  cbs: SimulationCallbacks;

  constructor(scene: SimulationSceneBase, cbs: SimulationCallbacks) {
    super();
    this.scene = scene;
    this.engine = scene.getEngine();
    this._hll = new HighlightLayer('hll', this.scene); // @TODO change glow to thin solid line
    this.cbs = cbs;
  }

  static async init(
    canvas: HTMLCanvasElement | undefined,
    stateSave: SimulationStateSave,
    cbs: SimulationCallbacks,
  ): Promise<Simulation> {
    const engine = await EngineFactory(canvas);
    const scene = new SimulationScene(engine, stateSave?.leftHandedSystem);
    const sim = new Simulation(scene, cbs);

    if (stateSave.table) {
      await this.tableFromState(stateSave.table);
    }

    await Promise.all(
      (stateSave?.actorStates ?? []).map(async actorState => {
        try {
          const actor = await this.actorFromState(actorState);
          if (actor) {
            return actor;
          } else {
            Logger.error(`Null actor ${actorState.guid}`);
            return null;
          }
        } catch (e) {
          Logger.error(`Failed to load actor ${actorState.guid}: ${(e as Error).toString()}`);
          return null;
        }
      }),
    );

    sim.start();

    sim._handlePick();
    sim._handleHoverHighlight();
    sim._bindAction(FLIP_BIND_KEYS, actor => {
      if (isContainable(actor)) cbs.onPickItem?.(actor as unknown as Deck);
    });
    // pg._bindAction(FLIP_BIND_KEYS, Actor.prototype.flip);
    // pg._bindAction(ROTATE_CW_KEYS, Actor.prototype.rotateCW);
    // pg._bindAction(ROTATE_CCW_KEYS, Actor.prototype.rotateCCW);
    // pg._bindAction(SCALE_UP_KEYS, Actor.prototype.scaleUp);
    // pg._bindAction(SCALE_DOWN_KEYS, Actor.prototype.scaleDown);
    return sim;
  }

  private _pickMesh(): Mesh | null {
    return this.scene.pick(this.scene.pointerX, this.scene.pointerY).pickedMesh as Mesh | null;
  }

  private _pickActor(): ClientBase | null {
    const pickedMesh = this._pickMesh();
    const actorCandidate = pickedMesh?.parent;
    if (!(actorCandidate instanceof ClientBase)) return null;

    return actorCandidate.pickable ? actorCandidate : null;
  }

  private get _camera(): ArcRotateCamera {
    return this.scene.activeCamera as ArcRotateCamera;
  }

  get gCursor(): [number, number] {
    const engine = this.scene.getEngine();
    const viewport = this._camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
    const screenVector = new Vector3(this.scene.pointerX, this.scene.pointerY, 0);

    const viewMatrix = this._camera.getViewMatrix();
    const projectionMatrix = this._camera.getProjectionMatrix();

    const nearWorld = Vector3.Unproject(
      screenVector,
      viewport.width,
      viewport.height,
      Matrix.IdentityReadOnly,
      viewMatrix,
      projectionMatrix,
    );

    screenVector.z = 1;
    const farWorld = Vector3.Unproject(
      screenVector,
      viewport.width,
      viewport.height,
      Matrix.IdentityReadOnly,
      viewMatrix,
      projectionMatrix,
    );

    const direction = farWorld.subtract(nearWorld).normalize();
    const t = (-1 * nearWorld.y) / direction.y;
    const groundPoint = nearWorld.add(direction.scale(t));
    return [groundPoint._x, groundPoint._z];
  }

  private _handleHoverHighlight() {
    this.scene.onPointerObservable.add(evt => {
      if (evt.type !== PointerEventTypes.POINTERMOVE) return;
      const pickedMesh = this._pickMesh();
      if (!pickedMesh) {
        if (this._hoveredMesh) {
          this._hll.removeMesh(this._hoveredMesh);
          this._hoveredMesh = null;
        }
        return;
      }

      if (pickedMesh == this._hoveredMesh) return;
      if (this._hoveredMesh) this._hll.removeMesh(this._hoveredMesh);
      if (pickedMesh) this._hll.addMesh(pickedMesh, Color3.White());
      this._hoveredMesh = pickedMesh;
    });
  }

  private _handlePick() {
    this.scene.onPointerObservable.add(evt => {
      switch (evt.type) {
        case PointerEventTypes.POINTERDOWN: {
          if (evt.event.button !== 0) return;
          if (this._pickedActor) return;

          this._cursorPos = this.gCursor;
          this._pickedActor = this._pickActor();
          if (!this._pickedActor) return;
          this.cbs.onPickActor(this._pickedActor);
          break;
        }
        case PointerEventTypes.POINTERUP: {
          if (!this._pickedActor) return;
          this.cbs.onReleaseActor(this._pickedActor);
          this._pickedActor = null;
          break;
        }
        case PointerEventTypes.POINTERMOVE: {
          if (!this._pickedActor) return;
          const prevCursorPos = this._cursorPos;
          this._cursorPos = this.gCursor;

          const cursorDX = this._cursorPos[0] - prevCursorPos[0];
          const cursorDY = this._cursorPos[1] - prevCursorPos[1];
          this.cbs.onMoveActor(this._pickedActor, [cursorDX, cursorDY]);
        }
      }
    });
  }

  private _bindAction(key: string[], action: (actor: ClientBase) => void) {
    this.scene.onKeyboardObservable.add(kbInfo => {
      const evt = kbInfo.event;
      if (key.includes(evt.code) && kbInfo.type === 1) {
        const target = this._pickedActor ?? this._pickActor();
        if (!target) return;
        action.call(target, target);
      }
    });
  }

  handleMoveActor(guid: string, position: Tuple<number, 3>) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor) {
      (actor as ClientBase).move(...position);
    }
  }

  async handleSpawnActor(state: UnknownActorState) {
    await ClientActorBuilder.build(state);
  }

  async handleSpawnPickedActor(state: UnknownActorState) {
    const actor = await ClientActorBuilder.build(state);
    if (actor) {
      this._cursorPos = this.gCursor;
      this._pickedActor = actor;
    }
  }
}
