import { useQuery } from '@tanstack/react-query';

import type { ScrapingListing } from '@/types/listing';

// Reads from the cache, not from server
export function useListingsQuery() {
  const query = useQuery<ScrapingListing[]>({
    queryKey: ['listings'],
    queryFn: () => Promise.resolve([]),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    listings: query.data ?? [],
    ...query,
  };
}
