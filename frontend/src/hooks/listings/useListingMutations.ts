import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  extractListing as extractListingSvc,
  saveListings as saveListingsSvc,
  scrapeListings as scrapeListingsSvc,
} from '@/services/listings';
import type { ScrapingListing } from '@/types/listing';

export function useListingMutations() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: scrapeListings,
    isPending: isScrapeLoading,
    isError: isScrapeError,
  } = useMutation({
    mutationFn: scrapeListingsSvc,
    onSuccess: (listings) => {
      queryClient.setQueryData(['listings'], listings);
    },
  });

  const {
    mutateAsync: extractListing,
    isPending: isExtractLoading,
    isError: isExtractError,
  } = useMutation({
    mutationFn: ({ id, url, content }: { id: string; url: string; content: string }) => {
      return extractListingSvc(id, url, content);
    },
    onSuccess: (updatedListing) => {
      queryClient.setQueryData(['listings'], (old: ScrapingListing[] | undefined) => {
        return old?.map((l) => (l.id === updatedListing.id ? updatedListing : l));
      });
    },
  });

  const {
    mutateAsync: saveListings,
    isPending: isSaveLoading,
    isError: isSaveError,
  } = useMutation({
    mutationFn: saveListingsSvc,
  });

  return {
    scrapeListings,
    isScrapeLoading,
    isScrapeError,
    extractListing,
    isExtractLoading,
    isExtractError,
    saveListings,
    isSaveLoading,
    isSaveError,
  };
}
