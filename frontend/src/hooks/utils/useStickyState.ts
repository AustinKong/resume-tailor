import { useEffect, useState } from 'react';

/**
 * Provides "sticky" state behavior - once a non-null/undefined value is provided,
 * it persists that value even when the input becomes null/undefined.
 *
 * @template T - The type of the value
 * @param value - The current value, can be T, undefined, or null
 * @returns The current value if defined, otherwise the last defined value
 */
export function useStickyState<T>(value: T | undefined | null): T | undefined | null {
  const [stickyValue, setStickyValue] = useState(value);

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setStickyValue(value);
    }
  }, [value]);

  return value ?? stickyValue;
}
