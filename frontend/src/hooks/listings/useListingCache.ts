import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { ListingDraft } from '@/types/listing';

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

  const clearListings = useCallback(() => {
    queryClient.setQueryData(['listings'], []);
  }, [queryClient]);

  const getListing = useCallback(
    (id: string | null) => {
      const listings = queryClient.getQueryData<ListingDraft[]>(['listings']) ?? [];
      return listings.find((l) => l.id === id);
    },
    [queryClient]
  );

  return {
    updateListing,
    clearListings,
    getListing,
  };
}
