import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';

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

  const { mutateAsync: extractListing, isError: isExtractError } = useMutation({
    mutationKey: ['extractListing'],
    mutationFn: ({ listing, content }: { listing: ScrapingListing; content: string }) => {
      return extractListingSvc(listing.id, listing.url, content);
    },
    onSuccess: (updatedListing) => {
      queryClient.setQueryData(['listings'], (old: ScrapingListing[] | undefined) => {
        return old?.map((l) => (l.id === updatedListing.id ? updatedListing : l));
      });
    },
  });

  // Track pending extractions even across component unmounts
  const pendingExtractions = useMutationState({
    filters: { status: 'pending', mutationKey: ['extractListing'] },
    select: (mutation) => (mutation.state.variables as { id: string })?.id,
  });

  // If listing is null, check if any extraction is pending
  const isExtractLoading = (listing: ScrapingListing | null) => {
    if (!listing) return pendingExtractions.length > 0;
    return pendingExtractions.includes(listing.id);
  };

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
