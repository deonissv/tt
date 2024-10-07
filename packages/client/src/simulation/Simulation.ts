/* eslint-disable @typescript-eslint/unbound-method */
import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { Viewport } from '@babylonjs/core/Maths/math.viewport';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';

import { Logger } from '@tt/logger';
import { EngineFactory, SimulationBase, SimulationSceneBase } from '@tt/simulation';
import type { CardGrid, UnknownActorState } from '@tt/states';
import { ActorType, type SimulationStateSave } from '@tt/states';

import { Tuple } from '@tt/utils';
import { FLIP_KEYS, PICK_ITEM_KEYS, ROLL_KEYS, ROTATE_CCW_KEYS, ROTATE_CW_KEYS, SHUFFLE_KEYS } from '../config';
import { ClientBase, Deck } from './actors';
import { ClientActorBuilder } from './ClientActorBuilder';
import { SimulationScene } from './SimulationScene';

export interface SimulationCallbacks {
  onPickItem: (deck: Deck) => void;
  onMoveActor: (actor: ClientBase, position: Tuple<number, 2>) => void;
  onPickActor: (actor: ClientBase) => void;
  onReleaseActor: (actor: ClientBase) => void;
  onRoll: (actor: ClientBase) => void;
  onShuffle: (actor: ClientBase) => void;
  onFlip: (actor: ClientBase) => void;
  onCW: (actor: ClientBase) => void;
  onCCW: (actor: ClientBase) => void;
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
      blurVerticalSize: 0.1,
      blurHorizontalSize: 0.1,
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

    sim._handlePick();
    sim._handleHoverHighlight();

    sim._bindAction(PICK_ITEM_KEYS, actor => {
      if (
        actor.__state.type === ActorType.BAG ||
        actor.__state.type === ActorType.DECK ||
        actor.__state.type === ActorType.TILE_STACK
      )
        cbs.onPickItem?.(actor as unknown as Deck);
    });
    sim._bindAction(ROLL_KEYS, actor => {
      if (
        actor.__state.type === ActorType.DIE4 ||
        actor.__state.type === ActorType.DIE6 ||
        actor.__state.type === ActorType.DIE8 ||
        actor.__state.type === ActorType.DIE10 ||
        actor.__state.type === ActorType.DIE12 ||
        actor.__state.type === ActorType.DIE20 ||
        actor.__state.type === ActorType.DIE6ROUND
      )
        cbs.onRoll(actor);
    });
    sim._bindAction(SHUFFLE_KEYS, actor => {
      if (
        actor.__state.type === ActorType.BAG ||
        actor.__state.type === ActorType.DECK ||
        actor.__state.type === ActorType.TILE_STACK
      ) {
        cbs.onShuffle(actor);
      }
    });
    sim._bindAction(FLIP_KEYS, actor => {
      cbs.onFlip(actor);
    });
    sim._bindAction(ROTATE_CW_KEYS, actor => {
      cbs.onCW(actor);
    });
    sim._bindAction(ROTATE_CCW_KEYS, actor => {
      cbs.onCCW(actor);
    });

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
      (actor as unknown as ClientBase).move(...position);
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
