import { ColourState } from "./ColourState";

export interface CustomShaderState {
    SpecularColor: ColourState;
    SpecularIntensity: number
    SpecularSharpness: number
    FresnelStrength: number
}
