import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { ScrapingListing } from '@/types/listing';

export function useListingCache() {
  const queryClient = useQueryClient();

  const updateListing = useCallback(
    (id: string, updates: Partial<ScrapingListing>) => {
      queryClient.setQueryData<ScrapingListing[]>(['listings'], (oldData) => {
        if (!oldData) return [];

        return oldData.map((listing) => (listing.id === id ? { ...listing, ...updates } : listing));
      });
    },
    [queryClient]
  );

  const clearListings = useCallback(() => {
    queryClient.setQueryData(['listings'], []);
  }, [queryClient]);

  const getListing = useCallback(
    (id: string | null) => {
      const listings = queryClient.getQueryData<ScrapingListing[]>(['listings']) ?? [];
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
