export const HOST = 'localhost';
export const API_PORT = 3000;

export const STATIC_HOST = `http://${HOST}:5500`;
export const PROXY_PREFIX = `http://${HOST}:3000/?url=`;

export const PRECISION_EPSILON = 0.005;

export const CAMERA_DEFAULT_ALPHA = 0;
export const CAMERA_DEFAULT_BETA = 1;
export const CAMERA_DEFAULT_RADIUS = 25;
export const CAMERA_DEFAULT_POSITION = 2;

export const MOVE_SENSETIVITY = 0.7;
export const WHEEL_SENSETIVITY = 0.5;
export const MOUSE_MOVE_SENSETIVITY = 20;

export const MOVEMENT_VELOCITY = 500;

export const FLIP_KEYS = ['KeyF'];
export const PICK_ITEM_KEYS = ['KeyG'];
export const ROTATE_CW_KEYS = ['KeyE'];
export const ROTATE_CCW_KEYS = ['KeyQ'];
export const ROLL_KEYS = ['KeyR'];
export const SHUFFLE_KEYS = ['KeyH'];

export const PICK_HIGHT = 1;
export const ROTATION_STEP = Math.PI / 18;

export const SCALE_UP_KEYS = ['NumpadAdd', 'Equal'];
export const SCALE_DOWN_KEYS = ['NumpadSubtract', 'Minus'];
export const SCALE_COEF = 0.1;

export const MASS_DEFAULT = 1;
