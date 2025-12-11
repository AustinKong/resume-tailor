import { useRef } from 'react';

/**
 * A hook that returns a stable reference to a value.
 * It only updates the reference when the value actually changes (deep equality).
 * This is useful for preventing unnecessary re-renders or effects when the value
 * is an object or array that gets recreated but has the same content.
 *
 * @param value - The value to stabilize
 * @returns The stable value reference
 */
export function useStableValue<T>(value: T): T {
  const ref = useRef(value);
  if (JSON.stringify(value) !== JSON.stringify(ref.current)) {
    ref.current = value;
  }
  return ref.current;
}
