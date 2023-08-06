export interface PhysicsMaterialState {
    StaticFriction: number; //The friction used when an object is laying still on a surface. Usually a value from 0 to 1. A value of zero feels like ice, a value of 1 will make it very hard to get the object moving.
    DynamicFriction: number; //The friction used when already moving. Usually a value from 0 to 1. A value of zero feels like ice, a value of 1 will make it come to rest very quickly unless a lot of force or gravity pushes the object.
    Bounciness: number; //How bouncy is the surface? A value of 0 will not bounce. A value of 1 will bounce without any loss of energy.
    FrictionCombine: PhysicMaterialCombine; //How the friction of two colliding objects is combined. 0 = Average, 1 = Minimum, 2 = Maximum, 3 = Multiply.
    BounceCombine: PhysicMaterialCombine; //How the bounciness of two colliding objects is combined. 0 = Average, 1 = Minimum, 2 = Maximum, 3 = Multiply.
}

export enum PhysicMaterialCombine {
    Average,
    Minimum,
    Multiply,
    Maximum
}