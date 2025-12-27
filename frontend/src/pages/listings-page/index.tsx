import { Splitter, VStack } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useDebouncedUrlSyncedState } from '@/hooks/utils/useDebouncedUrlSyncedState';
import { useLocalStorage } from '@/hooks/utils/useLocalStorage';
import { useUrlSyncedState } from '@/hooks/utils/useUrlSyncedState';
import { getListing } from '@/services/listings';
import type { ListingSummary } from '@/types/listing';

import { Drawer } from './drawer';
import { Table } from './table';
import { Toolbar } from './Toolbar';

export function ListingsPage() {
  const queryClient = useQueryClient();
  const [searchInput, debouncedSearchInput, setSearchInput] = useDebouncedUrlSyncedState('q', '', {
    type: 'STRING',
    debounceMs: 700,
  });

  const [listingId, setListingId] = useUrlSyncedState('listingId', '', {
    type: 'STRING',
  });

  const [drawerOpenSizes, setDrawerOpenSizes] = useLocalStorage(
    'listings-splitter-sizes',
    [70, 30]
  );

  const isDrawerOpen = Boolean(listingId);

  const handleRowClick = useCallback(
    (listing: ListingSummary) => {
      setListingId(listing.id);
    },
    [setListingId]
  );

  const handleRowHover = useCallback(
    (id: string) => {
      queryClient.prefetchQuery({
        queryKey: ['listing', id],
        queryFn: () => getListing(id),
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
        size={drawerOpenSizes}
        onResize={(details) => {
          if (isDrawerOpen) setDrawerOpenSizes(details.size);
        }}
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
        {isDrawerOpen && (
          <>
            <Splitter.ResizeTrigger id="table:drawer">
              <Splitter.ResizeTriggerSeparator />
            </Splitter.ResizeTrigger>
            <Splitter.Panel id="drawer">
              <Drawer
                onClose={() => setListingId('')}
                selectedListingId={listingId}
                key={listingId}
              />
            </Splitter.Panel>
          </>
        )}
      </Splitter.Root>
    </VStack>
  );
}
