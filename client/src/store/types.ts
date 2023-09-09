import { StateCreator } from "zustand";
import { Store } from "./store";

export type StateSliceCreator<T> = StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  T
>;
