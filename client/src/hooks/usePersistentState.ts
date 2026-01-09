import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((prevValue: T) => T);

export function usePersistentState<T>(
  key: string,
  defaultValue: T
): [T, (value: SetValue<T>) => void] {
  // Initialize state from localStorage or use default
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, state]);

  // Wrapped setter that handles function updates
  const setValue = useCallback((value: SetValue<T>) => {
    setState((prevState) => {
      const nextState = value instanceof Function ? value(prevState) : value;
      return nextState;
    });
  }, []);

  return [state, setValue];
}

export default usePersistentState;
