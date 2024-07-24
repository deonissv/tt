export type UnknownObject = Record<string | symbol, unknown> & object;
export type OpnitalAllBut<T, K extends keyof T> = Required<Pick<T, K>> & Omit<Partial<T>, K>;
export type Optinal<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type _Tuple<T, N extends number, R extends unknown[] = []> = R['length'] extends N ? R : _Tuple<T, N, [T, ...R]>;

export type Tuple<T, N extends number> = _Tuple<T, N>;
