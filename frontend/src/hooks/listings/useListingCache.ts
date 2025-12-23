import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { ListingDraft, ListingDraftPending, ListingExtraction } from '@/types/listing';

// DO NOT attempt to merge these functions into a single "updateListing" function
// Doing so makes things prone to breaking and harder to reason about
export function useListingCache() {
  const queryClient = useQueryClient();

  // Replaces the entire listing object at the specified ID.
  const setListing = useCallback(
    (id: string, listing: ListingDraft) => {
      queryClient.setQueryData<ListingDraft[]>(
        ['listings'],
        (old) => old?.map((l) => (l.id === id ? listing : l)) ?? []
      );
    },
    [queryClient]
  );

  // Retains the ID and URL but resets status to 'pending'.
  const setExistingToPending = useCallback(
    (id: string) => {
      queryClient.setQueryData<ListingDraft[]>(
        ['listings'],
        (old) =>
          old?.map((l) =>
            l.id === id ? ({ id: l.id, url: l.url, status: 'pending' } as ListingDraftPending) : l
          ) ?? []
      );
    },
    [queryClient]
  );

  // Appends a new pending item with ID to the list.
  const addPendingListing = useCallback(
    (id: string, url: string) => {
      queryClient.setQueryData<ListingDraft[]>(['listings'], (old) => [
        ...(old ?? []),
        { id, url, status: 'pending' } as ListingDraftPending,
      ]);
    },
    [queryClient]
  );

  // Targets the nested data object without changing the listing status.
  const patchListingContent = useCallback(
    (id: string, updates: Partial<ListingExtraction>) => {
      queryClient.setQueryData<ListingDraft[]>(['listings'], (old) => {
        return (
          old?.map((l) => {
            if (l.id !== id) return l;
            if (!('listing' in l)) return l;

            return { ...l, listing: { ...l.listing, ...updates } };
          }) ?? []
        );
      });
    },
    [queryClient]
  );

  // Removes listings with the specified IDs from the cache.
  const discardListings = useCallback(
    (ids: string[]) => {
      queryClient.setQueryData<ListingDraft[]>(
        ['listings'],
        (old) => old?.filter((l) => !ids.includes(l.id)) ?? []
      );
    },
    [queryClient]
  );

  return {
    setListing,
    setExistingToPending,
    addPendingListing,
    patchListingContent,
    discardListings,
  };
}
