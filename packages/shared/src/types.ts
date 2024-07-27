export type UnknownObject = Record<string | symbol, unknown>;
export type OptionalAllBut<T, K extends keyof T | (keyof T)[]> = K extends keyof T
  ? Required<Pick<T, K>> & Omit<Partial<T>, K>
  : K extends (keyof T)[]
  ? Required<Pick<T, K[number]>> & Omit<Partial<T>, K[number]>
  : never;

export type Optinal<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type _Tuple<T, N extends number, R extends unknown[] = []> = R['length'] extends N ? R : _Tuple<T, N, [T, ...R]>;

export type Tuple<T, N extends number> = _Tuple<T, N>;
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type Spiced<T extends object> = T & Omit<UnknownObject, keyof T>;
export type Defined<T> = T extends undefined ? never : T;
