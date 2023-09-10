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
