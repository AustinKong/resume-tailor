import { useEffect, useState } from 'react';

import { useDebounce } from './useDebounce';
import type { UrlParamKey, UrlParamTypeMap } from './useUrlSyncedState';
import { useUrlSyncedState } from './useUrlSyncedState';

/**
 * A convenience wrapper around useUrlSyncedState that adds debouncing for text inputs.
 * Provides immediate UI feedback while debouncing URL updates.
 *
 * @param key - The URL parameter key to sync with.
 * @param defaultValue - The default value to use if the parameter is not present in the URL.
 * @param config - Configuration object with type and debounce delay.
 * @returns A tuple containing the current local state value, debounced value, and a setter function.
 *
 * @example
 * const [searchText, debouncedSearchText, setSearchText] = useDebouncedUrlSyncedState('q', '', {
 *   type: 'STRING',
 *   debounceMs: 300
 * });
 * // Use searchText for immediate UI feedback, debouncedSearchText for expensive operations
 */
export function useDebouncedUrlSyncedState<K extends UrlParamKey>(
  key: string,
  defaultValue: UrlParamTypeMap[K],
  config: { type: K; debounceMs: number }
) {
  const [urlState, setUrlState] = useUrlSyncedState(key, defaultValue, { type: config.type });
  const [localState, setLocalState] = useState(urlState);
  const debouncedLocalState = useDebounce(localState, config.debounceMs);

  useEffect(() => {
    setUrlState(debouncedLocalState);
  }, [debouncedLocalState, setUrlState]);

  useEffect(() => {
    setLocalState(urlState);
  }, [urlState]);

  return [localState, debouncedLocalState, setLocalState] as const;
}
