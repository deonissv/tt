export type UnknownObject = Record<string | symbol, unknown>;
export type OptionalAllBut<T, K extends keyof T | (keyof T)[]> = K extends keyof T
  ? Required<Pick<T, K>> & Omit<Partial<T>, K>
  : K extends (keyof T)[]
    ? Required<Pick<T, K[number]>> & Omit<Partial<T>, K[number]>
    : never;

export type Optinal<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type Spiced<T extends object> = T & Omit<UnknownObject, keyof T>;
export type Defined<T> = T extends undefined ? never : T;

/**
 * Represents a type that requires at least one property from a given set of properties.
 *
 * @template T - The original type.
 * @template U - The set of properties from which at least one is required.
 * @example
 *
 * interface I {
 *  T1?: string;
 *  T2?: string;
 * }
 *
 * type IAtLeastOne = RequireAtLeastOne<I, ['T1', 'T2']>;
 *
 * const example1: I = { T1: 'value1' }; // Valid
 * const example2: I = { T2: 'value2' }; // Valid
 * const example3: I = { T1: 'value1', T2: 'value2' }; // Valid
 * const example4: I = {}; // Invalid, will cause a TypeScript error
 *
 */
export type RequireAtLeastOne<T, U extends (keyof T)[]> = Omit<T, U[number]> &
  {
    [K in U[number]]-?: Required<Pick<T, K>>;
  }[U[number]];

export type Constructor<T> = new (...args: any[]) => T;

export type ParammedConstructor<T extends abstract new (...args: any) => any> = new (
  ...args: ConstructorParameters<T>
) => T;

type Primitive = string | number | boolean | null | undefined;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface RecursiveObject {
  [key: string]: RecursiveType;
}

export type RecursiveArray = RecursiveType[];

export type RecursiveType = Primitive | RecursiveObject | RecursiveArray;
