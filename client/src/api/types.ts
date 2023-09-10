export type FetchState<T> =
  | {
      type: "loading";
    }
  | {
      type: "data";
      data: T;
    }
  | {
      type: "error";
    };
