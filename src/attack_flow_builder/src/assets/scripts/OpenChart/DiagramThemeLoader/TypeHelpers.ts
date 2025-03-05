/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Converts `S` from camelCase to snake_case.
 * ({@link https://stackoverflow.com/a/65642944 Source})
 */
type CamelToSnakeCase<S extends string> =
  S extends `${infer T}${infer U}`
      ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
      : S;

/**
 * Recursively converts all keys in `T` from camelCase to snake_case.
 */
export type ToSnakeCaseKeys<T extends object> = {
    [K in keyof T as K extends string ? CamelToSnakeCase<K> : K]:
    T[K] extends Array<any> ? T[K] :
        T[K] extends object ? ToSnakeCaseKeys<T[K]> : T[K]
};

/**
 * Substitutes all types of type `A` in type `T` with type `B`.
 * ({@link https://stackoverflow.com/a/59833891 Source})
 */
export type SubstituteType<T, A, B> =
    T extends A
        ? B
        : T extends object
            ? { [K in keyof T]: SubstituteType<T[K], A, B> }
            : T;

/**
 * Recursive version of Partial<T>.
 */
export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
