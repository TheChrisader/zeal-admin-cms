import { MutableRefObject, useCallback, useRef } from "react";

/**
 * Returns a memoized function that will only call the passed function when it hasn't been called for the wait period
 * @param func The function to be called
 * @param wait Wait period after function hasn't been called for
 * @returns A memoized function that is debounced
 */
const useDebouncedCallback = <T extends unknown[]>(
  func: (...args: T) => void,
  wait: number
) => {
  // Use a ref to store the timeout between renders
  // and prevent changes to it from causing re-renders
  const timeout: MutableRefObject<NodeJS.Timeout | undefined> = useRef();

  return useCallback(
    (...args: T) => {
      const later = () => {
        clearTimeout(timeout.current);
        func(...args);
      };

      clearTimeout(timeout.current);
      timeout.current = setTimeout(later, wait);
    },
    [func, wait]
  );
};

export default useDebouncedCallback;
