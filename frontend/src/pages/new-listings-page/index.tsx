import { Splitter, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { useListingsQuery } from '@/hooks/listings';
import { useLocalStorage } from '@/hooks/utils/useLocalStorage';

import { Details } from './Details';
import { Footer } from './Footer';
import { IngestionModal, IngestionProvider } from './ingestion-modal';
import { Reference } from './reference';
import { HighlightProvider } from './reference/source';
import { Table } from './Table';
import { Toolbar } from './Toolbar';

export function NewListingsPage() {
  const { listings } = useListingsQuery();
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [splitterSizes, setSplitterSizes] = useLocalStorage(
    'new-listings-splitter-sizes',
    [25, 35, 40]
  );

  const selectedListing = listings.find((listing) => listing.id === selectedListingId) || null;

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  // Sync selections when listings change
  useEffect(() => {
    const selectedKeys = Object.keys(rowSelection);

    const existingIds = new Set(listings.map((l) => l.id));
    const deadKeys = selectedKeys.filter((id) => !existingIds.has(id));

    if (deadKeys.length > 0) {
      setRowSelection((prev) => {
        const next = { ...prev };
        deadKeys.forEach((key) => delete next[key]);
        return next;
      });

      if (selectedListingId && deadKeys.includes(selectedListingId)) {
        setSelectedListingId(null);
      }
    }
  }, [listings, selectedListingId, rowSelection]);

  return (
    <IngestionProvider>
      <HighlightProvider>
        <VStack h="full" w="full" gap="0" alignItems="stretch">
          <Toolbar rowSelection={rowSelection} />
          <Splitter.Root
            panels={[
              { id: 'table', minSize: 15, maxSize: 40 },
              { id: 'details', minSize: 25, maxSize: 60 },
              { id: 'preview', minSize: 25, maxSize: 70 },
            ]}
            size={splitterSizes}
            onResize={(details) => setSplitterSizes(details.size)}
            h="full"
          >
            <Splitter.Panel id="table">
              <Table
                listings={listings}
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                selectedListingId={selectedListingId}
                setSelectedListingId={setSelectedListingId}
              />
            </Splitter.Panel>
            <Splitter.ResizeTrigger id="table:details">
              <Splitter.ResizeTriggerSeparator />
            </Splitter.ResizeTrigger>
            <Splitter.Panel id="details">
              <Details listing={selectedListing} />
            </Splitter.Panel>
            <Splitter.ResizeTrigger id="details:preview">
              <Splitter.ResizeTriggerSeparator />
            </Splitter.ResizeTrigger>
            <Splitter.Panel id="preview">
              <Reference listing={selectedListing} />
            </Splitter.Panel>
          </Splitter.Root>
          <Footer
            selectedCount={selectedCount}
            totalCount={listings.length}
            pendingCount={listings.filter((l) => l.status === 'pending').length}
          />
        </VStack>
        <IngestionModal />
      </HighlightProvider>
    </IngestionProvider>
  );
}
