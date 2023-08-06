import "@babylonjs/loaders/OBJ/objFileLoader";
// import HavokPhysics from "@babylonjs/havok";


import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import "@babylonjs/core/Meshes/meshBuilder"
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from "@babylonjs/core/scene";


import { modelLoaderService } from './services';
import { Model } from './models/SandBox';
import { fileToUrl } from './utils';

import { PhysicsAggregate } from '@babylonjs/core/Physics/v2/physicsAggregate';
import { PhysicsShapeType } from '@babylonjs/core/Physics/v2/IPhysicsEnginePlugin';
import { WebGPUEngine } from '@babylonjs/core/Engines/webgpuEngine';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { PhysicsShapeMesh } from '@babylonjs/core/Physics/v2/physicsShape';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';

// Side efects
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Physics/physicsEngineComponent";

import HavokPlugin from "@babylonjs/havok";
import { HavokPlugin as HP } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";

import { Inspector } from '@babylonjs/inspector';

const CAMERA_DEFAULT_POSITION = new Vector3(2, 2, 2);


export default class Playground {
    private _scene: Scene;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    static async init(canvas: HTMLCanvasElement): Promise<Playground> {
        const engine = await this.initEngine(canvas);
        const scene = await this.initScene(canvas, engine);

        engine.runRenderLoop(() => { scene!.render() });
        window.addEventListener("resize", () => { engine!.resize() });
        return new Playground(scene);
    }

    private static async initEngine(canvas: HTMLCanvasElement): Promise<Engine> {
        let engine: Engine;
        const webgpuSupported = await WebGPUEngine.IsSupportedAsync;
        if (webgpuSupported) {
            engine = new WebGPUEngine(canvas);
            await (engine as WebGPUEngine).initAsync();
        } else {
            engine = new Engine(canvas, true, {}, true);
        }
        return engine;
    }

    private static async initScene(canvas: HTMLCanvasElement, engine: Engine): Promise<Scene> {
        const scene = new Scene(engine);
        scene.useRightHandedSystem = true;
        const camera = new ArcRotateCamera("Camera", 0, 0, 10, CAMERA_DEFAULT_POSITION, scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        // const havokInstance = await HavokPhysics();
        const hk = new HP(true, await HavokPlugin());

        const gravity = new Vector3(0, -2, 0);
        scene.enablePhysics(gravity, hk);

        new StandardMaterial("___standardMaterial", scene);

        const ground = CreateGround("___ground", { width: 10, height: 10 }, scene);
        new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

        const sphere = CreateSphere("___sphere", { diameter: 1 }, scene);
        sphere.position.y = 20;
        new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1 }, scene);

        Inspector.Show(scene, {});
        return scene;
    }

    async loadModel(model: Model, name: string = "") {
        const modelMesh = await modelLoaderService.load(model.meshURL);
        const container = await SceneLoader.LoadAssetContainerAsync("", modelMesh, this._scene)
        const material = new StandardMaterial("", this._scene);

        // @TODO test maps
        material.diffuseTexture = model.diffuseURL
            ? new Texture(fileToUrl(await modelLoaderService.load(model.diffuseURL)), this._scene)
            : null;
        material.ambientTexture = model.ambientURL
            ? new Texture(fileToUrl(await modelLoaderService.load(model.ambientURL)), this._scene)
            : null;
        material.specularTexture = model.specularURL
            ? new Texture(fileToUrl(await modelLoaderService.load(model.specularURL)), this._scene)
            : null;
        material.emissiveTexture = model.emissiveURL
            ? new Texture(fileToUrl(await modelLoaderService.load(model.emissiveURL)), this._scene)
            : null;
        material.reflectionTexture = model.reflectionURL
            ? new Texture(fileToUrl(await modelLoaderService.load(model.reflectionURL)), this._scene)
            : null;
        material.bumpTexture = model.normalURL
            ? new Texture(fileToUrl(await modelLoaderService.load(model.normalURL)), this._scene)
            : null;
        material.opacityTexture = model.opacityURL
            ? new Texture(fileToUrl(await modelLoaderService.load(model.opacityURL)), this._scene)
            : null;
        material.lightmapTexture = model.lightmapURL
            ? new Texture(fileToUrl(await modelLoaderService.load(model.lightmapURL)), this._scene)
            : null;

        container.meshes[container.meshes.length - 1].material = material;

        const colliderMeshes = model.colliderURL
            ? (await SceneLoader.LoadAssetContainerAsync("", await modelLoaderService.load(model.colliderURL), this._scene)).meshes
            : container.meshes
        const colliderMesh: Mesh = Mesh.MergeMeshes(colliderMeshes as Array<Mesh>, false, true)!;
        colliderMesh.isVisible = false;

        const node = new Mesh(name, this._scene);
        const nodeModel = new Mesh(`${name}_model`, this._scene);
        container.meshes.forEach(mesh => {
            nodeModel.addChild(mesh);
        });

        const nodeCollider = new Mesh(`${name}_collider`, this._scene);
        nodeCollider.addChild(colliderMesh as Mesh);

        node.addChild(nodeModel);
        node.addChild(nodeCollider);

        const collider = new PhysicsShapeMesh(colliderMesh, this._scene);
        new PhysicsAggregate(nodeModel, collider, { mass: 0 }, this._scene);
        container.addAllToScene();
    }
}