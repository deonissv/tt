/* eslint-disable @typescript-eslint/unbound-method */
import { Engine } from '@babylonjs/core/Engines/engine';
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine';
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Scene } from '@babylonjs/core/scene';

import { Inspector } from '@babylonjs/inspector';

import { SimulationScene } from './SimulationScene';

import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents';

import type { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine';

import { FLIP_BIND_KEYS } from '@shared/constants';
import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/states';
import type { Actor } from '@shared/playground';
import { ActorBase, SimulationBase } from '@shared/playground';
import { isContainable } from '@shared/playground/actions/Containable';

export interface SimulationCallbacks {
  onPickItem: (deck: ActorBase) => void;
}

export class Simulation extends SimulationBase {
  private _hll: HighlightLayer;
  private _hoveredMesh: Mesh | null = null;
  private _pickedActor: Actor | null = null;
  // private _cursorPos: [number, number] = [0, 0];
  cbs: SimulationCallbacks;

  private constructor(scene: Scene, cbs: SimulationCallbacks) {
    super();
    this.scene = scene;
    this._hll = new HighlightLayer('hll', this.scene); // @TODO change glow to thin solid line
    this.cbs = cbs;

    Inspector.Show(this.scene, {});
  }

  static async init(
    canvas: HTMLCanvasElement | null,
    stateSave: SimulationStateSave,
    cbs: SimulationCallbacks,
  ): Promise<Simulation> {
    const engine = await this.initEngine(canvas);
    const scene = canvas
      ? await SimulationScene.init(engine, stateSave?.gravity, stateSave?.leftHandedSystem)
      : new Scene(engine);

    canvas &&
      window.addEventListener('resize', () => {
        engine.resize();
      });

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
            // eslint-disable-next-line no-console
            console.error(`Null actor ${actorState.guid}`);
            return null;
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(`Failed to load actor ${actorState.guid}: ${(e as Error).toString()}`);
          return null;
        }
      }),
    );
    engine.runRenderLoop(() => {
      scene.render();
    });

    // pg._handlePick();

    sim._handleHoverHighlight();
    sim._bindAction(FLIP_BIND_KEYS, actor => {
      isContainable(actor) && cbs.onPickItem?.(actor);
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

  private static async initEngine(canvas: HTMLCanvasElement | null): Promise<AbstractEngine> {
    let engine: AbstractEngine;
    const engineOptions = {
      stencil: true,
    };
    if (!canvas) {
      return new NullEngine();
    }

    const webgpuSupported = await WebGPUEngine.IsSupportedAsync;
    if (webgpuSupported) {
      engine = new WebGPUEngine(canvas, engineOptions);
      await (engine as WebGPUEngine).initAsync();
    } else {
      engine = new Engine(canvas, true, engineOptions, true);
    }
    return engine;
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

  // private _handlePick() {
  //   this._scene.onPointerObservable.add(async evt => {
  //     switch (evt.type) {
  //       case PointerEventTypes.POINTERDOWN: {
  //         this._cursorPos = [this._scene.pointerX, this._scene.pointerY];
  //         this._pickedActor = this._pickActor();
  //         if (!this._pickedActor) return;
  //         this._pickedActor.pick();
  //         break;
  //       }
  //       case PointerEventTypes.POINTERUP: {
  //         if (!this._pickedActor) return;
  //         this._pickedActor.release();
  //         this._pickedActor = null;
  //         break;
  //       }
  //       case PointerEventTypes.POINTERMOVE: {
  //         if (!this._pickedActor) return;
  //         const prevCursorPos = this._cursorPos;
  //         this._cursorPos = [this._scene.pointerX, this._scene.pointerY];

  //         const cursorDX = this._cursorPos[0] - prevCursorPos[0];
  //         const cursorDY = this._cursorPos[1] - prevCursorPos[1];
  //         const dx = Math.cos(this._camera.alpha) * cursorDY + Math.sin(this._camera.alpha) * cursorDX;
  //         const dy = -Math.cos(this._camera.alpha) * cursorDX + Math.sin(this._camera.alpha) * cursorDY;
  //         this._pickedActor.__move(dx * 0.02, 0, dy * 0.02);
  //       }
  //     }
  //   });
  // }

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

    simUpdate?.actions?.forEach(action => this.processAction(action));
  }
}
