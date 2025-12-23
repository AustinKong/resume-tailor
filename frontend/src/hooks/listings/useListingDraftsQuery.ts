import { useQuery } from '@tanstack/react-query';

import type { ListingDraft } from '@/types/listing';

// Client-side state, never synced to server
export function useListingDraftsQuery() {
  const query = useQuery<ListingDraft[]>({
    queryKey: ['listings'],
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: false,
    queryFn: () => {
      throw new Error(
        'Query function called unexpectedly. Data should be managed via cache updates.'
      );
    },
  });

  return {
    listingDrafts: query.data ?? [],
    ...query,
  };
}
