import { HStack, VStack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useDebouncedUrlSyncedState } from '@/hooks/utils/useDebouncedUrlSyncedState';
import { useUrlSyncedState } from '@/hooks/utils/useUrlSyncedState';
import { getApplication } from '@/services/applications';
import type { Application } from '@/types/application';

import Drawer from './drawer';
import Table from './table';
import Toolbar from './Toolbar';

export default function ApplicationsPage() {
  const queryClient = useQueryClient();

  const [searchInput, debouncedSearchInput, setSearchInput] = useDebouncedUrlSyncedState('q', '', {
    type: 'STRING',
    debounceMs: 700,
  });

  const [applicationId, setApplicationId] = useUrlSyncedState('applicationId', '', {
    type: 'STRING',
  });

  const handleRowClick = useCallback(
    (application: Application) => {
      setApplicationId(application.id);
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

  return (
    <VStack h="full" alignItems="stretch" gap="0">
      <Toolbar searchInput={searchInput} onSearchChange={setSearchInput} />
      <HStack flex="1" overflow="hidden" gap="0">
        <Table
          debouncedSearch={debouncedSearchInput}
          onRowClick={handleRowClick}
          onRowHover={handleRowHover}
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
