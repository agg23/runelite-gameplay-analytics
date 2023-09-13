export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  timeout: number
) => {
  let timer: NodeJS.Timer | undefined = undefined;

  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
};
