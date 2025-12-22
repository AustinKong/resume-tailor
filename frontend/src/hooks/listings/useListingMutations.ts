import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useListingCache } from '@/hooks/listings/useListingCache';
import {
  ingestListing as ingestListingSvc,
  saveListing as saveListingSvc,
} from '@/services/listings';
import type { ListingDraft } from '@/types/listing';

export function useListingMutations() {
  const queryClient = useQueryClient();
  const { updateListing, setPending } = useListingCache();

  const { mutate: runIngest } = useMutation({
    mutationFn: ({ id, url, content }: { id: string; url: string; content?: string }) =>
      ingestListingSvc(url, content, id),
    onSuccess: (newDraft) => {
      updateListing(newDraft.id, newDraft);
    },
    onError: (error, variables) => {
      updateListing(variables.id, {
        status: 'error',
        error: (error as Error).message,
      });
    },
  });

  const ingestListing = (url: string, content?: string, existingId?: string) => {
    const id = existingId ?? crypto.randomUUID();
    const isNew = !existingId;

    if (isNew) {
      setPending(id, url);
    } else {
      updateListing(id, { status: 'pending' } as Partial<ListingDraft>);
    }

    runIngest({ id, url, content });

    return id;
  };

  const { mutateAsync: saveListing } = useMutation({
    mutationFn: saveListingSvc,
    onSuccess: (savedListing) => {
      queryClient.setQueryData(['listings'], (old: ListingDraft[] | undefined) => {
        return old?.filter((l) => l.id !== savedListing.id) || [];
      });
    },
  });

  // TODO: Update statuses
  const saveListings = async (listings: ListingDraft[]) => {
    return Promise.allSettled(listings.map((listing) => saveListing(listing)));
  };

  return {
    ingestListing,
    saveListings,
  };
}
