import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import HavokPhysics from "@babylonjs/havok";

import { Model } from './models/SandBox';

import { modelLoaderService } from './services';
import { fileToUrl } from './utils';
import { Inspector } from '@babylonjs/inspector';

const CAMERA_DEFAULT_POSITION = new BABYLON.Vector3(2, 2, 2);


export default class Playground {
    private _scene: BABYLON.Scene;

    constructor(scene: BABYLON.Scene) {
        this._scene = scene;
    }

    static async init(canvas: HTMLCanvasElement): Promise<Playground> {
        const engine = await this.initEngine(canvas);
        const scene = await this.initScene(canvas, engine);

        engine.runRenderLoop(() => { scene!.render() });
        window.addEventListener("resize", () => { engine!.resize() });
        return new Playground(scene);
    }

    private static async initEngine(canvas: HTMLCanvasElement): Promise<BABYLON.Engine> {
        let engine: BABYLON.Engine;
        const webgpuSupported = await BABYLON.WebGPUEngine.IsSupportedAsync;
        if (webgpuSupported) {
            engine = new BABYLON.WebGPUEngine(canvas, {
                deviceDescriptor: {
                    requiredFeatures: [
                        "depth-clip-control",
                        "depth32float-stencil8",
                        "texture-compression-bc",
                        "texture-compression-etc2",
                        "texture-compression-astc",
                        "timestamp-query",
                        "indirect-first-instance",
                    ],
                },
            });
            await (engine as BABYLON.WebGPUEngine).initAsync();
        } else {
            engine = new BABYLON.Engine(canvas, true);
        }
        return engine;
    }

    private static async initScene(canvas: HTMLCanvasElement, engine: BABYLON.Engine): Promise<BABYLON.Scene> {
        const scene = new BABYLON.Scene(engine);
        scene.useRightHandedSystem = true;
        const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, CAMERA_DEFAULT_POSITION, scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        const havokInstance = await HavokPhysics();
        const hk = new BABYLON.HavokPlugin(true, havokInstance);

        const gravity = new BABYLON.Vector3(0, -2, 0);
        scene.enablePhysics(gravity, hk);

        const ground = BABYLON.MeshBuilder.CreateGround("___ground", { width: 10, height: 10 }, scene);
        new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

        const sphere = BABYLON.MeshBuilder.CreateSphere("___sphere", { diameter: 1 }, scene);
        sphere.position.y = 20;
        new BABYLON.PhysicsAggregate(sphere, BABYLON.PhysicsShapeType.SPHERE, { mass: 1 }, scene);

        // @ts-ignore
        Inspector.Show(scene, {});
        return scene;
    }

    async loadModel(model: Model, name: string = "") {
        const modelMesh = await modelLoaderService.load(model.meshURL);
        const container = await BABYLON.SceneLoader.LoadAssetContainerAsync("", modelMesh, this._scene)
        const material = new BABYLON.StandardMaterial("", this._scene);

        // @TODO test maps
        material.diffuseTexture = model.diffuseURL
            ? new BABYLON.Texture(fileToUrl(await modelLoaderService.load(model.diffuseURL)), this._scene)
            : null;
        material.ambientTexture = model.ambientURL
            ? new BABYLON.Texture(fileToUrl(await modelLoaderService.load(model.ambientURL)), this._scene)
            : null;
        material.specularTexture = model.specularURL
            ? new BABYLON.Texture(fileToUrl(await modelLoaderService.load(model.specularURL)), this._scene)
            : null;
        material.emissiveTexture = model.emissiveURL
            ? new BABYLON.Texture(fileToUrl(await modelLoaderService.load(model.emissiveURL)), this._scene)
            : null;
        material.reflectionTexture = model.reflectionURL
            ? new BABYLON.Texture(fileToUrl(await modelLoaderService.load(model.reflectionURL)), this._scene)
            : null;
        material.bumpTexture = model.normalURL
            ? new BABYLON.Texture(fileToUrl(await modelLoaderService.load(model.normalURL)), this._scene)
            : null;
        material.opacityTexture = model.opacityURL
            ? new BABYLON.Texture(fileToUrl(await modelLoaderService.load(model.opacityURL)), this._scene)
            : null;
        material.lightmapTexture = model.lightmapURL
            ? new BABYLON.Texture(fileToUrl(await modelLoaderService.load(model.lightmapURL)), this._scene)
            : null;

        container.meshes[container.meshes.length - 1].material = material;

        const colliderMeshes = model.colliderURL
            ? (await BABYLON.SceneLoader.LoadAssetContainerAsync("", await modelLoaderService.load(model.colliderURL), this._scene)).meshes
            : container.meshes
        const colliderMesh: BABYLON.Mesh = BABYLON.Mesh.MergeMeshes(colliderMeshes as Array<BABYLON.Mesh>, false, true)!;
        colliderMesh.isVisible = false;

        const node = new BABYLON.Mesh(name, this._scene);
        const nodeModel = new BABYLON.Mesh(`${name}_model`, this._scene);
        container.meshes.forEach(mesh => {
            nodeModel.addChild(mesh);
        });

        const nodeCollider = new BABYLON.Mesh(`${name}_collider`, this._scene);
        nodeCollider.addChild(colliderMesh as BABYLON.Mesh);

        node.addChild(nodeModel);
        node.addChild(nodeCollider);

        const collider = new BABYLON.PhysicsShapeMesh(colliderMesh, this._scene);
        new BABYLON.PhysicsAggregate(nodeModel, collider, { mass: 0 }, this._scene);
        container.addAllToScene();
    }
}