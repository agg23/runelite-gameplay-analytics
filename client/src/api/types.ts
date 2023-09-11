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
      variant: FetchError;
      message?: string;
    };

export enum FetchError {
  Network,
  Server,
  Other,
}
