/* eslint-disable @typescript-eslint/unbound-method */
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { Scene } from '@babylonjs/core/scene';

import { Inspector } from '@babylonjs/inspector';

import { SimulationScene } from './SimulationScene';

import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';

import type { ArcRotateCamera } from '@babylonjs/core';
import { FLIP_BIND_KEYS } from '@shared/constants';
import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/states';
import type { Actor } from '@shared/playground';
import { ActorBase, EngineFactory, Logger, SimulationBase } from '@shared/playground';
import { isContainable } from '@shared/playground/actions/Containable';

export interface SimulationCallbacks {
  onPickItem: (deck: ActorBase) => void;
}

export class Simulation extends SimulationBase {
  private _hll: HighlightLayer;
  private _hoveredMesh: Mesh | null = null;
  private _pickedActor: ActorBase | null = null;
  private _cursorPos: [number, number] = [0, 0];
  cbs: SimulationCallbacks;

  private constructor(scene: Scene, cbs: SimulationCallbacks) {
    super();
    this.scene = scene;
    this._hll = new HighlightLayer('hll', this.scene); // @TODO change glow to thin solid line
    this.cbs = cbs;

    Inspector.Show(this.scene, {});
  }

  static async init(
    canvas: HTMLCanvasElement | undefined,
    stateSave: SimulationStateSave,
    cbs: SimulationCallbacks,
  ): Promise<Simulation> {
    const engine = await EngineFactory(canvas);
    const scene = await SimulationScene.init(engine, stateSave?.gravity, stateSave?.leftHandedSystem);
    const sim = new Simulation(scene, cbs);

    if (stateSave.table) {
      await SimulationBase.tableFromState(stateSave.table);
    }

    await Promise.all(
      (stateSave?.actorStates ?? []).map(async actorState => {
        try {
          const actor = await SimulationBase.actorFromState(actorState);
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
    engine.runRenderLoop(() => {
      scene.render();
    });

    sim._handlePick();
    sim._handleHoverHighlight();
    sim._bindAction(FLIP_BIND_KEYS, actor => {
      if (isContainable(actor)) cbs.onPickItem?.(actor);
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

  private _pickActor(): ActorBase | null {
    const pickedMesh = this._pickMesh();
    return pickedMesh?.parent instanceof ActorBase ? pickedMesh.parent : null;
  }

  private get _camera(): ArcRotateCamera {
    return this.scene.activeCamera as ArcRotateCamera;
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
          this._cursorPos = [this.scene.pointerX, this.scene.pointerY];
          this._pickedActor = this._pickActor();
          if (!this._pickedActor) return;
          this._pickedActor.pick();
          break;
        }
        case PointerEventTypes.POINTERUP: {
          if (!this._pickedActor) return;
          this._pickedActor.release();
          this._pickedActor = null;
          break;
        }
        case PointerEventTypes.POINTERMOVE: {
          if (!this._pickedActor) return;
          const prevCursorPos = this._cursorPos;
          this._cursorPos = [this.scene.pointerX, this.scene.pointerY];

          const cursorDX = this.scene.useRightHandedSystem ? 1 : -1 * (this._cursorPos[0] - prevCursorPos[0]);
          const cursorDY = this._cursorPos[1] - prevCursorPos[1];

          const dx = Math.cos(this._camera.alpha) * cursorDY + Math.sin(this._camera.alpha) * cursorDX;
          const dy = -Math.cos(this._camera.alpha) * cursorDX + Math.sin(this._camera.alpha) * cursorDY;
          this._pickedActor.move(dx * 0.02, 0, dy * 0.02);
        }
      }
    });
  }

  private _bindAction(key: string[], action: (actor: ActorBase) => void) {
    this.scene.onKeyboardObservable.add(kbInfo => {
      const evt = kbInfo.event;
      if (key.includes(evt.code) && kbInfo.type === 1) {
        const target = this._pickedActor ?? this._pickActor();
        if (!target) return;
        action.call(target, target);
      }
    });
  }

  update(simUpdate: SimulationStateUpdate) {
    simUpdate?.actorStates?.forEach(actorState => {
      const actor = this.scene.getNodes().find(node => (node as Actor)?.guid === actorState.guid) as Actor;
      if (actor && this._pickedActor?.guid !== actor.guid) {
        actor.update(actorState);
      }
    });

    simUpdate?.actions?.forEach(action => this.handleAction(action));
  }
}
