import { ObjectMap } from "../../types/util";

export interface Item {
  id: string;
  name: string;
  // TODO: Many more properties
  wiki_url: string;
}

export interface NPC {
  id: string;
  name: string;
  examine: string;
  wiki_url: string;

  // TODO: Many more properties
  // TODO: Add drops and percentage
}

export interface WikiResponse<T> {
  data: {
    [id: number]: T;
  };
}

export interface GEPrice {
  high: number;
  highTime: number;
  low: number;
  lowTime: number;
}
