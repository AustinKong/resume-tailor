import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';

import {
  extractListing as extractListingSvc,
  saveListings as saveListingsSvc,
  scrapeListing as scrapeListingSvc,
} from '@/services/listings';
import type { ListingDraft, ListingDraftPending } from '@/types/listing';

export function useListingMutations() {
  const queryClient = useQueryClient();

  const { mutateAsync: scrapeListing } = useMutation({
    mutationFn: ({ url, id }: { url: string; id: string }) => scrapeListingSvc(url, id),
    onSuccess: (listing) => {
      queryClient.setQueryData(['listings'], (old: ListingDraft[] | undefined) => {
        return old?.map((l) => (l.id === listing.id ? listing : l)) || [];
      });
    },
    onError: (error, { id }) => {
      queryClient.setQueryData(['listings'], (old: ListingDraft[] | undefined) => {
        return (
          old?.map((l) =>
            l.id === id
              ? {
                  ...l,
                  status: 'error',
                  error: (error as Error).message,
                }
              : l
          ) || []
        );
      });
    },
  });

  const scrapeListings = async (urls: string[]) => {
    const pending: ListingDraftPending[] = urls.map((url) => ({
      id: crypto.randomUUID(),
      url,
      status: 'pending',
    }));

    queryClient.setQueryData(['listings'], (old: ListingDraft[] | undefined) => [
      ...(old || []),
      ...pending,
    ]);

    return Promise.allSettled(pending.map((p) => scrapeListing({ url: p.url, id: p.id })));
  };

  const { mutateAsync: extractListing, isError: isExtractError } = useMutation({
    mutationKey: ['extractListing'],
    mutationFn: ({ listing, content }: { listing: ListingDraft; content: string }) => {
      return extractListingSvc(listing.id, listing.url, content);
    },
    onSuccess: (updatedListing) => {
      queryClient.setQueryData(['listings'], (old: ListingDraft[] | undefined) => {
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
  const isExtractLoading = (listing: ListingDraft | null) => {
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
    // scrapeListing,
    scrapeListings,

    extractListing,
    isExtractLoading,
    isExtractError,

    saveListings,
    isSaveLoading,
    isSaveError,
  };
}
