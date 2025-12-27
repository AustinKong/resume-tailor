import { useQuery } from '@tanstack/react-query';

import { getListing } from '@/services/listings';

export function useListingQuery(listingId: string) {
  return useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => getListing(listingId),
    enabled: Boolean(listingId),
  });
}
