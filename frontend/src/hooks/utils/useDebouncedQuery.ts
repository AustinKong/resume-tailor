import {
  type QueryKey,
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

import { useDebounce } from './useDebounce';

interface UseDebouncedQueryOptions<TData, TError, TValue>
  extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  queryKey: QueryKey;
  inputValue: TValue;
  queryFn: (value: TValue) => Promise<TData>;
  delay?: number;
}

/**
 * Debounced query hook that delays query execution until input stabilizes.
 *
 * @param options - Query options with inputValue and queryFn
 * @returns TanStack Query result
 */
export function useDebouncedQuery<TData = unknown, TError = Error, TValue = string>({
  queryKey,
  inputValue,
  queryFn,
  delay = 500,
  ...options
}: UseDebouncedQueryOptions<TData, TError, TValue>): UseQueryResult<TData, TError> {
  const debouncedValue = useDebounce(inputValue, delay);

  const finalQueryKey = [...queryKey, debouncedValue] as const;

  // Stops query from sending `api/endpoint?q=`
  const isEnabled =
    (typeof debouncedValue === 'string' ? debouncedValue.length > 0 : true) &&
    options.enabled !== false;

  return useQuery({
    queryKey: finalQueryKey,
    queryFn: () => queryFn(debouncedValue),
    enabled: isEnabled,
    ...options,
  });
}
