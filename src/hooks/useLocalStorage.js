import { useState } from 'react';

/**
 * Drop-in useState replacement that persists to localStorage.
 * - Lazy initializer reads localStorage synchronously on first render,
 *   avoiding the default-value flash that a useEffect approach would cause.
 * - The setter accepts a value or an updater function, matching useState's API.
 * - Try/catch guards against environments where localStorage is unavailable
 *   (private-browsing quota exceeded, SSR, etc.).
 */
export const useLocalStorage = (key, defaultValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = (valueOrUpdater) => {
    try {
      const next =
        typeof valueOrUpdater === 'function'
          ? valueOrUpdater(storedValue)
          : valueOrUpdater;
      setStoredValue(next);
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch (err) {
      console.error(`useLocalStorage: could not write key "${key}"`, err);
    }
  };

  return [storedValue, setValue];
};