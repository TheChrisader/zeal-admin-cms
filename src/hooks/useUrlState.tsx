import { useState, useCallback, useEffect } from "react";

/**
 * Options for the useUrlState hook
 */
interface UseUrlStateOptions<T> {
  /** Default state to use when URL params are not present */
  defaultState: T;
  /** Whether to push a new history entry (true) or replace the current one (false) */
  pushToHistory?: boolean;
  /** Serialization function to convert state to URL params */
  serialize?: (state: T) => URLSearchParams;
  /** Deserialization function to convert URL params to state */
  deserialize?: (params: URLSearchParams) => T;
}

/**
 * A hook that synchronizes state with URL search parameters
 *
 * @param key - Unique identifier for this state in the URL
 * @param options - Configuration options
 * @returns [state, setState] - State and setter function similar to useState
 */
export function useUrlState<T extends Record<string, any>>(
  key: string,
  options: UseUrlStateOptions<T>
): [T, (newState: T | ((prevState: T) => T)) => void] {
  const {
    defaultState,
    pushToHistory = false,
    serialize = defaultSerialize,
    deserialize = defaultDeserialize,
  } = options;

  // Get initial state from URL or use default
  const getInitialState = (): T => {
    if (typeof window === "undefined") return defaultState;

    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get(key);

    if (!stateParam) return defaultState;

    try {
      const parsedParam = JSON.parse(stateParam);
      return deserialize(new URLSearchParams(parsedParam));
    } catch {
      return defaultState;
    }
  };

  const [state, setState] = useState<T>(getInitialState);

  // Update URL when state changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const serializedState = serialize(state);

    // Only update if state has actually changed
    const currentParam = urlParams.get(key);
    const newParam = JSON.stringify(
      Object.fromEntries(serializedState.entries())
    );

    if (currentParam === newParam) return;

    if (Object.keys(state).length === 0) {
      urlParams.delete(key);
    } else {
      urlParams.set(key, newParam);
    }

    const newUrl = `${window.location.pathname}${
      urlParams.toString() ? `?${urlParams.toString()}` : ""
    }`;

    if (pushToHistory) {
      window.history.pushState({}, "", newUrl);
    } else {
      window.history.replaceState({}, "", newUrl);
    }
  }, [state, key, pushToHistory, serialize]);

  // Listen for popstate (browser back/forward) events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const stateParam = urlParams.get(key);

      if (!stateParam) {
        console.log(key, defaultState);
        setState(defaultState);
        return;
      }

      try {
        const parsedParam = JSON.parse(stateParam);
        console.log(deserialize(new URLSearchParams(parsedParam)));
        setState(deserialize(new URLSearchParams(parsedParam)));
      } catch {
        setState(defaultState);
      }
    };

    window.addEventListener("popstate", handlePopState);
    // return () => window.removeEventListener("popstate", handlePopState);
    return () => {
      setTimeout(() => {
        window.removeEventListener("popstate", handlePopState);
      }, 0);
    };
  }, [key, defaultState, deserialize]);

  // Wrap setState to handle function updates
  const setUrlState = useCallback((newState: T | ((prevState: T) => T)) => {
    setState((prevState) => {
      if (typeof newState === "function") {
        return (newState as (prevState: T) => T)(prevState);
      }
      return newState;
    });
  }, []);

  return [state, setUrlState];
}

function defaultSerialize<T extends Record<string, unknown>>(
  state: T
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(state).forEach(([k, v]) => {
    if (v !== null && v !== undefined) {
      params.set(k, String(v));
    }
  });

  return params;
}

function defaultDeserialize<T extends Record<string, any>>(
  params: URLSearchParams
): T {
  const result = {} as T;

  params.forEach((value, key) => {
    if (!isNaN(Number(value)) && value !== "") {
      if (value.includes(".")) {
        result[key as keyof T] = parseFloat(value) as any;
      } else {
        result[key as keyof T] = parseInt(value, 10) as any;
      }
    } else if (value === "true") {
      result[key as keyof T] = true as any;
    } else if (value === "false") {
      result[key as keyof T] = false as any;
    } else {
      result[key as keyof T] = value as any;
    }
  });

  return result;
}
