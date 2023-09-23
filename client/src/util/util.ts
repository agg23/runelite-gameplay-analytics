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

/**
 * Limit the number of `func` calls based on `timeout`, but with instant return.
 * The first call of this function in a timespan will immediately call func, then every `timeout` milliseconds
 * @param func The function to throttle
 * @param timeout The number of milliseconds to delay
 * @returns A curried throttled function
 */
export const throttle = <T extends unknown[]>(
  func: (...args: T) => void,
  timeout: number
) => {
  let timer: NodeJS.Timer | undefined = undefined;

  // Track whether we got another call after the debounced one
  let valueAfterFirst = false;

  // Object so it can be captured and modified by the timer closure
  let latestArgs: T | undefined = undefined;

  return (...args: T) => {
    if (timer === undefined) {
      // First call, immediately call `func`
      valueAfterFirst = false;

      func(...args);
    } else {
      // We have an active timer, just update what will be called when it fires
      latestArgs = args;

      valueAfterFirst = true;

      return;
    }

    timer = setTimeout(() => {
      clearTimeout(timer);
      timer = undefined;

      if (!valueAfterFirst) {
        // No need to call again
        return;
      }

      if (latestArgs === undefined) {
        console.error("Throttle invariant failed");
        return;
      }

      func(...(latestArgs as T));
    }, timeout);
  };
};
