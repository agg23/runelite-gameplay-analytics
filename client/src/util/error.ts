export const assertUnreachable = (input: never): never => {
  throw new Error("This shouldn't be reachable");
};
