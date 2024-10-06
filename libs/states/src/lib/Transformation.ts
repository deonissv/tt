type _Tuple<T, N extends number, R extends unknown[] = []> = R['length'] extends N ? R : _Tuple<T, N, [T, ...R]>;
export type Tuple<T, N extends number> = _Tuple<T, N>;

export interface Transformation {
  scale?: Tuple<number, 3>; // default: Vector3.One
  rotation?: Tuple<number, 3>; // default: Vector3.Zero
  position?: Tuple<number, 3>; // default: Vector3.Zero
}
