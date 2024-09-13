/* eslint-disable @typescript-eslint/unbound-method */
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';

import { SimulationScene } from './SimulationScene';

import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';

import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Viewport } from '@babylonjs/core/Maths/math.viewport';
import type { Tuple } from '@babylonjs/core/types';
import { FLIP_BIND_KEYS } from '@shared/constants';
import type { CardGrid } from '@shared/dto/states';
import { ActorType, type SimulationStateSave } from '@shared/dto/states';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import { EngineFactory, Logger, SimulationBase } from '@shared/playground';
import type { SimulationSceneBase } from '@shared/playground/Simulation/SimulationSceneBase';
import { ClientBase, Deck } from './actors';
import { ClientActorBuilder } from './ClientActorBuilder';

export interface SimulationCallbacks {
  onPickItem: (deck: Deck) => void;
  onMoveActor: (actor: ClientBase, position: Tuple<number, 2>) => void;
  onPickActor: (actor: ClientBase) => void;
  onReleaseActor: (actor: ClientBase) => void;
  onRoll: (actor: ClientBase) => void;
  onShuffle: (actor: ClientBase) => void;
}

export class Simulation extends SimulationBase {
  static actorBuilder = ClientActorBuilder;

  private _hll: HighlightLayer;
  private _hoveredActor: ClientBase | null = null;
  private _pickedActor: ClientBase | null = null;
  private _cursorPos: [number, number] = [0, 0];
  cbs: SimulationCallbacks;

  constructor(scene: SimulationSceneBase, cbs: SimulationCallbacks) {
    super();
    this.scene = scene;
    this.engine = scene.getEngine();
    this._hll = new HighlightLayer('hll', this.scene, {
      isStroke: true,
      blurVerticalSize: 0.15,
      blurHorizontalSize: 0.15,
    });
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
      if (
        actor.__state.type === ActorType.BAG ||
        actor.__state.type === ActorType.DECK ||
        actor.__state.type === ActorType.TILE_STACK
      )
        cbs.onPickItem?.(actor as unknown as Deck);
    });
    sim._bindAction(['KeyR'], actor => {
      cbs.onRoll(actor);
    });
    sim._bindAction(['KeyH'], actor => {
      if (
        actor.__state.type === ActorType.BAG ||
        actor.__state.type === ActorType.DECK ||
        actor.__state.type === ActorType.TILE_STACK
      ) {
        cbs.onShuffle(actor);
      }
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

  get viewport(): Viewport {
    const engine = this.scene.getEngine();
    return this._camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
  }

  get rawCursor(): Tuple<number, 2> {
    return [this.scene.pointerX, this.scene.pointerY];
  }

  getCursor(): Tuple<number, 2> {
    const camera = this._camera;
    const ray = this.scene.createPickingRay(this.scene.pointerX, this.scene.pointerY, Matrix.Identity(), camera);
    const t = -ray.origin.y / ray.direction.y;
    const groundPoint = ray.origin.add(ray.direction.scale(t));

    return [groundPoint.x, groundPoint.z];
  }

  getScreenCursor(cursor: Tuple<number, 2>): Tuple<number, 2> {
    const viewport = this.viewport;
    const groundPoint = new Vector3(cursor[0], 0, cursor[1]);

    const viewMatrix = this._camera.getViewMatrix();
    const projectionMatrix = this._camera.getProjectionMatrix();

    const screenVector = Vector3.Project(
      groundPoint,
      Matrix.IdentityReadOnly,
      viewMatrix.multiply(projectionMatrix),
      viewport,
    );

    return [screenVector.x, screenVector.y];
  }

  private _handleHoverHighlight() {
    this.scene.onPointerObservable.add(evt => {
      if (evt.type !== PointerEventTypes.POINTERMOVE) return;

      const hoveredActor = this._pickActor();

      if (this._hoveredActor && !hoveredActor) {
        this.unhighlightActor(this._hoveredActor);
        this._hoveredActor = null;
        return;
      }

      if (hoveredActor) {
        if (this._hoveredActor) {
          if (this._hoveredActor.guid == hoveredActor.guid) return;
          this.unhighlightActor(this._hoveredActor);
        }
        this.highlightActor(hoveredActor);
        this._hoveredActor = hoveredActor;
      }
    });
  }

  private highlightActor(actor: ClientBase) {
    this._hll.addMesh(actor.__model, Color3.White(), false);
  }

  private unhighlightActor(actor: ClientBase) {
    this._hll.removeMesh(actor.__model);
  }

  private _handlePick() {
    this.scene.onPointerObservable.add(evt => {
      switch (evt.type) {
        case PointerEventTypes.POINTERDOWN: {
          if (evt.event.button !== 0) return;
          if (this._pickedActor) return;

          this._cursorPos = this.getCursor();
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
          this._cursorPos = this.getCursor();

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
      this._cursorPos = this.getCursor();
      this._pickedActor = actor;
    }
  }

  handleRotateActor(guid: string, position: Tuple<number, 3>) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor) {
      actor.rotation = Vector3.FromArray(position);
    }
  }

  handleDeckRerender(guid: string, grid: CardGrid, size: number) {
    const actor = this.actors.find(a => a.guid === guid);
    if (actor instanceof Deck) void actor.rerenderDeck(grid, size);
  }
}
