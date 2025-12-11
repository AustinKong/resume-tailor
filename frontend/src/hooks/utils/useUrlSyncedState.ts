import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { useStableValue } from './useStableValue';

export interface ParamHandler<T> {
  serialize: (value: T) => string | string[] | null;
  deserialize: (params: URLSearchParams, key: string) => T | null;
}

export const UrlParamTypes = {
  STRING: {
    serialize: (v) => v,
    deserialize: (params, key) => params.get(key),
  } satisfies ParamHandler<string>,

  NUMBER: {
    serialize: (v) => String(v),
    deserialize: (params, key) => {
      const val = params.get(key);
      return val ? Number(val) : null;
    },
  } satisfies ParamHandler<number>,

  BOOLEAN: {
    serialize: (v) => String(v),
    deserialize: (params, key) => {
      const val = params.get(key);
      return val === 'true' ? true : val === 'false' ? false : null;
    },
  } satisfies ParamHandler<boolean>,

  ARRAY: {
    serialize: (v) => v,
    deserialize: (params, key) => {
      const vals = params.getAll(key);
      return vals.length > 0 ? vals : null;
    },
  } satisfies ParamHandler<string[]>,
};

export type UrlParamTypeMap = {
  STRING: string;
  NUMBER: number;
  BOOLEAN: boolean;
  ARRAY: string[];
};

export type UrlParamKey = keyof UrlParamTypeMap;

/**
 * Synchronizes a state value with a URL search parameter.
 * It automatically updates the URL when the state changes and vice versa.
 *
 * Supported preset types: 'STRING', 'NUMBER', 'BOOLEAN', 'ARRAY'
 * For custom types, use the custom handler overload.
 *
 * @param key - The URL parameter key to sync with.
 * @param defaultValue - The default value to use if the parameter is not present in the URL.
 * @param config - Configuration object specifying the parameter type.
 * @returns A tuple containing the current state value and a setter function to update it.
 *
 * @example
 * // Using preset type
 * const [search, setSearch] = useUrlSyncedState('q', '', { type: 'STRING' });
 *
 * // Using custom handler
 * const [sorting, setSorting] = useUrlSyncedState('sort', [], { custom: tableSortHandler });
 */
export function useUrlSyncedState<K extends UrlParamKey>(
  key: string,
  defaultValue: UrlParamTypeMap[K],
  config: { type: K }
): [UrlParamTypeMap[K], (value: UrlParamTypeMap[K]) => void];

export function useUrlSyncedState<T>(
  key: string,
  defaultValue: T,
  config: { custom: ParamHandler<T> }
): [T, (value: T) => void];

export function useUrlSyncedState<T>(
  key: string,
  defaultValue: T,
  config: { type?: UrlParamKey; custom?: ParamHandler<T> }
): [T, (value: T) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const { type, custom } = config;

  const stableDefaultValue = useStableValue(defaultValue);

  const handler = custom || (type ? (UrlParamTypes[type] as ParamHandler<T>) : null);

  if (!handler) {
    throw new Error(`useUrlSyncedState: You must provide either a 'type' or a 'custom' handler.`);
  }

  const rawValue = useMemo(() => {
    const parsed = handler.deserialize(searchParams, key);
    return parsed !== null ? parsed : stableDefaultValue;
  }, [searchParams, key, handler, stableDefaultValue]);

  // Stablize the value because some components depend on referential stability
  const value = useStableValue(rawValue);

  const setValue = useCallback(
    (newValue: T) => {
      setSearchParams(
        (prev) => {
          const isDefault = JSON.stringify(newValue) === JSON.stringify(stableDefaultValue);
          const result = isDefault ? null : handler.serialize(newValue);

          prev.delete(key);

          if (result !== null) {
            if (Array.isArray(result)) {
              result.forEach((val) => prev.append(key, val));
            } else {
              prev.set(key, result);
            }
          }

          return prev;
        },
        { replace: true }
      );
    },
    [stableDefaultValue, handler, key, setSearchParams]
  );

  return [value, setValue];
}
