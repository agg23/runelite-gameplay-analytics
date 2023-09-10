export type Mutable<T> = { -readonly [Key in keyof T]: T[Key] };

export interface ObjectMap<T> {
  [key: string]: T;
}

type AtLeastOne<T> = [T, ...T[]];

// Taken from https://stackoverflow.com/a/55266531/2108817
export const exhaustiveStringTuple =
  <T extends string>() =>
  <L extends AtLeastOne<T>>(
    ...x: L extends any
      ? Exclude<T, L[number]> extends never
        ? L
        : Exclude<T, L[number]>[]
      : never
  ) =>
    x;
