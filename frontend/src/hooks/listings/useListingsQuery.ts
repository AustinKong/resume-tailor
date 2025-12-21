import { useQuery } from '@tanstack/react-query';

import type { ListingDraft } from '@/types/listing';

// TODO: I don't like this pattern, seems abit hacky
// Reads from the cache, not from server
export function useListingsQuery() {
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
    listings: query.data ?? [],
    ...query,
  };
}
