import type { ImportMetaEnv } from './vite-env';
const env = import.meta.env as unknown as ImportMetaEnv;

export const API_HOST: string = env.VITE_API_HOST;
export const STATIC_HOST: string = env.VITE_STATIC_HOST;
export const ENDPOINT = `${API_HOST}/api/v1/`;

export const PRECISION_EPSILON = 0.005;

export const CAMERA_DEFAULT_ALPHA = 0;
export const CAMERA_DEFAULT_BETA = 1;
export const CAMERA_DEFAULT_RADIUS = 25;
export const CAMERA_DEFAULT_POSITION = 2;

export const MOVE_SENSETIVITY = 0.7;
export const WHEEL_SENSETIVITY = 0.5;
export const MOUSE_MOVE_SENSETIVITY = 20;

export const FLIP_KEYS = ['KeyF'];
export const PICK_ITEM_KEYS = ['KeyG'];
export const ROTATE_CW_KEYS = ['KeyE'];
export const ROTATE_CCW_KEYS = ['KeyQ'];
export const ROLL_KEYS = ['KeyR'];
export const SHUFFLE_KEYS = ['KeyH'];

export const SCALE_UP_KEYS = ['NumpadAdd', 'Equal'];
export const SCALE_DOWN_KEYS = ['NumpadSubtract', 'Minus'];
export const SCALE_COEF = 0.1;
