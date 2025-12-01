import {
  type MutateOptions,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDebouncedMutationOptions<TData, TError, TVariables, TContext>
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  delay?: number;
}

/**
 * Debounced mutation hook that delays mutation execution until calls stabilize.
 * Automatically cancels pending mutations when new ones are triggered.
 *
 * @param options - Mutation options with optional delay (default: 500ms)
 * @returns TanStack Query mutation result with debounced mutate functions
 */
export function useDebouncedMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>({
  delay = 500,
  ...options
}: UseDebouncedMutationOptions<TData, TError, TVariables, TContext>): UseMutationResult<
  TData,
  TError,
  TVariables,
  TContext
> {
  const mutation = useMutation(options);
  const mutationRef = useRef(mutation);

  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    mutationRef.current = mutation;
  }); // Intentionally no dependencies - updates every render

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const previousResolveRef = useRef<((data: TData) => void) | undefined>(undefined);

  const debouncedMutate = useCallback(
    (variables: TVariables, mutateOptions?: MutateOptions<TData, TError, TVariables, TContext>) => {
      setIsDebouncing(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setIsDebouncing(false);
        mutationRef.current.mutate(variables, mutateOptions);
      }, delay);
    },
    [delay]
  );

  const debouncedMutateAsync = useCallback(
    (variables: TVariables): Promise<TData> => {
      setIsDebouncing(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // When a new mutation is triggered, we "ghost" the previous promise.
      // We don't reject it. We just ensure that if the old timer somehow fired,
      // it wouldn't be able to trigger the resolve function.
      // Effectively, the old promise stays in "Pending" state forever (until garbage collected).
      previousResolveRef.current = undefined;

      return new Promise((resolve, reject) => {
        const currentResolve = (data: TData) => resolve(data);
        previousResolveRef.current = currentResolve;

        timeoutRef.current = setTimeout(() => {
          setIsDebouncing(false);

          mutationRef.current
            .mutateAsync(variables)
            .then((res) => {
              if (previousResolveRef.current === currentResolve) {
                resolve(res);
              }
            })
            .catch((err) => {
              if (previousResolveRef.current === currentResolve) {
                reject(err);
              }
            });
        }, delay);
      });
    },
    [delay]
  );

  const combinedIsPending = isDebouncing || mutation.isPending;

  return {
    ...mutation,
    mutate: debouncedMutate,
    mutateAsync: debouncedMutateAsync,
    isPending: combinedIsPending,
  } as UseMutationResult<TData, TError, TVariables, TContext>;
}
