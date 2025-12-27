import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getListings } from '@/services/listings';
import type { StatusEnum } from '@/types/application';

export function useListingsQuery({
  search,
  sortBy,
  sortOrder,
  statuses,
  pageSize = 50,
}: {
  search?: string;
  sortBy?: 'title' | 'company' | 'posted_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  statuses?: StatusEnum[];
  pageSize?: number;
} = {}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ['listings', search, sortBy, sortOrder, statuses],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getListings(
          pageParam,
          pageSize,
          search,
          statuses?.length ? statuses : undefined,
          sortBy,
          sortOrder
        ),
      getNextPageParam: (lastPage) => {
        if (lastPage.page < lastPage.pages) return lastPage.page + 1;
        return undefined;
      },
    });

  const listings = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  return {
    data,
    listings,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoading || isFetchingNextPage,
    isError,
  };
}
