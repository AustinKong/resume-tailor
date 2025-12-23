import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useListingDraftMutations } from '@/hooks/listings/useListingDraftMutations';
import {
  ingestListing as ingestListingSvc,
  saveListing as saveListingSvc,
} from '@/services/listings';
import type { ListingDraft } from '@/types/listing';

export function useListingMutations() {
  const queryClient = useQueryClient();
  const { setListingDraft, setPendingListingDraft, addPendingListingDraft } =
    useListingDraftMutations();

  const { mutate: runIngest } = useMutation({
    mutationFn: ({ id, url, content }: { id: string; url: string; content?: string }) =>
      ingestListingSvc(url, content, id),
    onSuccess: (newDraft) => {
      setListingDraft(newDraft.id, newDraft);
    },
    onError: (error, variables) => {
      setListingDraft(variables.id, {
        id: variables.id,
        url: variables.url,
        status: 'error',
        error: (error as Error).message,
        html: null,
      } as ListingDraft);
    },
  });

  const ingestListing = (url: string, content?: string, existingId?: string) => {
    const id = existingId ?? crypto.randomUUID();
    const isNew = !existingId;

    if (isNew) {
      addPendingListingDraft(id, url);
    } else {
      setPendingListingDraft(id);
    }

    runIngest({ id, url, content });

    return id;
  };

  // Optimistically remove's listing from UI on save but rolls back if it fails
  const { mutateAsync: saveListing } = useMutation({
    mutationFn: saveListingSvc,
    onMutate: (listing: ListingDraft) => {
      const previousListings = queryClient.getQueryData<ListingDraft[]>(['listings']);

      queryClient.setQueryData(['listings'], (old: ListingDraft[] | undefined) => {
        return old?.filter((l) => l.id !== listing.id) || [];
      });

      return { previousListings };
    },
    onError: (_err, _listing, context) => {
      if (context?.previousListings) {
        queryClient.setQueryData(['listings'], context.previousListings);
      }
    },
  });

  const saveListings = async (listings: ListingDraft[]) => {
    return Promise.allSettled(listings.map((listing) => saveListing(listing)));
  };

  return {
    ingestListing,
    saveListings,
  };
}
