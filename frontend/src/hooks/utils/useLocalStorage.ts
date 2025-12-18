import { useState } from 'react';

/**
 * A hook that synchronizes a state value with localStorage.
 * It automatically persists the value to localStorage when it changes
 * and restores it on component mount.
 *
 * @template T - The type of the stored value
 * @param key - The localStorage key to store the value under
 * @param initialValue - The initial value to use if no stored value exists
 * @returns A tuple containing the current value and a setter function
 *
 * @example
 * const [name, setName] = useLocalStorage('userName', 'Anonymous');
 * // name will be 'Anonymous' initially, then persist any changes to localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
