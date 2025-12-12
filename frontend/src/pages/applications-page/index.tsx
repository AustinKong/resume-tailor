import { HStack, VStack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { type OnChangeFn, type SortingState } from '@tanstack/react-table';
import { startTransition, useCallback } from 'react';

import { useApplicationsQuery } from '@/hooks/applications';
import { useDebouncedUrlSyncedState } from '@/hooks/utils/useDebouncedUrlSyncedState';
import { type ParamHandler, useUrlSyncedState } from '@/hooks/utils/useUrlSyncedState';
import { getApplication } from '@/services/applications';
import type { Application, StatusEnum } from '@/types/application';

import Drawer from './drawer';
import Table from './table';
import Toolbar from './Toolbar';

// Define handler here to ensure referential stability
const tableSortHandler: ParamHandler<SortingState> = {
  serialize: (v: SortingState) => {
    const sort = v[0];
    if (!sort) return null;
    return `${sort.id}:${sort.desc ? 'desc' : 'asc'}`;
  },
  deserialize: (params: URLSearchParams, key: string) => {
    const val = params.get(key);
    if (!val) return [];

    const [id, desc] = val.split(':');
    return [{ id, desc: desc === 'desc' }];
  },
};

export default function ApplicationsPage() {
  const queryClient = useQueryClient();

  const [searchInput, debouncedSearchInput, setSearchInput] = useDebouncedUrlSyncedState('q', '', {
    type: 'STRING',
    debounceMs: 700,
  });
  const [sorting, setSorting] = useUrlSyncedState<SortingState>('sort', [], {
    custom: tableSortHandler,
  });
  const [statuses, setStatuses] = useUrlSyncedState('status', [], { type: 'ARRAY' });

  const [applicationId, setApplicationId] = useUrlSyncedState('applicationId', '', {
    type: 'STRING',
  });

  const sortBy = sorting[0]?.id || '';
  const sortOrder = sorting[0]?.desc ? 'desc' : 'asc';

  const handleRowClick = useCallback(
    (application: Application) => {
      startTransition(() => {
        setApplicationId(application.id);
      });
    },
    [setApplicationId]
  );

  // Prefetch on hover because the drawer's query fights for resources with the drawer's animations
  const handleRowHover = useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: ['application', id],
        queryFn: () => getApplication(id),
        staleTime: 1000 * 60 * 5,
      });
    },
    [queryClient]
  );

  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      const newSorting =
        typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
      setSorting(newSorting);
    },
    [setSorting, sorting]
  );

  const { applications, fetchNextPage, hasNextPage, isLoading } = useApplicationsQuery({
    search: debouncedSearchInput,
    sortBy: sortBy as 'title' | 'company' | 'posted_at' | 'updated_at',
    sortOrder: sortOrder as 'asc' | 'desc',
    statuses: statuses as StatusEnum[],
  });

  return (
    <VStack h="full" alignItems="stretch" gap="0">
      <Toolbar searchInput={searchInput} onSearchChange={setSearchInput} />
      <HStack flex="1" overflow="hidden" gap="0">
        <Table
          data={applications}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          onRowClick={handleRowClick}
          onRowHover={handleRowHover}
          sorting={sorting}
          setSorting={handleSortingChange}
          onStatusesChange={setStatuses}
          statuses={statuses as StatusEnum[]}
        />
        <Drawer
          isOpen={applicationId !== ''}
          onClose={() => setApplicationId('')}
          selectedApplicationId={applicationId || null}
        />
      </HStack>
    </VStack>
  );
}
