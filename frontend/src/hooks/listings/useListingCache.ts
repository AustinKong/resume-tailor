import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { ListingDraft, ListingDraftPending } from '@/types/listing';

export function useListingCache() {
  const queryClient = useQueryClient();

  const updateListing = useCallback(
    (id: string, updates: Partial<ListingDraft>) => {
      queryClient.setQueryData<ListingDraft[]>(['listings'], (oldData) => {
        if (!oldData) return [];

        return oldData.map((listing) =>
          listing.id === id ? ({ ...listing, ...updates } as ListingDraft) : listing
        );
      });
    },
    [queryClient]
  );

  const discardListings = useCallback(
    (ids: string[]) => {
      queryClient.setQueryData(['listings'], (old: ListingDraft[] | undefined) => {
        if (!old) return [];

        return old.filter((listing) => !ids.includes(listing.id));
      });
    },
    [queryClient]
  );

  const clearListings = useCallback(() => {
    queryClient.setQueryData(['listings'], []);
  }, [queryClient]);

  const setPending = useCallback(
    (id: string, url: string) => {
      queryClient.setQueryData<ListingDraft[]>(['listings'], (old) => {
        const pendingItem = { id, url, status: 'pending' } as ListingDraftPending;
        if (!old) return [pendingItem];

        const exists = old.some((l) => l.id === id);
        if (exists) {
          return old.map((l) => (l.id === id ? pendingItem : l));
        }
        return [pendingItem, ...old];
      });
    },
    [queryClient]
  );

  return {
    updateListing,
    discardListings,
    clearListings,
    setPending,
  };
}
