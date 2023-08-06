import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export interface PlayGround {
    leftHandedSystem?: boolean;     // default: false | If true, the Y axis will be inverted, and the Z axis will be inverted
    objectStates: ObjectState[];    // Objects on the table
}

export interface ObjectState {
    name: string;
    description?: string;           // default: ""
    model: Model;

    scale?: Vector3                 // default: Vector3.One
    rotation?: Vector3              // default: Vector3.Zero
    translation?: Vector3           // default: Vector3.Zero

    guid: string;
    mass?: number;                  // default: 1

}

export interface Model {
    // @TODO extend https://doc.babylonjs.com/typedoc/classes/BABYLON.Material
    meshURL: string;
    colliderURL?: string;           // default: meshURL

    diffuseURL?: string;
    ambientURL?: string;
    specularURL?: string;
    emissiveURL?: string;
    reflectionURL?: string;
    normalURL?: string;             // BABYLON.StandardMaterial().bumpTexture;
    opacityURL?: string;
    lightmapURL?: string;
}