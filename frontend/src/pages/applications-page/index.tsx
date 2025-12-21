import { VStack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import * as Splitter from '@/components/custom/AnimatedSpliter';
import { useDebouncedUrlSyncedState } from '@/hooks/utils/useDebouncedUrlSyncedState';
import { useLocalStorage } from '@/hooks/utils/useLocalStorage';
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

  const [drawerOpenSizes, setDrawerOpenSizes] = useLocalStorage(
    'applications-splitter-sizes',
    [70, 30]
  );

  const splitterSizes = applicationId !== '' ? drawerOpenSizes : [100, 0];
  const setSplitterSizes = applicationId !== '' ? setDrawerOpenSizes : () => {};

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
      <Splitter.Root
        panels={[
          { id: 'table', minSize: 40 },
          { id: 'drawer', minSize: 30 },
        ]}
        size={splitterSizes}
        onResize={(details) => setSplitterSizes(details.size)}
        h="full"
        w="full"
      >
        <Splitter.Panel id="table">
          <Table
            debouncedSearch={debouncedSearchInput}
            onRowClick={handleRowClick}
            onRowHover={handleRowHover}
          />
        </Splitter.Panel>
        <Splitter.ResizeTrigger id="table:drawer">
          <Splitter.ResizeTriggerSeparator />
        </Splitter.ResizeTrigger>
        <Splitter.Panel id="drawer">
          <Drawer
            onClose={() => setApplicationId('')}
            selectedApplicationId={applicationId || null}
          />
        </Splitter.Panel>
      </Splitter.Root>
    </VStack>
  );
}
